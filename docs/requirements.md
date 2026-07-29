# RoofToGrid — Requirements

Status: Living document (Phase 1 / MVP)
Last updated: 2026-07-29
Owner: Product + Engineering

---

## 1. Product overview and vision

**RoofToGrid** is a homeowner-focused rooftop-solar planning and installer-matching platform. It guides a
user from "I got a scary electricity bill" all the way to "my system is live, exporting to the grid, and I
can see my savings".

The product exists because the rooftop solar buying journey is opaque:

- Homeowners cannot tell whether a quote is fair, because quotes are formatted differently and hide the
  numbers that matter (price per kWp, equipment tier, real warranty terms).
- Sizing advice is either a sales pitch or an engineering exercise that homeowners cannot follow.
- After signing, the project disappears into a black box of site surveys, DISCOM applications, net-metering
  approvals, and subsidy paperwork.
- After commissioning, nobody checks whether the system actually produces what was promised.

### Vision statement

> Every rooftop solar decision should be made with clean numbers, in plain language, and every project
> should be trackable from the first bill to the last warranty year.

### Product principles

1. **Transparency over persuasion.** Show the assumptions behind every number. Never present a single
   "magic" figure without the inputs that produced it.
2. **Conservative by default.** Under-promise generation and savings. A pleasant surprise builds trust; an
   optimistic estimate destroys it.
3. **Homeowner language.** "How much will my bill drop?" not "specific yield in kWh/kWp/annum".
4. **Red flags are a feature.** If a quote is suspiciously cheap or a warranty is unusually short, say so.
5. **Designed for integration, shipped without it.** Phase 1 is rule-based and manual, but every calculation
   and workflow sits behind an interface that a real DISCOM API, design engine, or inverter portal can
   replace without a rewrite.

### MVP geography

India first (INR, kWp, DISCOM terminology, PM Surya Ghar residential subsidy rules). The calculation engine
takes a region parameter and a named assumption set so other markets can be added without code forks.

---

## 2. Personas

### 2.1 Priya — the Curious Homeowner (primary)

| Attribute | Detail |
|---|---|
| Context | Owns a 2-floor independent house in a tier-1/tier-2 Indian city |
| Bill | ₹4,000–₹9,000/month, 350–800 units, occasionally hit by slab jumps |
| Technical depth | Low. Knows "kilowatt" as a word, not as a unit |
| Trigger | A neighbour installed solar; a WhatsApp forward about 78,000 subsidy |
| Goal | Find out whether her roof is suitable and whether the math works |
| Fear | Being upsold a system twice the size she needs |
| Success | "A 5 kW system costs about ₹X after subsidy, saves about ₹Y a year, pays back in about Z years, and my roof can take it." |

**Jobs to be done:** understand suitability, get a defensible size range, see payback, know what to ask
installers.

### 2.2 Rahul — the Decisive Buyer (primary)

| Attribute | Detail |
|---|---|
| Context | Already decided to go solar; collecting quotes |
| Inputs | 2–4 quotes as PDFs, WhatsApp images, or a salesperson's notebook page |
| Technical depth | Medium. Googles panel brands, does not know what TOPCon means |
| Goal | Pick the best quote, not just the cheapest |
| Fear | Overpaying, or saving ₹20,000 upfront on an inverter that dies in year 4 |
| Success | A single table where all quotes are expressed in the same units, with a score he can argue with |

**Jobs to be done:** normalize quotes, compare price/kWp and warranties, spot red flags, negotiate.

### 2.3 Meera — the Engaged Solar Owner (primary)

| Attribute | Detail |
|---|---|
| Context | System commissioned 8 months ago |
| Inputs | Monthly bills, occasional inverter app screenshots |
| Technical depth | Medium-low, but numerate |
| Goal | Confirm the system performs as promised and keep paperwork findable |
| Fear | A silent underperformance she only discovers after the warranty lapses |
| Success | "Generation is 6% below projection this quarter; inverter warranty expires in 2031; here is the AMC contract." |

**Jobs to be done:** track generation vs projection, track savings vs pre-solar baseline, store warranties
and serials, raise service requests.

### 2.4 Solar Sunrise Energy — Installer / EPC Partner (secondary, Phase 2)

Wants qualified leads, a standard proposal template, and a reputation score based on delivered performance
rather than marketing. Needs a pipeline view and homeowner messaging. **Not implemented in MVP**; the data
model reserves `User.role = INSTALLER` and an `installerId` extension point on `Quote`/`Project`.

---

## 3. User stories and acceptance criteria

Story IDs are referenced from code comments, tests, and `docs/design.md`. Format: `US-<area>-<n>`.

### 3.1 Journey A — "Should I go solar?" (discovery and sizing)

| ID | Story |
|---|---|
| US-A1 | As a visitor, I can run a sizing estimate without creating an account, so I can judge value before signing up. |
| US-A2 | As a homeowner, I can register with email and password and log in, so my data persists. |
| US-A3 | As a homeowner, I can save my location (city, state, pincode) and DISCOM to my profile, so estimates use the right assumptions. |
| US-A4 | As a homeowner, I can upload my electricity bill as a PDF or image and have it stored against my account. |
| US-A5 | As a homeowner, I can manually enter monthly units, bill amount, and tariff for one or more months, because MVP does not read my bill automatically. |
| US-A6 | As a homeowner, I can describe my roof (type, usable area, orientation, tilt, shading, photos) through a guided form. |
| US-A7 | As a homeowner, I get a conservative roof suitability rating with reasons, so I know if solar is viable at all. |
| US-A8 | As a homeowner, I get 2–3 system size scenarios (Conservative / Optimal / Max roof) with generation, cost, subsidy, savings, and payback. |
| US-A9 | As a homeowner, I can see the assumptions behind every number and know they are estimates. |
| US-A10 | As a homeowner, my sizing runs are saved so I can revisit them. |

**Acceptance criteria — AC-A (sizing)**

- **AC-A1** `POST /api/v1/sizing/estimate` returns scenarios for an unauthenticated caller given
  `avgMonthlyUnits` and `tariffPerKwh`; the response contains no user-identifying data and is rate limited.
- **AC-A2** Registration rejects a duplicate email with HTTP 409 and a machine-readable `code`.
- **AC-A3** Passwords are stored only as bcrypt hashes (cost ≥ 10); no endpoint ever returns `passwordHash`.
- **AC-A4** Bill upload accepts `application/pdf`, `image/jpeg`, `image/png`, `image/webp` up to 10 MB;
  anything else returns HTTP 415 with `code = UNSUPPORTED_FILE_TYPE`.
- **AC-A5** A bill summary requires `billMonth` (`YYYY-MM`) and `unitsKwh > 0`; `tariffPerKwh` is derived as
  `billAmount / unitsKwh` when omitted and both others are present.
- **AC-A6** Given 3+ months of bill summaries, the sizing wizard pre-fills `avgMonthlyUnits` with the mean of
  the last 12 months and `tariffPerKwh` with the units-weighted average.
- **AC-A7** Roof capacity is `usableAreaSqft / areaPerKwpSqft` where area per kWp is 100 (flat), 80 (sloped),
  90 (mixed), then multiplied by a shading derate (none 1.00, light 0.92, moderate 0.80, heavy 0.65).
- **AC-A8** Suitability is `EXCELLENT | GOOD | FAIR | POOR | UNSUITABLE` and always ships with at least one
  human-readable reason string.
- **AC-A9** Heavy shading or usable area below 60 sqft yields `UNSUITABLE` and suppresses scenario cards in
  favour of an explanation.
- **AC-A10** Scenarios are ordered ascending by `systemSizeKwp`, sizes are rounded to 0.5 kWp, and no
  scenario exceeds derated roof capacity.
- **AC-A11** `annualGenerationKwh = systemSizeKwp × specificYield × orientationFactor × shadingDerate`,
  rounded to the nearest integer.
- **AC-A12** Residential subsidy follows PM Surya Ghar static rules: ₹30,000/kW for the first 2 kW, ₹18,000
  for the 3rd kW, hard cap ₹78,000; 0 when `systemSizeKwp < 1`.
- **AC-A13** `paybackYears = netCost / annualSavings`, rounded to 1 decimal, and is `null` when
  `annualSavings <= 0` rather than infinite.
- **AC-A14** Every sizing response includes an `assumptions` object with `assumptionSetId`, `specificYield`,
  cost bands, tariff escalation, and a `disclaimer` string.
- **AC-A15** An authenticated `POST /api/v1/sizing/runs` persists the run and its scenarios and returns an id
  retrievable via `GET /api/v1/sizing/runs/:id`; another user requesting that id receives HTTP 404.
- **AC-A16** No scenario is ever proposed below 0.5 kWp, the smallest system worth installing. A roof that
  clears the 60 sqft floor but fits less than 0.5 kWp after derating is reported `UNSUITABLE` with a reason.
  Scenario cards state that systems under 1 kWp do not qualify for the residential subsidy.

### 3.2 Journey B — "Compare installer quotes" (decision)

| ID | Story |
|---|---|
| US-B1 | As a buyer, I can enter a quote through a structured form (installer, kWp, price, brands, warranties, financing). |
| US-B2 | As a buyer, I can attach the original quote PDF to the quote record. |
| US-B3 | As a buyer, I can edit or delete a quote I entered wrongly. |
| US-B4 | As a buyer, I see all my quotes side by side with price/kWp, equipment tier, warranties, projected savings, and payback. |
| US-B5 | As a buyer, I see a value score per quote and the breakdown that produced it. |
| US-B6 | As a buyer, I see explicit red flags (implausibly low price, short warranties, missing net-metering scope). |
| US-B7 | As a buyer, I can see financing-adjusted total cost for loan quotes so EMI deals are comparable to cash. |
| US-B8 | As a buyer, I can mark a quote as selected and create a project from it in one click. |

**Acceptance criteria — AC-B (quotes)**

- **AC-B1** `pricePerKwp = totalPrice / systemSizeKwp`, rounded to the nearest rupee.
- **AC-B2** Equipment tier is derived from panel technology and warranty years:
  `PREMIUM` (TOPCon/HJT/N-type **and** panel product warranty ≥ 15 **and** inverter warranty ≥ 10),
  `STANDARD` (Mono PERC **and** panel ≥ 12 **and** inverter ≥ 7), otherwise `BASIC`.
- **AC-B3** Value score is 0–100 from four weighted components — price 40, equipment 25, warranty 25,
  financing/scope transparency 10 — and the response always includes the per-component breakdown.
- **AC-B4** Red flags are raised when: `pricePerKwp < 35000` (too-good-to-be-true),
  `pricePerKwp > 85000` (overpriced), panel product warranty `< 10`, inverter warranty `< 5`,
  workmanship warranty `< 2`, `includesNetMetering = false`, or `includesStructure = false`.
- **AC-B5** Comparison rows for quotes with different system sizes remain comparable because every derived
  metric is per-kWp or per-year.
- **AC-B6** Projected savings per quote use the quote's own `expectedAnnualGenerationKwh` when the installer
  supplied it, otherwise the platform estimate; the response states which source was used via
  `generationSource = INSTALLER | PLATFORM`.
- **AC-B7** For `financingType = LOAN`, `financedTotalCost` uses standard EMI math over `tenureMonths` at
  `interestRatePct`, and payback is computed on the financed total.
- **AC-B8** Deleting a quote that a project references does not delete the project; the project retains its
  denormalized `installerName`, `systemSizeKwp`, and `contractValue`.
- **AC-B9** Scores and tiers are recomputed and persisted on every create/update so historical comparisons
  are auditable.

### 3.3 Journey C — "Track my project end-to-end" (execution)

| ID | Story |
|---|---|
| US-C1 | As a buyer, I can create a project from a selected quote, pre-filled with installer, size, and value. |
| US-C2 | As a homeowner, my new project is seeded with the standard 9-milestone lifecycle in the right order. |
| US-C3 | As a homeowner, I can set each milestone's status, planned date, completed date, and notes. |
| US-C4 | As a homeowner, I see overall project progress as a percentage and a current-stage label. |
| US-C5 | As a homeowner, I can attach documents to a specific milestone (e.g. DISCOM approval letter). |
| US-C6 | As a homeowner, I can mark the project commissioned, which unlocks the monitoring view. |

**Acceptance criteria — AC-C (projects)**

- **AC-C1** `POST /api/v1/projects/from-quote/:quoteId` creates the project and all milestones in a single
  database transaction; a failure leaves no partial project.
- **AC-C2** Seeded milestone keys, in order: `INQUIRY`, `SITE_SURVEY`, `DESIGN_CONFIRMED`,
  `DISCOM_APPLICATION_SUBMITTED`, `DISCOM_APPROVED`, `INSTALLATION_SCHEDULED`, `INSTALLATION_COMPLETE`,
  `NET_METERING_ACTIVE`, `SUBSIDY_RECEIVED`.
- **AC-C3** Milestone status is one of `NOT_STARTED | IN_PROGRESS | COMPLETED | BLOCKED`.
- **AC-C4** Setting status to `COMPLETED` without a `completedDate` defaults it to today; clearing the status
  back to `NOT_STARTED` clears `completedDate`.
- **AC-C5** `progressPercent = round(completedMilestones / totalMilestones × 100)`.
- **AC-C6** `currentStage` is the title of the first milestone that is not `COMPLETED`, or `Commissioned`
  when all are complete.
- **AC-C7** When `NET_METERING_ACTIVE` is completed, project status becomes `COMMISSIONED` and
  `commissionedDate` is set from that milestone.
- **AC-C8** A user can only read or mutate projects and milestones they own; other users get HTTP 404, never
  HTTP 403 with data leakage.

### 3.4 Journey D — "Monitor my system and manage warranties" (operations)

| ID | Story |
|---|---|
| US-D1 | As a solar owner, I can enter monthly generation readings and bill amounts. |
| US-D2 | As a solar owner, I see actual generation vs projection per month and a variance percentage. |
| US-D3 | As a solar owner, I see estimated bill savings against my pre-solar baseline. |
| US-D4 | As a solar owner, I can record warranties with brand, serial number, start date, and duration, and see days remaining. |
| US-D5 | As a solar owner, I can raise a service request with severity and track it to resolution. |

**Acceptance criteria — AC-D (monitoring)**

- **AC-D1** `(projectId, month)` is unique for generation logs; posting the same month again updates the row.
- **AC-D2** Monthly projection is the annual projection distributed by a 12-month seasonality curve that
  sums to 1.0, not a flat 1/12.
- **AC-D3** `variancePercent = (actual - projected) / projected × 100`, rounded to 1 decimal; a variance
  below -15% is surfaced as an `UNDERPERFORMING` health status.
- **AC-D4** Savings for a month is `min(generatedKwh, baselineMonthlyUnits) × tariffPerKwh` so export credit
  is never over-counted at retail tariff.
- **AC-D5** Warranty expiry is `startDate + durationYears`; a warranty within 90 days of expiry is flagged
  `EXPIRING_SOON`, past expiry `EXPIRED`.
- **AC-D6** Service requests move `OPEN → IN_PROGRESS → RESOLVED`; setting `RESOLVED` stamps `resolvedAt`.

### 3.5 Journey E — Document vault (cross-cutting)

| ID | Story |
|---|---|
| US-E1 | As a homeowner, I can upload a document and tag it with a category. |
| US-E2 | As a homeowner, I can associate a document with a project, a milestone, a quote, or nothing. |
| US-E3 | As a homeowner, I can list, filter, download, and delete my documents. |
| US-E4 | As a homeowner, I can be sure nobody else can reach my documents. |

**Acceptance criteria — AC-E (documents)**

- **AC-E1** Categories: `BILL | QUOTE | CONTRACT | DESIGN_DRAWING | DISCOM_APPROVAL | NET_METERING |
  SUBSIDY | WARRANTY | INVOICE | PHOTO | OTHER`.
- **AC-E2** Allowed MIME types: PDF, JPEG, PNG, WebP; max size 10 MB (configurable via `MAX_UPLOAD_MB`).
- **AC-E3** Storage keys are namespaced `u/{userId}/{yyyy}/{mm}/{uuid}.{ext}`; original filenames are stored
  as metadata only and never used as a path.
- **AC-E4** Downloads are served through an authenticated backend endpoint that verifies ownership and then
  streams the file or issues a short-lived (≤ 5 min) signed URL. Buckets are never public.
- **AC-E5** Deleting a document removes both the database row and the stored object; a storage failure is
  logged and does not leave an orphaned row that the user can no longer see.
- **AC-E6** `milestoneId` on a document must belong to a project owned by the same user, else HTTP 400.

---

## 4. Non-functional requirements

### 4.1 Usability

- **NFR-U1** All primary flows are usable on a 360 px-wide screen; the quote comparison table degrades to
  stacked cards below 768 px.
- **NFR-U2** No jargon without a plain-language gloss on first use (kWp, DISCOM, net metering, specific yield).
- **NFR-U3** Multi-step wizards persist entered data server-side per step; a refresh must not lose input.
- **NFR-U4** Every estimate screen shows an assumptions disclosure and a "these are estimates" disclaimer.
- **NFR-U5** Accessibility: semantic landmarks, labelled form controls, keyboard-reachable interactive
  elements, visible focus rings, ≥ 4.5:1 text contrast, and status changes announced via `aria-live`.
  Full WCAG conformance additionally requires manual assistive-technology testing and expert review, which
  is out of scope for the MVP build itself.

### 4.2 Performance

- **NFR-P1** Sizing and quote-scoring computations are pure, in-process, and complete in < 50 ms server-side.
- **NFR-P2** p95 read API latency < 400 ms at 50 concurrent users on Render's starter tier and Supabase's
  free/small tier.
- **NFR-P3** Frontend LCP < 2.5 s on a 4G connection for landing and dashboard.
- **NFR-P4** All list endpoints are paginated (`page`, `pageSize`, default 20, max 100) and every foreign key
  used for filtering is indexed.
- **NFR-P5** Uploads stream to storage; the API process never buffers more than `MAX_UPLOAD_MB` per request.

### 4.3 Security

- **NFR-S1** bcrypt password hashing, cost ≥ 10; generic error text on failed login (no user enumeration).
- **NFR-S2** Short-lived JWT access tokens (15 min) plus rotating refresh tokens (30 days) stored hashed in
  the database and revocable; refresh reuse invalidates the family.
- **NFR-S3** Every request body, query, and param is validated with Zod at the edge; unvalidated input never
  reaches a service.
- **NFR-S4** Prisma parameterizes all queries; no string-concatenated SQL.
- **NFR-S5** `helmet`, strict CORS allowlist from `CORS_ORIGINS`, and rate limits (global, plus stricter on
  auth and public sizing).
- **NFR-S6** Ownership is enforced in the data layer on every read and write; tenancy is never implied by the
  client.
- **NFR-S7** Secrets come only from environment variables; `.env` is git-ignored and `.env.example` carries
  no real values.
- **NFR-S8** Structured JSON logs with request ids; PII and secrets are redacted; stack traces are never sent
  to clients in production.
- **NFR-S9** Storage buckets are private; access is always mediated by an ownership check.

### 4.4 Extensibility

- **NFR-X1** Sizing assumptions live in a versioned, named assumption set (`assumptionSetId`) persisted with
  every run, so historical results stay reproducible when defaults change.
- **NFR-X2** Every future external dependency sits behind an interface with a stub implementation today:
  `StorageProvider`, `YieldEngine`, `DiscomProvider`, `SubsidyProvider`, `InverterMonitoringProvider`,
  `QuoteParser`, `NotificationProvider`.
- **NFR-X3** Provider selection is environment-driven (`STORAGE_DRIVER`, `YIELD_ENGINE`, …); adding a real
  implementation must not require touching route or service code.
- **NFR-X4** Backend is modular by domain (`src/modules/<domain>/{routes,service,schema}.ts`) with pure
  domain logic isolated in `src/domain/` and no framework imports there.
- **NFR-X5** API is versioned under `/api/v1`.
- **NFR-X6** The data model reserves multi-market fields (`currency`, `region`) and installer-side keys
  without requiring them in Phase 1.

### 4.5 Reliability and operations

- **NFR-O1** `GET /health` (liveness) and `GET /health/ready` (database + storage reachability).
- **NFR-O2** Schema changes ship as Prisma migrations, applied on deploy; no destructive migration without an
  explicit backup step.
- **NFR-O3** A seed script produces a demo account covering all four journeys.
- **NFR-O4** Deployable as: frontend on Vercel, API on Render, Postgres and object storage on Supabase, on a
  custom domain with TLS.

---

## 5. Explicitly out of scope for MVP

| Not in MVP | Designed for (see integration-strategy.md) |
|---|---|
| OCR / LLM extraction of bills and quote PDFs | `QuoteParser`, `BillParser` interfaces |
| Live DISCOM application status and subsidy status | `DiscomProvider`, `SubsidyProvider` |
| Live inverter/smart-meter generation feeds | `InverterMonitoringProvider` |
| Professional 3D shading and yield simulation | `YieldEngine` (rule-based implementation today) |
| Installer-side portal, bidding, marketplace payments | `User.role = INSTALLER`, `installerId` keys |
| Battery storage and time-of-use optimisation | Scenario model accepts extra components |
| Payments, invoicing, loan origination | Financing fields captured, no transactions |
| Email/SMS notifications | `NotificationProvider` stub |

---

## 6. Traceability

| Area | Stories | Acceptance criteria | Primary code |
|---|---|---|---|
| Auth & profile | US-A2, US-A3 | AC-A2, AC-A3 | `backend/src/modules/auth`, `modules/profile` |
| Bills | US-A4, US-A5 | AC-A4–AC-A6 | `backend/src/modules/bills` |
| Roof & sizing | US-A1, US-A6–US-A10 | AC-A7–AC-A16 | `backend/src/domain/sizing.ts`, `modules/sizing`, `modules/roof` |
| Quotes | US-B1–US-B8 | AC-B1–AC-B9 | `backend/src/domain/quoteScoring.ts`, `modules/quotes` |
| Projects | US-C1–US-C6 | AC-C1–AC-C8 | `backend/src/domain/milestones.ts`, `modules/projects` |
| Monitoring | US-D1–US-D5 | AC-D1–AC-D6 | `backend/src/domain/performance.ts`, `modules/monitoring` |
| Documents | US-E1–US-E4 | AC-E1–AC-E6 | `backend/src/modules/documents`, `src/storage` |
