# RoofToGrid — Integration Strategy

Status: Living document
Last updated: 2026-07-29
Traces to: `docs/requirements.md` §5 and NFR-X2/X3, `docs/design.md` §6

---

## 1. The rule

Every external dependency is behind an interface that exists **today**, with a stub implementation that either
computes a rule-based answer or returns `NOT_IMPLEMENTED`. Provider selection is environment-driven, so adding
a vendor is a new file plus an env var — never a change to a route or a service (NFR-X3).

```
src/integrations/
  types.ts          all provider interfaces + NotImplementedProvider helper
  yieldEngine.ts    RuleBasedYieldEngine        ✅ implemented (rule-based)
  subsidy.ts        StaticIndiaSubsidyProvider  ✅ implemented (PM Surya Ghar static)
  discom.ts         StubDiscomProvider          🚧 stub
  inverter.ts       StubInverterMonitoring      🚧 stub
  quoteParser.ts    StubQuoteParser             🚧 stub
  notifications.ts  ConsoleNotificationProvider 🚧 logs only
  index.ts          registry: env var → implementation
src/storage/
  local.ts          LocalStorageProvider        ✅ implemented (dev)
  supabase.ts       SupabaseStorageProvider     ✅ implemented (prod)
```

| Provider | Env var | MVP value | Status |
|---|---|---|---|
| `StorageProvider` | `STORAGE_DRIVER` | `local` \| `supabase` | ✅ both real |
| `YieldEngine` | `YIELD_ENGINE` | `rule-based` | ✅ real, replaceable |
| `SubsidyProvider` | `SUBSIDY_PROVIDER` | `static-in` | ✅ real, static rules |
| `DiscomProvider` | `DISCOM_PROVIDER` | `stub` | 🚧 not implemented |
| `InverterMonitoringProvider` | `INVERTER_PROVIDER` | `stub` | 🚧 not implemented |
| `QuoteParser` | `QUOTE_PARSER` | `stub` | 🚧 not implemented |
| `NotificationProvider` | `NOTIFICATION_PROVIDER` | `console` | 🚧 logs only |

---

## 2. Yield / design engines

**Today.** `RuleBasedYieldEngine` implements
`estimate({ systemSizeKwp, orientation, tiltDegrees, shadingLevel, region }) → { annualGenerationKwh,
monthlyKwh[], engineId, confidence: 'LOW' }` using the assumption set in `domain/assumptions.ts`
(specific yield 1450 kWh/kWp, orientation factors, shading derates). Confidence is reported as `LOW` on
purpose, and every result carries the `assumptionSetId` that produced it.

**Phase 2 — climate-accurate.** Swap in PVGIS (free, good EU/Asia coverage), NREL PVWatts (US), or
Google Solar API where roof geometry is available.
- Inputs already captured: lat/long derivable from pincode, orientation, tilt, shading level, system size.
- New inputs needed: precise coordinates, module and inverter specs, DC/AC ratio, soiling and loss factors.
- Contract change: `monthlyKwh[]` becomes engine-supplied rather than seasonality-derived, and
  `confidence` rises to `MEDIUM`. `SizingRun.yieldEngine` and `assumptionSetId` already record which engine
  produced each stored result, so old runs stay reproducible (NFR-X1).

**Phase 2/3 — shading-aware simulation.** Aurora Solar, Helioscope, or an in-house engine on LiDAR/imagery,
producing P50/P90 bands and a per-hour profile that feeds battery and ToU modelling.
- Requires: roof polygons, obstruction models, hourly irradiance.
- Architectural hook: the engine returns an optional `hourlyProfile` that `domain/performance.ts` can consume
  instead of the monthly seasonality curve.

**Failure policy.** Any engine call that errors or exceeds a 3 s budget falls back to the rule-based engine,
tags the result `engineId = 'rule-based-fallback'`, and never blocks the user. Results are cached by
(location bucket, orientation, tilt, shading, size) because they are deterministic.

---

## 3. DISCOM and subsidy programmes

**Today.** `StubDiscomProvider` returns `NOT_IMPLEMENTED` for submission and status; the homeowner updates the
`DISCOM_APPLICATION_SUBMITTED`, `DISCOM_APPROVED`, and `NET_METERING_ACTIVE` milestones by hand.
`StaticIndiaSubsidyProvider` computes PM Surya Ghar eligibility from static rules (AC-A12) with no network
call.

**Interface (already defined).**

```ts
interface DiscomProvider {
  id: string;
  listSupportedDiscoms(region: string): Promise<DiscomInfo[]>;
  checkEligibility(input: DiscomEligibilityInput): Promise<DiscomEligibility>;
  submitApplication(input: DiscomApplicationInput): Promise<DiscomApplicationRef>;
  getApplicationStatus(ref: DiscomApplicationRef): Promise<DiscomApplicationStatus>;
}
interface SubsidyProvider {
  id: string;
  estimate(input: SubsidyInput): Promise<SubsidyEstimate>;   // implemented
  getApplicationStatus?(ref: string): Promise<SubsidyStatus>; // Phase 2
}
```

**Phase 2 reality check.** Most Indian DISCOM portals have no public API. The provider interface deliberately
does not assume one:

| Tier | Mechanism | Where it plugs in |
|---|---|---|
| A | Real API / state portal integration | `submitApplication` + `getApplicationStatus` |
| B | Authenticated scraping with consent | same interface, different implementation |
| C | Human-in-the-loop ops agent updating status | same interface, backed by an internal queue |

All three write through the same path: a provider event → milestone update → notification. Milestones are
never blocked on automation; manual override always remains available. Status polling runs as a scheduled job
(Phase 2 introduces the job queue), not in the request path.

**Data needed later:** consumer number and sanctioned load (already on `ElectricityBillSummary`), DISCOM name
(already on `Profile`), plus applicant KYC and an installer empanelment id — captured only when a real
integration lands, to avoid collecting sensitive data with no use.

---

## 4. Inverter monitoring and smart meters

**Today.** `StubInverterMonitoring` returns `NOT_IMPLEMENTED`. Homeowners enter monthly generation manually;
`GenerationLog.source = MANUAL` and the column already accepts `INVERTER_API`.

**Interface.**

```ts
interface InverterMonitoringProvider {
  id: string;
  listVendors(): Promise<VendorInfo[]>;
  connect(input: { projectId: string; vendor: string; credentials: unknown }): Promise<ConnectionRef>;
  fetchDailyGeneration(ref: ConnectionRef, from: Date, to: Date): Promise<DailyGeneration[]>;
  fetchLiveStatus(ref: ConnectionRef): Promise<InverterStatus>;
  disconnect(ref: ConnectionRef): Promise<void>;
}
```

**Phase 2 targets.** SolarEdge, Growatt, Sungrow, Deye, and Enphase cover most Indian residential inverters;
smart-meter/interval data where DISCOMs expose it.

**Design notes.**
- A nightly job pulls daily generation and rolls it into the existing `GenerationLog` monthly rows with
  `source = INVERTER_API`; manual entries are preserved and marked so a user's numbers are never silently
  overwritten.
- Vendor credentials are never stored in application tables. A separate encrypted `InverterConnection` table
  (Phase 2) holds tokens with envelope encryption; OAuth is preferred over password storage, and
  password-only vendors are gated behind an explicit consent screen.
- Underperformance alerts reuse `domain/performance.ts` — the alerting logic needs no change, only more
  frequent data.
- Rate limits and vendor outages are absorbed by the job queue; a missing day degrades to "no data", never a
  zero reading, because a false zero would trigger a false alarm.

---

## 5. Quote and bill ingestion (OCR + LLM)

**Today.** `StubQuoteParser` returns `NOT_IMPLEMENTED`; users fill the structured quote form, which already
defines the exact target schema.

**Interface.**

```ts
interface QuoteParser {
  id: string;
  parse(input: { documentId: string; mimeType: string; buffer: Buffer })
    : Promise<{ fields: Partial<QuoteInput>; confidence: Record<string, number>; warnings: string[] }>;
}
```

**Phase 2 pipeline.** Upload → OCR (Textract / Google DocAI / Tesseract) → LLM extraction into the `Quote`
schema with per-field confidence → **mandatory human confirmation screen** pre-filled with extracted values →
save through the normal validated create endpoint.

**Guardrails.**
- Parsed values never persist without user confirmation. An LLM that is confidently wrong about a price is
  worse than an empty form.
- Fields below a confidence threshold render blank and flagged rather than pre-filled.
- The structured form remains a first-class path forever, so parsing failures are a minor inconvenience.
- Prompt-injection safety: extracted text is data, never instructions. Extraction runs with a fixed schema and
  a strict JSON output contract, and the result is validated by the same Zod schema as manual input.
- No document content is sent to a third-party model without an explicit user-facing disclosure and an opt-out.

The same pattern applies to `BillParser` for electricity bills (units, amount, slab, sanctioned load).

---

## 6. Installer marketplace (Phase 2)

Already reserved in the schema so no migration surprise later: `User.role = INSTALLER`, `Quote.installerId`,
and a denormalized `Project.installerName` that survives quote deletion (AC-B8).

Additions when it lands: `Installer` profile (service areas, capacity, certifications, verification state),
`Lead` and routing rules from completed sizing runs, in-platform quote submission (which removes the parsing
problem at source), a reputation service computed from milestone timeliness and generation-vs-promise, and a
messaging thread per project.

**Trust constraint carried into the design:** ranking is by value score and delivered reputation only. No
paid-placement field exists on the ranking path, and if paid placement is ever introduced it must be a
separate, labelled surface.

---

## 7. Notifications, payments, and analytics

| Concern | Today | Later |
|---|---|---|
| Notifications | `ConsoleNotificationProvider` logs the payload | Resend/SES for email, MSG91/WhatsApp Business for India; templates keyed by milestone and alert type |
| Payments | none; financing fields captured only | Razorpay/Stripe for premium reviews and SaaS; escrowed milestone payments in Phase 3 |
| Analytics | funnel-computable data persisted; no tracker wired in | self-hosted product analytics with consent gating; funnel definitions already in `business-model.md` §4.1 |
| Auth providers | email + password | Google OAuth and phone OTP behind the same `AuthProvider` seam |

---

## 8. Storage (implemented, so worth documenting the seam)

```ts
interface StorageProvider {
  id: string;
  put(input: { key: string; body: Buffer | Readable; contentType: string }): Promise<{ key: string }>;
  getStream(key: string): Promise<Readable>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string | null>;
  delete(key: string): Promise<void>;
  health(): Promise<boolean>;
}
```

`local` writes under `.uploads/` for development. `supabase` uses a **private** bucket and issues signed URLs
capped at 300 s (AC-E4). `Document.storageDriver` records which driver wrote each object, so a deployment can
switch drivers without breaking existing rows. Adding S3, R2, or GCS is one file implementing the interface.

---

## 9. What is explicitly NOT implemented

To be unambiguous, the following are **designed for and stubbed, not built**:

- ❌ Live DISCOM application submission or status polling
- ❌ Live subsidy application status (only static eligibility estimation is real)
- ❌ Live inverter or smart-meter data ingestion
- ❌ OCR/LLM extraction of bills or quotes
- ❌ Professional shading and 3D yield simulation
- ❌ Installer portal, lead routing, bidding, messaging
- ❌ Battery, EV, and time-of-use modelling
- ❌ Payments, loan origination, escrow
- ❌ Email/SMS/WhatsApp delivery
- ❌ Third-party analytics

Each maps to an interface listed in §1. Attempting to use one returns a clear
`NOT_IMPLEMENTED` error with the provider id, so the failure is legible rather than mysterious.

---

## 10. Integration readiness checklist (per new provider)

1. Interface exists in `integrations/types.ts` and the stub is registered in `integrations/index.ts`.
2. Env var added to `.env.example` and `env.ts` schema with a safe default.
3. Timeout, retry, and fallback behaviour defined — the user-facing flow must survive the provider being down.
4. Secrets in environment only; nothing vendor-specific leaks into `domain/`.
5. Contract tests against a recorded fixture, plus a stub-based integration test so CI needs no network.
6. Documented in this file with status moved from 🚧 to ✅ and any data-model additions reflected in
   `docs/design.md`.
