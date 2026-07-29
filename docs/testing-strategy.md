# RoofToGrid — Testing Strategy

Status: Living document
Last updated: 2026-07-29
Traces to: `docs/requirements.md` (AC ids), `docs/design.md`

---

## 1. Principles

1. **Pure domain logic gets exhaustive unit tests.** Sizing, quote scoring, milestone derivation, and
   performance math are pure functions with no I/O (`docs/design.md` §1.2). They are the highest-risk,
   cheapest-to-test code in the product, because a wrong number destroys trust and never throws an error.
2. **Every acceptance criterion maps to at least one named test.** Test titles carry the AC id, so a failing
   test points at a requirement, not just a line of code.
3. **Money and energy numbers are asserted exactly.** No "roughly". Rounding rules are part of the contract
   (AC-B1, AC-A11, AC-A13).
4. **Ownership is tested as a first-class behaviour.** For every user-scoped resource there is a
   cross-tenant test asserting 404, not 403 (AC-C8, NFR-S6).
5. **Test the boundary once, the logic many times.** Integration tests confirm wiring, validation, and
   status codes; they do not re-verify arithmetic.

## 2. Test pyramid and tooling

| Level | Tool | Scope | Count target | Runtime |
|---|---|---|---|---|
| Unit (domain) | Vitest | `backend/src/domain/**` pure functions | ~120 | < 2 s |
| Unit (helpers) | Vitest | validation schemas, storage key builder, EMI math, formatters | ~30 | < 2 s |
| Integration (API) | Vitest + Supertest + Postgres | routes → service → real DB, real local storage driver | ~60 | < 60 s |
| Component (frontend) | Vitest + Testing Library | forms, comparison table, milestone row, wizard steps | ~25 | < 15 s |
| E2E | Playwright | 4 journey happy paths + 2 failure paths | 6 specs | < 4 min |

Commands (see README):

```
backend:  npm test            # unit + integration          (implemented)
          npm run test:unit   # domain only, no DB required  (implemented)
frontend: npm run typecheck   # strict TS across app + lib   (implemented)
          npm run build       # catches route/RSC errors     (implemented)
          npm test            # component tests              (planned, Phase 1 hardening)
e2e:      npm run test:e2e    # Playwright journeys          (planned, Phase 1 hardening)
```

The frontend component and Playwright layers are specified below but not yet wired up; typecheck plus a
production build are the gates in place today. Adding them does not change any of the target counts.

## 3. Unit tests — domain

### 3.1 Sizing calculator (`domain/sizing.ts`)

| Test | AC |
|---|---|
| roof capacity uses 100/80/90 sqft per kWp by roof type | AC-A7 |
| shading derate multiplies capacity (1.00 / 0.92 / 0.80 / 0.65) | AC-A7 |
| suitability returns one of five ratings and ≥1 reason for every input | AC-A8 |
| heavy shading ⇒ `UNSUITABLE` with no scenarios | AC-A9 |
| usable area 59 sqft ⇒ `UNSUITABLE`; 60 sqft ⇒ rated, scenarios present | AC-A9 boundary |
| scenarios sorted ascending, rounded to 0.5 kWp, none exceed derated capacity | AC-A10 |
| duplicate sizes collapse (small roof where all three scenarios converge) | AC-A10 |
| generation = size × yield × orientation × shading, integer-rounded | AC-A11 |
| north-facing roof produces 72% of south generation for identical size | AC-A11 |
| subsidy table: 0.9 → 0; 1 → 30k; 2 → 60k; 3 → 78k; 5 → 78k; 10 → 78k | AC-A12 |
| payback = netCost / annualSavings to 1 decimal | AC-A13 |
| zero/negative annual savings ⇒ payback `null`, never `Infinity`/`NaN` | AC-A13 |
| response carries `assumptionSetId`, yields, cost bands, escalation, disclaimer | AC-A14 |
| lifetime savings apply escalation and degradation over 25 years and exceed 25 × year-1 | — |
| savings are capped by consumption × self-consumption ratio | design §3.2 |

Invariant checks run as deterministic sweeps rather than a property-testing library, so the suite stays
dependency-free and reproducible: generation is monotonically non-decreasing across 0.5–20 kWp; payback is
positive or null across a consumption × roof-area grid; scenario sizes never exceed derated roof capacity.
(A `fast-check` layer remains a reasonable Phase 2 addition once the calculators gain battery and time-of-use
branches.)

### 3.2 Quote comparison (`domain/quoteScoring.ts`)

| Test | AC |
|---|---|
| price/kWp = total / kWp, rupee-rounded | AC-B1 |
| tier matrix: TOPCon+15+10 ⇒ PREMIUM; MONO_PERC+12+7 ⇒ STANDARD; POLY ⇒ BASIC | AC-B2 |
| tier boundaries: one year below any PREMIUM threshold downgrades to STANDARD | AC-B2 |
| value score in [0,100] for all inputs; breakdown weights sum to 100 | AC-B3 |
| identical quotes score identically; strictly better warranty scores strictly higher | AC-B3 |
| suspiciously cheap quote does not outscore a fair one on price component | AC-B3/B4 |
| each red-flag threshold fires at its boundary and not one unit inside it | AC-B4 |
| quotes of different kWp compared purely on per-kWp / per-year metrics | AC-B5 |
| installer generation used when present, `generationSource = INSTALLER`; else `PLATFORM` | AC-B6 |
| EMI math: financed total for known principal/rate/tenure matches reference value | AC-B7 |
| 0% interest loan financed total equals cash total | AC-B7 edge |
| payback for LOAN computed on financed total, higher than cash payback | AC-B7 |

### 3.3 Milestones (`domain/milestones.ts`)

| Test | AC |
|---|---|
| template has 9 keys in the specified order with sequence 1..9 | AC-C2 |
| progress percent = round(completed/total × 100) across 0, partial, all | AC-C5 |
| current stage = first non-completed title; all complete ⇒ "Commissioned" | AC-C6 |
| completing `NET_METERING_ACTIVE` derives `COMMISSIONED` + commissioned date | AC-C7 |
| completing a later milestone out of order does not skip current-stage logic | AC-C6 |

### 3.4 Performance (`domain/performance.ts`)

| Test | AC |
|---|---|
| seasonality factors sum to 1.0 (±1e-9) and monthly projection ≠ annual/12 | AC-D2 |
| variance percent to 1 decimal; −15.1% ⇒ `UNDERPERFORMING`, −14.9% ⇒ `WATCH` | AC-D3 |
| zero projection does not divide by zero | AC-D3 edge |
| savings capped at baseline units × tariff when generation exceeds consumption | AC-D4 |
| warranty status: 91 days out `ACTIVE`, 90 `EXPIRING_SOON`, past `EXPIRED` | AC-D5 |
| leap-year and month-end start dates compute expiry correctly | AC-D5 edge |

## 4. Integration tests — API

Run against a real Postgres (Docker locally, ephemeral database in CI). Each spec gets a fresh schema via
`prisma migrate deploy`; tests truncate between cases. Storage uses the `local` driver writing to a temp dir,
so upload paths are genuinely exercised (AC-E3).

Implementation note: `backend/tests/integration/api.test.ts` probes the database in `beforeAll` and skips the
database-backed cases when nothing is reachable, while still exercising the public surface (health, public
sizing, validation) through the real Express app. That keeps `npm test` green on a laptop with no Postgres and
makes CI failures mean something. Current suite: 95 unit tests, 15 integration cases.

### 4.1 Auth and tenancy
- register → 201 with token; duplicate email → 409 `EMAIL_TAKEN` (AC-A2)
- no response body on any endpoint contains `passwordHash` (AC-A3)
- login with wrong password and login with unknown email return the same message (NFR-S1)
- refresh rotates the token; replaying a used refresh token revokes the family and returns 401 (NFR-S2)
- protected route without/with malformed/with expired token → 401
- change-password invalidates existing refresh tokens

### 4.2 Bills and roof
- bill upload accepts PDF/JPEG/PNG/WebP; `.exe` and `.svg` → 415 `UNSUPPORTED_FILE_TYPE` (AC-A4)
- 11 MB file → 413 (AC-A4)
- missing `billMonth` or `unitsKwh <= 0` → 422 (AC-A5)
- `tariffPerKwh` derived from amount ÷ units when omitted (AC-A5)
- `GET /bills/stats` returns mean of last 12 months and units-weighted tariff (AC-A6)
- duplicate `(userId, billMonth)` → 409

### 4.3 Sizing
- `POST /sizing/estimate` without auth → 200, no ids, no persistence (AC-A1)
- 31st public estimate call in a window → 429 (NFR-S5)
- `POST /sizing/runs` persists run + scenarios; `GET` returns them (AC-A15)
- another user's run id → 404 (AC-A15)

### 4.4 Quotes
- create → derived fields persisted (price/kWp, tier, score, breakdown, red flags) (AC-B9)
- update recomputes derived fields
- `GET /quotes/comparison` returns per-quote metrics and best-in-column flags (AC-B5)
- select marks exactly one quote selected
- deleting a quote referenced by a project keeps the project with denormalized fields intact (AC-B8)

### 4.5 Projects and milestones
- `from-quote` creates project + 9 milestones atomically; forced failure leaves zero rows (AC-C1)
- milestone update to `COMPLETED` without date defaults to today; reverting clears it (AC-C4)
- completing `NET_METERING_ACTIVE` flips project to `COMMISSIONED` (AC-C7)
- cross-tenant project read/update/delete → 404 (AC-C8)
- invalid status value → 422

### 4.6 Monitoring
- posting the same `(project, month)` twice updates rather than duplicates (AC-D1)
- performance endpoint returns 12-point series with projection, variance, health, savings (AC-D2–D4)
- warranty list returns computed status and days remaining (AC-D5)
- service request `OPEN → IN_PROGRESS → RESOLVED` stamps `resolvedAt` (AC-D6)

### 4.7 Documents
- upload stores an object at `u/{userId}/{yyyy}/{mm}/{uuid}.{ext}`; a filename containing `../` cannot
  influence the key (AC-E3, path-traversal regression)
- every category value accepted; unknown category → 422 (AC-E1)
- disallowed MIME and oversize rejected (AC-E2)
- download by owner streams the file; by another user → 404; signed URL TTL ≤ 300 s (AC-E4)
- delete removes both row and object; simulated storage failure logs and still leaves no user-visible
  orphan (AC-E5)
- `milestoneId` from another user's project → 400 (AC-E6)
- filtering by category / project / milestone / quote returns only matching, owned rows

## 5. Frontend component tests

- Onboarding wizard: step validation blocks advance; entered data survives remount (NFR-U3).
- Quote form: required-field errors, numeric coercion, derived price/kWp preview.
- Comparison table: renders best-in-column highlights; collapses to cards under 768 px (NFR-U1).
- Scenario card: shows null payback as "Not recoverable at current usage", never "Infinity".
- Milestone row: status change fires the right payload; date field disabled until status ≠ `NOT_STARTED`.
- Document uploader: rejects oversize/unsupported files client-side before upload.
- Assumptions panel and disclaimer render on every estimate screen (NFR-U4).
- Accessibility smoke: every input has an associated label; interactive elements are keyboard reachable;
  `axe` reports no critical violations on the six main screens. Full WCAG conformance still needs manual
  assistive-technology testing and expert review (NFR-U5).

## 6. End-to-end (Playwright)

| Spec | Flow |
|---|---|
| `guest-sizing.spec` | landing → public calculator → scenarios visible → registration prompt (Journey A) |
| `onboarding.spec` | register → profile → bill entry → roof form → saved sizing run (Journey A) |
| `quotes.spec` | enter 3 quotes → comparison table → red flag visible → select best (Journey B) |
| `project.spec` | create project from quote → 9 milestones → complete through net metering → status COMMISSIONED (Journey C) |
| `monitoring.spec` | log 3 months of generation → variance and savings shown → add warranty (Journey D) |
| `documents.spec` | upload to a milestone → appears in vault filtered by project → download → delete (Journey E) |

E2E runs against a seeded database using the demo account from `prisma/seed.ts` (NFR-O3), with uploads on the
local storage driver.

## 7. Non-functional verification

| Requirement | How it is checked |
|---|---|
| NFR-P1 (< 50 ms pure compute) | benchmark test asserting 1,000 sizing runs complete under 50 ms total budget |
| NFR-P4 (pagination) | integration test that every list endpoint honours `page`/`pageSize` and caps at 100 |
| NFR-S3 (validation everywhere) | a route-coverage test asserting each mutating route has a Zod schema attached |
| NFR-S5 (headers, CORS, limits) | integration assertions on `helmet` headers, disallowed origin, 429 behaviour |
| NFR-S8 (no stack leakage) | forced 500 in production mode returns a generic body with a request id |
| NFR-O1 (health) | `/health` 200 always; `/health/ready` 503 when DB unreachable |

## 8. CI pipeline

```
push / PR:
  1. install (npm ci, cached)
  2. lint + typecheck (backend, frontend)
  3. backend unit tests            (no services required)
  4. spin ephemeral Postgres → prisma migrate deploy → backend integration tests
  5. frontend component tests
  6. build backend + frontend
  7. E2E against the built app with a seeded DB
  8. upload coverage
main:
  9. migrate + deploy API (Render), deploy frontend (Vercel), smoke-test /health/ready and landing
```

Coverage gates: `src/domain/**` ≥ 95% lines and branches (this is the trust surface); `src/modules/**` ≥ 80%;
overall backend ≥ 80%. Coverage is a floor, not a goal — the AC mapping table is the real completeness check.

## 9. Manual test checklist before each release

- Walk all four journeys on a 360 px viewport.
- Confirm every estimate screen shows assumptions and the disclaimer.
- Confirm a second account cannot see the first account's documents, projects, or quotes.
- Confirm the storage bucket is private by attempting a direct public URL fetch.
- Confirm `prisma migrate deploy` runs clean against a copy of production schema.
