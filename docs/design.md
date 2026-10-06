# RoofToGrid — Technical Design

Status: Living document (Phase 1 / MVP)
Last updated: 2026-07-29
Traces to: `docs/requirements.md`

---

## 1. Architecture

### 1.1 Deployment topology

```
                             ┌──────────────────────────────┐
        Browser ─── HTTPS ──▶│  Vercel (Next.js 16 / React) │
   (custom domain            │  app.rooftogrid.com          │
    app.rooftogrid.com)      │  • App Router, RSC shell     │
                             │  • Tailwind UI               │
                             │  • Client-side auth store    │
                             └──────────────┬───────────────┘
                                            │  JSON / REST  (Bearer access token,
                                            │               refresh cookie)
                                            ▼
                             ┌──────────────────────────────┐
                             │  Render Web Service (Node)   │
                             │  api.rooftogrid.com          │
                             │  Express 5 + TypeScript      │
                             │  ┌────────────────────────┐  │
                             │  │ routes (modules/*)     │  │
                             │  │ services (modules/*)   │  │
                             │  │ pure domain (domain/*) │  │
                             │  │ providers (storage/,   │  │
                             │  │   integrations/)       │  │
                             │  └────────────────────────┘  │
                             └───┬───────────────────┬──────┘
                                 │ Prisma (pooled)   │ StorageProvider
                                 ▼                   ▼
                   ┌───────────────────────┐  ┌────────────────────────┐
                   │ Supabase Postgres 16  │  │ Supabase Storage       │
                   │ • pgbouncer :6543 app │  │ private bucket         │
                   │ • direct   :5432 mig  │  │ "rooftogrid-documents" │
                   └───────────────────────┘  └────────────────────────┘

   Future integration seams (interfaces exist, stub implementations today):
     YieldEngine ─────────▶ PVGIS / NREL PVWatts / SolarAPI
     DiscomProvider ──────▶ state DISCOM portals
     SubsidyProvider ─────▶ PM Surya Ghar / National Portal
     InverterMonitoring ──▶ SolarEdge / Growatt / Deye / smart meters
     QuoteParser ─────────▶ OCR + LLM extraction
     NotificationProvider▶ Resend / MSG91
```

### 1.2 Layering rules (NFR-X4)

| Layer | Path | May import | Must not import |
|---|---|---|---|
| Pure domain | `src/domain/**` | nothing but TS stdlib + types | express, prisma, env |
| Providers | `src/storage/**`, `src/integrations/**` | domain, env, SDKs | modules |
| Services | `src/modules/*/service.ts` | domain, providers, prisma | express `req`/`res` |
| Routes | `src/modules/*/routes.ts` | services, schemas, middleware | prisma directly |

Domain logic being framework-free is what makes NFR-P1 (sub-50 ms pure computation) and the unit-test plan
in `testing-strategy.md` cheap to satisfy.

### 1.3 Runtime choices

| Concern | Choice | Why |
|---|---|---|
| API framework | Express 5 + TypeScript (CommonJS output) | smallest production-grade surface, native async error propagation; CommonJS avoids dual-package friction with Prisma and multer |
| ORM | Prisma 6 | typed client, migration workflow, pgbouncer-friendly |
| Validation | Zod | one schema for runtime validation and inferred types (NFR-S3) |
| Auth | JWT access (15 min) + rotating refresh token rows (30 d) | NFR-S2, revocable without shared session store |
| Logging | pino, JSON, request-id bound | NFR-S8 |
| Frontend | Next.js 16 App Router + Tailwind 3 | Vercel-native, streaming shell, small client bundles |
| Frontend data | fetch wrapper + SWR-style hooks, no heavyweight client cache | keeps MVP legible |

---

## 2. Data model

Postgres via Prisma. All ids are `cuid()`. All tables carry `createdAt`/`updatedAt`. Every user-scoped table
carries `userId` with an index, because ownership is enforced in the data layer (NFR-S6).

### 2.1 Entity relationships

```
User 1─1 Profile
User 1─* ElectricityBillSummary
User 1─* RoofProfile
User 1─* SizingRun 1─* SizingScenario
User 1─* Quote          ─────────────┐ (nullable sourceQuoteId, SetNull)
User 1─* Project ◀───────────────────┘
        Project 1─* Milestone 1─* Document
        Project 1─* GenerationLog
        Project 1─* Warranty
        Project 1─* ServiceRequest
User 1─* Document  (optional projectId / milestoneId / quoteId)
User 1─* RefreshToken
```

### 2.2 Field definitions

**User** — `id`, `email` (unique, lowercased), `passwordHash` (bcrypt cost 12), `fullName`,
`role` (`HOMEOWNER | INSTALLER | ADMIN`, default `HOMEOWNER` — reserved for Phase 2), `createdAt`,
`updatedAt`. `passwordHash` is never selected into any API response (AC-A3).

**Profile** — one per user. `city`, `state`, `pincode`, `discomName`, `consumerNumber`, `phone`,
`propertyType` (`INDEPENDENT_HOUSE | ROW_HOUSE | APARTMENT | COMMERCIAL`), `currency` (default `INR`),
`region` (default `IN`), `onboardingStep` (int, drives wizard resume for NFR-U3),
`onboardingCompletedAt`.

**ElectricityBillSummary** — `userId`, `billMonth` (`YYYY-MM`), `unitsKwh` (float), `billAmount`,
`tariffPerKwh` (derived when absent, AC-A5), `sanctionedLoadKw`, `connectionType`, `documentId` (uploaded
bill), `source` (`MANUAL | OCR` — `OCR` reserved). Unique on `(userId, billMonth)`.

**RoofProfile** — `userId`, `label`, `roofType` (`FLAT | SLOPED | MIXED`), `usableAreaSqft`,
`orientation` (`N | NE | E | SE | S | SW | W | NW`), `tiltDegrees`, `shadingLevel`
(`NONE | LIGHT | MODERATE | HEAVY`), `structureType`, `notes`, `isPrimary`.

**SizingRun** — `userId` (nullable: guest runs are computed but not persisted, AC-A1), `roofProfileId`,
`avgMonthlyUnits`, `tariffPerKwh`, `region`, `assumptionSetId` (NFR-X1), `suitability`
(`EXCELLENT|GOOD|FAIR|POOR|UNSUITABLE`), `suitabilityReasons` (string[]), `roofCapacityKwp`,
`assumptions` (Json snapshot), `yieldEngine` (which provider produced it).

**SizingScenario** — `sizingRunId`, `key` (`CONSERVATIVE | OPTIMAL | MAX_ROOF`), `label`,
`systemSizeKwp`, `annualGenerationKwh`, `estimatedCost`, `subsidyAmount`, `netCost`, `annualSavings`,
`paybackYears` (nullable per AC-A13), `lifetimeSavings25y`, `co2OffsetTonnesPerYear`,
`roofAreaRequiredSqft`, `notes`.

**Quote** — `userId`, `installerName`, `installerId` (nullable, Phase 2), `systemSizeKwp`, `totalPrice`,
`currency`, panel: `panelBrand`, `panelTechnology` (`MONO_PERC | TOPCON | HJT | N_TYPE | POLY | THIN_FILM |
UNKNOWN`), `panelWattage`, `panelProductWarrantyYears`, `panelPerformanceWarrantyYears`; inverter:
`inverterBrand`, `inverterType` (`STRING | MICRO | HYBRID | UNKNOWN`), `inverterWarrantyYears`;
`workmanshipWarrantyYears`, `includesNetMetering`, `includesStructure`, `includesAmcYears`,
`expectedAnnualGenerationKwh` (installer-supplied, AC-B6), financing: `financingType`
(`CASH | LOAN | LEASE_PPA`), `interestRatePct`, `tenureMonths`, `downPayment`; derived and persisted
(AC-B9): `pricePerKwp`, `equipmentTier`, `valueScore`, `scoreBreakdown` (Json), `redFlags` (string[]),
`financedTotalCost`, `estimatedAnnualSavings`, `paybackYears`, `generationSource`; plus `isSelected`,
`quoteDocumentId`, `notes`.

**Project** — `userId`, `sourceQuoteId` (nullable, `onDelete: SetNull` per AC-B8), denormalized
`installerName`, `systemSizeKwp`, `contractValue`, `currency`; `name`, `status`
(`PLANNING | IN_PROGRESS | COMMISSIONED | ON_HOLD | CANCELLED`), `expectedAnnualGenerationKwh`,
`baselineMonthlyUnits`, `baselineTariffPerKwh`, `commissionedDate`, `notes`.

**Milestone** — `projectId`, `key` (enum of the 9 lifecycle keys, AC-C2), `title`, `sequence`,
`status` (`NOT_STARTED | IN_PROGRESS | COMPLETED | BLOCKED`), `plannedDate`, `completedDate`, `notes`,
`ownerHint` (who typically acts: homeowner / installer / DISCOM). Unique on `(projectId, key)`.

**Document** — `userId`, `category` (11 values, AC-E1), `fileName` (original, metadata only),
`storageKey` (`u/{userId}/{yyyy}/{mm}/{uuid}.{ext}`, AC-E3), `mimeType`, `sizeBytes`, `storageDriver`,
optional `projectId`, `milestoneId`, `quoteId`, `description`.

**GenerationLog** — `projectId`, `month` (`YYYY-MM`), `generatedKwh`, `billAmount`, `unitsImportedKwh`,
`unitsExportedKwh`, `notes`, `source` (`MANUAL | INVERTER_API`). Unique on `(projectId, month)` (AC-D1).

**Warranty** — `projectId`, `component` (`PANEL | INVERTER | STRUCTURE | WORKMANSHIP | BATTERY | OTHER`),
`brand`, `serialNumber`, `startDate`, `durationYears`, `documentId`, `notes`.

**ServiceRequest** — `projectId`, `title`, `description`, `severity` (`LOW | MEDIUM | HIGH | CRITICAL`),
`status` (`OPEN | IN_PROGRESS | RESOLVED | CANCELLED`), `raisedAt`, `resolvedAt`, `resolutionNotes`.

**RefreshToken** — `userId`, `tokenHash` (sha256), `familyId`, `expiresAt`, `revokedAt`,
`replacedByTokenHash`, `userAgent`, `ip`. Reuse of a revoked token revokes the whole family (NFR-S2).

### 2.3 Indexes (NFR-P4)

`User.email` unique · `Profile.userId` unique · `(ElectricityBillSummary.userId, billMonth)` unique ·
`RoofProfile.userId` · `SizingRun.userId` · `SizingScenario.sizingRunId` · `Quote.userId` ·
`Project.userId` · `(Milestone.projectId, sequence)` · `Document.userId`, `Document.projectId`,
`Document.milestoneId` · `(GenerationLog.projectId, month)` unique · `Warranty.projectId` ·
`ServiceRequest.projectId` · `RefreshToken.tokenHash` unique, `RefreshToken.familyId`.

---

## 3. Domain algorithms

All of the following are pure functions in `backend/src/domain/`, each mapping to acceptance criteria.

### 3.1 Assumption sets (`domain/assumptions.ts`, NFR-X1)

`IN_2026_07` is the current default and is snapshotted into every `SizingRun`:

| Key | Value |
|---|---|
| `specificYieldKwhPerKwp` | 1450 |
| `areaPerKwpSqft` | flat 100, sloped 80, mixed 90 (AC-A7) |
| `shadingDerate` | none 1.00, light 0.92, moderate 0.80, heavy 0.65 (AC-A7) |
| `orientationFactor` | S 1.00, SE/SW 0.96, E/W 0.88, NE/NW 0.80, N 0.72 |
| `costPerKwpBands` | ≤3 kWp ₹65,000 · ≤5 ₹58,000 · ≤10 ₹52,000 · >10 ₹48,000 |
| `subsidy` | ₹30,000/kW first 2 kW, ₹18,000 for 3rd kW, cap ₹78,000 (AC-A12) |
| `tariffEscalationPct` | 3.0 |
| `degradationPctPerYear` | 0.5 |
| `co2KgPerKwh` | 0.71 |
| `monthlySeasonality` | 12 factors summing to 1.0 (AC-D2) |
| `selfConsumptionRatio` | 0.85 (savings realism guard) |
| `disclaimer` | shown on every estimate screen (NFR-U4) |

### 3.2 Sizing (`domain/sizing.ts`)

```
roofCapacityKwp = (usableAreaSqft / areaPerKwpSqft[roofType]) * shadingDerate[shadingLevel]   AC-A7
loadBasedKwp    = (avgMonthlyUnits * 12) / (specificYield * orientationFactor * shadingDerate)

suitability     = f(shadingLevel, usableAreaSqft, orientation, roofCapacityKwp) → rating + reasons  AC-A8/A9
scenarios       = round to 0.5 kWp, clamp to roofCapacity, dedupe, sort asc                        AC-A10
   CONSERVATIVE = 0.7 * loadBasedKwp
   OPTIMAL      = 1.0 * loadBasedKwp
   MAX_ROOF     = roofCapacityKwp

annualGeneration = size * specificYield * orientationFactor * shadingDerate                        AC-A11
cost             = size * costPerKwp(size)
subsidy          = pmSuryaGhar(size)                                                               AC-A12
annualSavings    = min(annualGeneration * selfConsumptionRatio, annualUnits) * tariffPerKwh
payback          = annualSavings > 0 ? (cost - subsidy) / annualSavings : null                      AC-A13
lifetime25y      = Σ annualSavings * (1+escalation)^y * (1-degradation)^y
```

Guest calls skip persistence; authenticated calls persist run + scenarios (AC-A15). The computation is
routed through the `YieldEngine` interface so a real simulator can replace the rule-based estimate without
touching the service (NFR-X2).

### 3.3 Quote scoring (`domain/quoteScoring.ts`)

```
pricePerKwp   = round(totalPrice / systemSizeKwp)                                     AC-B1
equipmentTier = PREMIUM | STANDARD | BASIC from technology + warranties               AC-B2
valueScore    = 0.40*priceScore + 0.25*equipmentScore + 0.25*warrantyScore
              + 0.10*transparencyScore      → 0..100 with full breakdown              AC-B3
redFlags      = threshold checks on price/kWp and warranty minimums, scope gaps       AC-B4
financedTotal = CASH ? totalPrice : down + emi(principal, rate, tenure) * tenure      AC-B7
payback       = financedTotal - subsidy) / estimatedAnnualSavings
generation    = installer-supplied when present else platform estimate + source tag   AC-B6
```

`priceScore` is a linear ramp: ₹40,000/kWp → 100, ₹85,000/kWp → 0, with implausibly low prices
(< ₹35,000/kWp) penalised rather than rewarded, so "cheapest" never automatically wins.

### 3.4 Milestones (`domain/milestones.ts`)

Canonical ordered template (AC-C2), each with a title and `ownerHint`. Derived state:

```
progressPercent = round(completed / total * 100)                       AC-C5
currentStage    = first non-completed title else "Commissioned"        AC-C6
NET_METERING_ACTIVE completed ⇒ project.status = COMMISSIONED,
                                commissionedDate = that completedDate  AC-C7
```

### 3.5 Performance (`domain/performance.ts`)

```
projectedForMonth(annual, month) = annual * seasonality[monthIndex]     AC-D2
variancePercent                  = (actual - projected)/projected*100   AC-D3
health   = HEALTHY | WATCH | UNDERPERFORMING (variance < -15 ⇒ under)   AC-D3
savings  = min(generatedKwh, baselineMonthlyUnits) * tariff             AC-D4
warranty = ACTIVE | EXPIRING_SOON (≤90 d) | EXPIRED                     AC-D5
```

---

## 4. API surface (`/api/v1`, NFR-X5)

Envelope: success `{ data, meta? }`, failure `{ error: { code, message, details? } }`.
Auth: `Authorization: Bearer <access>`; refresh token in an httpOnly cookie, also accepted in the body for
non-browser clients.

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | 201, returns user + access token, sets refresh cookie (AC-A2) |
| POST | `/auth/login` | generic failure message (NFR-S1) |
| POST | `/auth/refresh` | rotates, revokes family on reuse (NFR-S2) |
| POST | `/auth/logout` | revokes current refresh token |
| GET | `/auth/me` | current user + profile |
| POST | `/auth/change-password` | invalidates all refresh tokens |

### Profile & onboarding
`GET /profile` · `PUT /profile` · `PATCH /profile/onboarding` (step tracking, NFR-U3) ·
`GET /profile/summary` (dashboard counters + next-best actions) ·
`GET /profile/discom-lookup?pincode=` (static directory via `DiscomProvider`)

### Bills
`GET /bills` (paginated) · `POST /bills` · `PUT /bills/:id` · `DELETE /bills/:id` ·
`GET /bills/stats` (12-month average units and weighted tariff for wizard pre-fill, AC-A6)

### Roof
`GET /roof-profiles` · `POST /roof-profiles` · `GET /roof-profiles/:id` · `PUT /roof-profiles/:id` ·
`DELETE /roof-profiles/:id`

### Sizing
| Method | Path | Notes |
|---|---|---|
| POST | `/sizing/estimate` | **public**, rate limited, no persistence (AC-A1) |
| POST | `/sizing/runs` | auth, persists run + scenarios (AC-A15) |
| GET | `/sizing/runs` | auth, paginated |
| GET | `/sizing/runs/:id` | auth, 404 for non-owner (AC-A15) |
| DELETE | `/sizing/runs/:id` | auth, removes a saved run |
| GET | `/sizing/assumptions` | public, current assumption set (NFR-U4) |

### Quotes
`GET /quotes` · `POST /quotes` · `GET /quotes/:id` · `PUT /quotes/:id` · `DELETE /quotes/:id` ·
`POST /quotes/:id/select` · `GET /quotes/comparison` (normalized matrix + best-in-column flags, AC-B5) ·
`POST /quotes/rescore` (recompute every quote after new bills land) ·
`POST /quotes/parse/:documentId` (`QuoteParser` seam, returns `supported: false` today)

### Projects & milestones
`GET /projects` · `POST /projects` · `POST /projects/from-quote/:quoteId` (transactional, AC-C1) ·
`GET /projects/:id` (with milestones, progress, currentStage, nextActions) · `PUT /projects/:id` ·
`DELETE /projects/:id` · `PUT /projects/:id/milestones/:milestoneId` (AC-C3/C4/C7) ·
`GET /projects/milestone-template` (canonical lifecycle, for UI before a project exists)

### Monitoring
`GET|POST /projects/:id/generation` (upsert by month, AC-D1) · `DELETE /projects/:id/generation/:logId` ·
`POST /projects/:id/generation/sync` (`InverterMonitoringProvider` seam) ·
`GET /projects/:id/performance` (actual vs projected series, variance, health, savings) ·
`GET|POST /projects/:id/warranties` · `PUT|DELETE /projects/:id/warranties/:warrantyId` ·
`GET|POST /projects/:id/service-requests` · `PUT /projects/:id/service-requests/:requestId`

### Documents
`POST /documents` (multipart, single `file` + metadata) · `GET /documents` (filter by category, project,
milestone, quote) · `GET /documents/:id` · `GET /documents/:id/download` (ownership-checked stream or
≤5-min signed URL, AC-E4) · `PUT /documents/:id` · `DELETE /documents/:id` (row + object, AC-E5) ·
`GET /documents/constraints` (allowed types and size cap, so the UI states limits up front)

### Ops
`GET /health` (liveness, also mounted bare at `/health` for platform checks) ·
`GET /health/ready` (DB + storage, NFR-O1) · `GET /health/integrations` (which seams are live, NFR-X2)

---

## 5. Frontend structure

```
frontend/
  app/
    layout.tsx                     root shell, metadata, skip link
    providers.tsx                  AuthProvider + ToastProvider (client boundary)
    page.tsx                       Landing + inline public sizing calculator (US-A1)
    demo/page.tsx                  Browser-only four-stage product walkthrough
    (auth)/layout.tsx              minimal shell for signed-out pages
    (auth)/login, (auth)/register
    (app)/layout.tsx               authenticated shell: sidebar, mobile menu, route guard
    (app)/dashboard                progress hub, next-best actions, project cards
    (app)/onboarding               4-step wizard: home → bill → roof → results
    (app)/bills                    bill list, add month, 12-month stats, bill copies
    (app)/roof                     roof profile list/editor + roof photos
    (app)/sizing                   run list + new run; /sizing/[id] scenario cards + assumptions
    (app)/quotes                   list; /quotes/new; /quotes/[id] detail, score breakdown, edit
    (app)/quotes/compare           comparison matrix (stacked cards < 768 px, NFR-U1)
    (app)/projects                 list + manual create; /projects/[id] tabs:
                                   Milestones · Monitoring · Warranties & service · Documents
    (app)/documents                vault: upload, filter, open, delete
    (app)/profile                  account, password, assumptions disclosure, integration status
  components/
    ui/            Button (+ButtonLink), Field (Text/Select/TextArea/Checkbox), Card (+CardHeader/Body/
                   Footer/Stat), Badge (+ProgressBar), Feedback (Alert/Spinner/EmptyState/Toast), Stepper
    domain/        Term (jargon gloss), AssumptionsPanel, SizingForm, SizingResultView (+ScenarioCard,
                   SuitabilityVerdict), QuoteForm, ComparisonTable, MilestoneRow, PerformanceChart,
                   DocumentPanel (DocumentUploader + DocumentList)
  lib/            api.ts (fetch + single-flight refresh-on-401), auth-context.tsx, format.ts,
                  constants.ts (options + glossary), hooks.ts (useApi/useSubmit), types.ts
```

Tables and charts ship an accessible equivalent rather than a separate component: the comparison matrix uses
row headers plus stacked cards under 768 px, and the performance chart pairs its SVG bars with a data table
(NFR-U1, NFR-U5). Warranties and service requests are rendered inside the project Monitoring/Warranties tabs
instead of standalone components, since neither is reused elsewhere.

Key screens map to journeys: Landing/Onboarding/Sizing → Journey A; Quotes/Compare → Journey B;
Projects → Journey C; project Monitoring tab → Journey D; Documents → Journey E.

Token handling: access token in memory + `localStorage` mirror for reload; refresh via httpOnly cookie with
a single-flight `refresh()` in `lib/api.ts` that retries the original request once on 401.

---

## 6. Cross-cutting decisions

- **Ownership at the data layer.** Every service takes `userId` as its first argument and every Prisma query
  filters on it. Not-found and not-owned both return 404 (AC-C8, NFR-S6).
- **Storage abstraction.** `StorageProvider { put, getStream, getSignedUrl, delete, health }` with `local`
  (dev, `.uploads/`) and `supabase` (prod, private bucket) drivers selected by `STORAGE_DRIVER` (NFR-X3).
- **Integration stubs.** `integrations/` holds `YieldEngine` (rule-based today), `DiscomProvider`,
  `SubsidyProvider` (static PM Surya Ghar), `InverterMonitoringProvider`, `QuoteParser`,
  `NotificationProvider` — each returns `NOT_IMPLEMENTED` where a real call would go, so wiring a vendor is
  additive (NFR-X2).
- **Errors.** `AppError(code, status, message, details?)` subclasses; a single error middleware maps Zod
  issues to 422, Prisma known errors to 409/404, and unknown errors to 500 with the stack logged, never sent
  (NFR-S8).
- **Rate limits.** global 300/15 min; `/auth/*` 20/15 min; `/sizing/estimate` 30/15 min (NFR-S5).
- **Migrations.** Prisma migrations run on Render deploy via `prisma migrate deploy`; the app connects
  through pgbouncer (`DATABASE_URL`) while migrations use the direct port (`DIRECT_URL`) (NFR-O2).

## 7. Design changes made during implementation

| Change | Reason |
|---|---|
| Added `selfConsumptionRatio` to the assumption set | AC-D4 caps savings at retail tariff; the sizing path needed the same guard so estimates and monitoring agree |
| Added `GET /bills/stats` | AC-A6 pre-fill needed a single trusted server-side computation rather than client-side averaging |
| Added `generationSource` to `Quote` (persisted) | AC-B6 requires the comparison to state whose generation figure was used |
| Documents get `storageDriver` | lets a deployment migrate from local to Supabase without breaking existing rows |
| Introduced `MIN_SYSTEM_KWP = 0.5` in `domain/sizing.ts` | AC-A9 puts the hard floor at 60 sqft of usable area, which on a flat roof (100 sqft/kWp) is only 0.6 kWp. A 1 kWp floor would have reported such roofs as unsuitable, contradicting the stated boundary. Scenarios now clamp to 0.5 kWp and the card explains that systems under 1 kWp get no subsidy. |
| Duplicate scenario sizes collapse keeping the **later** key | On a roof-bound estimate all three candidates clamp to capacity; keeping `MAX_ROOF` reads honestly instead of labelling a maxed-out system "Conservative" (AC-A10) |
| Duplicate-email code is `EMAIL_TAKEN` | Aligns the implementation with the code named in `testing-strategy.md` §4.1 (AC-A2) |
| Added `POST /quotes/rescore` | Quotes are scored against the household's tariff and consumption; adding bills later has to be able to refresh existing rows without editing each quote (AC-B9) |
| Added `GET /health/integrations` and surfaced it on `/profile` | NFR-X2 seams are only honest if the UI can say which ones are live; today everything reports "manual" |
| Baseline migration checked in as `prisma/migrations/0_init` | Generated with `prisma migrate diff --from-empty`, so `prisma migrate deploy` works against a fresh Supabase database on the first Render deploy (NFR-O2) |
| Frontend on Next.js 16 rather than 15 | The 15.x line carried an unpatched advisory chain at build time; 16.x with pinned `postcss`/`sharp` overrides audits clean. App Router APIs used here are unchanged. |
