# RoofToGrid — Roadmap

Status: Living document
Last updated: 2026-10-04

Each phase lists what ships, the acceptance signal we use to call it done, and the exit criteria that must be
true before we start the next phase. Story ids reference `docs/requirements.md`.

---

## Phase 1 — MVP: India homeowner pilot (Shipped & Live)

**Thesis:** a homeowner can get trustworthy numbers and run a project end-to-end with manual data entry and
rule-based math. No external dependency is on the critical path.

### Scope

| Area | Ships | Stories |
|---|---|---|
| Auth & profile | email/password, JWT + rotating refresh, profile with location/DISCOM, onboarding step tracking, password reset flow, email verification | US-A2, US-A3 |
| Bill capture | upload PDF/image, manual monthly units + tariff, 12-month stats for pre-fill | US-A4, US-A5 |
| Roof capture | guided form (type, usable area, orientation, tilt, shading), optional photos | US-A6 |
| Sizing & Estimator | rule-based suitability + 3 scenarios, subsidy, payback, versioned assumptions, public guest estimator with DISCOM tariffs | US-A1, US-A7–US-A10 |
| Quotes | structured entry, derived price/kWp, equipment tier, value score, red flags, financing-adjusted cost, comparison view, WhatsApp share | US-B1–US-B8 |
| Projects | create from quote, 9 seeded milestones, status/dates/notes, progress + current stage, auto-commissioning | US-C1–US-C6 |
| Monitoring | manual monthly generation logs, actual vs seasonality-adjusted projection, savings vs baseline, warranties with expiry status, service requests | US-D1–US-D5 |
| Monetization | Direct UPI Pro checkout (₹499/mo or ₹4,999/yr), instant QR, mobile app intents, official PDF Feasibility Report export, friend referrals | US-MON-1 |
| Content & SEO | Solar Knowledge Base (`/blog`), automated JSON-LD schemas, sitemap, robots, Open Graph social cards, PWA service worker | NFR-SEO-1 |
| Documents | private upload, category tagging, association to project/milestone/quote, ownership-checked download, delete | US-E1–US-E4 |
| Ops | health + readiness, Prisma migrations, seed script, Render/Vercel/Supabase deployment on custom domain | NFR-O1–NFR-O4 |

### Deliberately excluded

OCR/LLM extraction, live DISCOM status, live inverter feeds, 3D shading simulation, installer portal,
battery/ToU modelling, payments, notifications. Each has an interface and a stub (see
`integration-strategy.md`).

### Done signal

- All acceptance criteria AC-A1 … AC-E6 pass in automated tests.
- A seeded demo account walks all four journeys without a dead end.
- Deployed on `app.rooftogrid.com` + `api.rooftogrid.com` with TLS and private storage.

### Exit criteria before Phase 2

- 200+ completed sizing runs and 50+ quotes entered by real users.
- ≥ 20 projects created; ≥ 5 reaching `NET_METERING_ACTIVE`.
- Median self-reported "did the estimate match your final quote?" within ±20%.
- Qualitative signal that quote comparison, not sizing, is the sharpest hook.

---

## Phase 2 — Integrations, automation, and the installer side

**Thesis:** remove manual data entry and become the system of record for the transaction, not just the
decision.

### 2.1 Quote ingestion automation
- `QuoteParser` implemented with OCR (Textract/Tesseract) + an LLM extraction pass into the existing `Quote`
  schema, with a mandatory human-confirm step and per-field confidence.
- `BillParser` for electricity bills: units, amount, tariff slab, sanctioned load, consumer number.
- Success metric: ≥ 80% of fields accepted without edit; median quote entry time under 60 seconds.

### 2.2 Balcony & Terrace AI Vision Dimension Estimator
- Multi-angle photo upload of apartment balconies and terraces.
- **Phase 1 (Immediate)**: Google Gemini Multimodal Vision API (`gemini-1.5-flash` / `gemini-2.0-flash`) leveraging spatial anchor calibration (doors, standard railings, floor tiles) to derive metric dimensions, orientation, shading, and plug-and-play balcony solar kit feasibility (400W–1200W).
- **Phase 2 (Later)**: Custom edge model (YOLOv11-seg + Depth Anything metric 3D point cloud).
- Success metric: Estimated dimensions within ±10% of physical measurement; automatic apartment kit recommendation with society NOC guidance.

### 2.3 Professional yield modelling
- `YieldEngine` swapped to PVGIS / NREL PVWatts, then a shading-aware engine using roof geometry and
  satellite imagery.
- Monthly yield curves replace the static seasonality table; `assumptionSetId` becomes
  `engine:version:location` so historical runs stay reproducible (NFR-X1).
- Success metric: back-tested P50 estimate within ±8% of measured first-year generation.

### 2.4 DISCOM and subsidy workflows
- `DiscomProvider` per state: application submission where portals allow it, status polling elsewhere, with a
  scraper/manual-agent fallback behind the same interface.
- `SubsidyProvider` for PM Surya Ghar eligibility and disbursement status.
- Milestones auto-advance from provider events; homeowners get status change notifications.
- Success metric: 70% of DISCOM milestones updated without homeowner input.

### 2.5 Nationwide Installer Price Intelligence & AI RAG Comparison Engine
- Comprehensive price intelligence across top Indian EPC installers (Tata Power Solar, Waaree Energies, SolarSquare, Loom Solar, Freyr, and DISCOM-empanelled local vendors under PM Surya Ghar).
- Dual-tier intelligence: (1) Curated database of baseline ₹/kWp benchmarks by state, and (2) Real-time Gemini Search Grounding RAG agent to retrieve live rate cards, customer forums, and tender quotes by PIN code.
- Normalizes quotes on ₹/Wp, equipment tier (TopCon vs Mono PERC, micro vs string inverters), DISCOM net-metering liaison fees, and net out-of-pocket costs post PM Surya Ghar ₹78,000 subsidy.
- Success metric: Accurate pricing comparison within 5 seconds for any Indian PIN code with transparency scores.

### 2.6 Live monitoring
- `InverterMonitoringProvider` for SolarEdge, Growatt, Deye, Sungrow, plus smart-meter APIs where available.
- Automated underperformance detection and alerts; warranty-clock awareness in alerts.
- Success metric: 60% of commissioned projects with a connected data source.

### 2.7 Platform hardening
- Email verification, password reset, optional 2FA, OAuth.
- Notifications (email + WhatsApp/SMS in India) via `NotificationProvider`.
- Audit log, soft deletes, data export, background job queue for polling and parsing.

---

## Phase 3 — Scale: multi-market, storage, financing, partner APIs

**Thesis:** the decision engine generalises; the money and hardware layers deepen.

### 3.1 Global expansion
- Market packs: currency, tariff structures (flat / tiered / ToU / demand charges), incentive programmes
  (ITC, feed-in tariffs, VAT relief), utility interconnection processes, units (kW vs kWp, sqft vs m²).
- Launch order driven by incentive clarity and rooftop density: India → SEA/MENA → EU → US.
- `region` and `currency` already exist on `Profile`; assumption sets become market-scoped.

### 3.2 Solar + battery + ToU
- Hourly load profile modelling from smart-meter or interval data.
- Battery sizing with self-consumption, backup autonomy, and arbitrage objectives.
- EV charging and heat-pump load additions as scenario inputs.
- Scenario model extends to component sets rather than a single kWp number.

### 3.3 Financing comparison
- Loan/lease/PPA products from partner lenders normalised the way quotes are today: effective APR, total cost
  of ownership, and break-even against cash.
- Pre-qualification and application handoff; escrowed milestone-based payments.

### 3.4 Partner platform
- Public API + webhooks for installers, lenders, and O&M providers.
- Embeddable sizing widget for DISCOM and OEM sites.
- Anonymised benchmark data products: regional price/kWp indices, brand-level performance and failure rates.

### 3.5 O&M marketplace
- Cleaning and AMC scheduling, technician dispatch, parts and warranty claim handling, with marketplace fees.

---

## Sequencing risks and mitigations

| Risk | Mitigation |
|---|---|
| DISCOM portals have no APIs and change without notice | Provider interface with scraper + human-in-the-loop fallback; never block a milestone on automation |
| LLM quote extraction produces confident wrong numbers | Mandatory human confirm, per-field confidence, and the structured form always remains available |
| Installer incentives conflict with homeowner trust | Reputation from delivered performance only; red flags are never suppressed for paying partners |
| Subsidy rules change mid-project | Static rules are versioned in assumption sets; every persisted run keeps its snapshot |
| Multi-market forking of calculation code | Market packs are data, not code branches; the engine takes `region` from day one |
