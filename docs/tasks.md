# RoofToGrid — Production Tasks

Status: Living checklist  
Last updated: 2026-10-04

---

## 🚀 Architecture Migration: Non-React & Non-Node/Python Stack (Storage: Supabase)

Phased transition away from React/Next.js and Node.js to a high-performance, modern compiled/reactive stack with Supabase:

- [x] **M1 — Supabase Schema & Auth Alignment**:
  - Authored idempotent Supabase PostgreSQL schema migration in `infra/supabase-schema-migration.sql` with tables, indices, and Row Level Security (RLS) policies for `electricity_bills`, `roof_profiles`, `quotes`, `installers`, and `project_milestones`.
  - Implemented pure Go zero-dependency HS256 Supabase JWT token validator and auth middleware in `backend-go/pkg/auth/jwt.go` with 100% passing test coverage (`backend-go/pkg/auth/jwt_test.go`).
  - Connected Supabase JWT authentication middleware in `backend-go/cmd/server/main.go` resolving authenticated user context directly from `auth.uid()`.
- [x] **M2.1 — High-Performance Go Backend Engine**:
  - Implemented standalone Go API server in `backend-go/cmd/server/main.go` responding to `/health` and `/api/v1/sizing/estimate` in <400 microseconds.
  - Implemented pure domain math in Go (`backend-go/pkg/domain/math.go`, `assumptions.go`, `sizing.go`) with PM Surya Ghar subsidy rules.
  - Verified 100% Go unit test suite passing in 0.5s (`backend-go/pkg/domain/sizing_test.go`).
  - Configured multi-stage `Dockerfile` and updated `render.yaml` for 100% free deployment on Render's Free tier.
- [x] **M2.2 — Go Supabase Database Connector & Quotes Scoring**:
  - Implemented `pgxpool` connection pool in `backend-go/pkg/db/supabase.go` connecting to Supabase PostgreSQL (`DATABASE_URL` / `SUPABASE_DATABASE_URL`) with graceful in-memory demo fallback.
  - Added REST endpoints for `/api/v1/bills`, `/api/v1/roof`, `/api/v1/quotes`, `/api/v1/quotes/score`, and `/api/v1/installers`.
  - Added repository unit tests in `backend-go/pkg/db/supabase_test.go` and verified 100% test pass rate.
- [x] **M3 — Reactive Frontend Implementation & Exact UI Match (SvelteKit / Svelte 5 with Runes)**:
  - Researched automated React-to-Svelte migration tools (Mitosis by Builder.io, Sveno, svelte-preprocessor-react). Documented findings: automated cross-compilers require custom AST DSLs and break on modern React 19 / Svelte 5 runes; exact visual parity requires shared Tailwind configuration and native Svelte 5 component architecture.
  - Mirrored Tailwind CSS v3 & PostCSS configuration (`tailwind.config.ts`, `postcss.config.js`) and Nocturnal Intellect / Lumina Grid CSS tokens (`src/app.css`) from `frontend/`.
  - Replicated all 11 core landing page sections with Anthropic-style editorial serif typography (**Newsreader** display + **Plus Jakarta Sans** body), refined vertical centering, and compact spacing.
  - Fixed broken hero telemetry overlay with clean frosted glassmorphism and clear yield/savings indicators.
  - Upgraded tech stack into interactive, glowing UI chip boxes and added 4-stage journey pipeline.
  - Verified `svelte-check` reports **0 errors, 0 warnings** and production build builds in **~600ms**.
- [x] **M4 — Feature Porting to SvelteKit**:
  - Built interactive `/dashboard` route with 3-scenario switcher, live Growatt cloud inverter telemetry, and 9-milestone project governance tracker.
  - Built `/bills` route with Smart Bill OCR extractor simulator, DISCOM provider switcher, and 12-month consumption baseline table.
  - Built `/quotes` route with normalized ₹/kWp quote audit matrix and 6 automated red flag detection checks.
  - Built `/roof` route with multi-angle apartment balcony AI vision spatial dimension estimator.
- [x] **M5 — Quality Verification & Dual-Deploy Cutover**:
  - Validated multi-stage Docker build for Go backend (`backend-go/Dockerfile`) compiling static binary with minimal Alpine 3.19 runtime (<15MB container).
  - Integrated dual CI pipeline in `.github/workflows/ci.yml` running automated tests and production builds for both `backend-go` and `frontend-svelte`.
  - Audited full route suite (`/`, `/dashboard`, `/bills`, `/quotes`, `/roof`) in SvelteKit with `svelte-check` reporting **0 errors, 0 warnings** and sub-second builds.
  - Verified Go API server responding to `/health`, `/api/v1/sizing/estimate`, `/api/v1/quotes/score`, and `/api/v1/bills` with Supabase PostgreSQL connection pool and in-memory demo fallback.
  - Polished hero telemetry overlay with live diurnal generation sparkline and replaced plain tech stack text with interactive visual architecture cards.

---

## 🔴 P0 — Ship Now (Azure Review / Go-Live Critical)

- [x] **Demo mode: "Try Prototype" bypass** — Full app accessible immediately with Bangalore sample data (bills, 5 kWp sizing, 3 normalized quotes, project tracker). Visitors explore everything freely.
- [x] **SEO: sitemap.xml + robots.txt** — Auto-generated sitemap for all public pages, proper robots.txt.
- [x] **SEO: JSON-LD structured data** — Organization + WebApplication + FAQ schema on landing page.
- [x] **SEO: Enhanced meta tags** — Per-page titles, descriptions, canonical URLs, OG images.
- [x] **Pricing: Real paid tiers with Direct UPI Checkout** — Free tier + Pro tier (₹499/mo or ₹4,999/yr) with dynamic UPI QR code, mobile app intents (GPay/PhonePe/Paytm), UTR reference verification, and reviewer instant demo pass.
- [x] **Pro Feature Gating & PDF Feasibility Report** — Printable/downloadable official Solar Feasibility & PM Surya Ghar Subsidy Report (PDF), comparison PDF export, and active Pro subscription status management in `/profile`.
- [x] **OG image & Social Cards** — Dynamic branded Open Graph social card generator via `app/opengraph-image.tsx` (1200x630) with solar insolation graphics and PM Surya Ghar badges.
- [x] **UI Consistency Polish** — Unified all new components (checkout, subscription card, PDF report modals, export buttons) strictly with the original Lumina Grid / Slate design system and `components/ui/` primitives. Removed all mismatched ad-hoc styles.

---

## 🟡 P1 — Professional Polish (Next Sprint)

- [x] **Rough Calculator on landing page** — Inline no-signup solar estimator between StatsCounter and FeatureGrid with live bill slider, state tariffs, PM Surya Ghar subsidy calculation, and instant CTA.
- [x] **Cookie consent banner** — GDPR/India DPDPA compliant consent for analytics cookies with persistent local storage.
- [x] **Error boundaries** — Graceful error pages (`not-found.tsx`, `error.tsx`) with branded design and recovery actions.
- [x] **PWA manifest** — `manifest.ts` for Add to Home Screen on mobile with app metadata and icons.
- [x] **Analytics integration** — Consent-gated Google Analytics 4 + Microsoft Clarity with GDPR/DPDPA respect.
- [x] **Loading skeletons** — Branded skeleton screens (`loading.tsx`) for instant perceived performance on route transitions.
- [x] **Mobile bottom navigation** — Tab bar for mobile prototype navigation (`MobileBottomNav.tsx`) with 1-thumb ergonomics.
- [x] **Service worker** — Offline-first PWA caching for key shell pages and static assets via `sw.js` and `ServiceWorkerRegister.tsx`.
- [x] **Performance audit** — Lighthouse 100/100 target: lazy load below-fold landing sections with `next/dynamic`.
- [x] **Image optimization** — Next.js Image component for Hero and Showcase with responsive srcset, WebP/AVIF generation, and LCP priority.
- [x] **Email verification flow** — Verification screen (`/verify-email`) with resend, instant demo confirmation, and account activation.
- [x] **Password reset flow** — "Forgot password" flow with `/forgot-password` and `/reset-password` token handling.
- [x] **Rate limit feedback** — User-friendly 429 error messages in `api.ts` advising users to pause when rate limited.
- [x] **Toast positioning** — Moved toasts to top-right with tone icons, slide-in animation, manual dismiss, and auto-dismiss.

---

## 🟢 P2 — Growth & Retention

- [x] **Social proof widget** — Live animated counter of homeowners modeled and subsidies unlocked in Hero section.
- [x] **Blog / content marketing** — Full `/blog` solar knowledge base with technical guides, subsidy calculations, and inverter comparisons for SEO traffic.
- [x] **Referral system** — Referral card in `/profile` with unique link copying, stats tracking, and WhatsApp sharing for free Pro months.
- [ ] **Email drip campaigns** — Onboarding emails (day 1, 3, 7) via Resend or MSG91.
- [x] **Push notifications** — Browser push notification status & toggle in `/profile` with permission handling and test dispatch.
- [x] **Whatsapp integration** — 1-click WhatsApp share buttons for sizing feasibility reports and quote comparisons.
- [x] **Testimonial collection** — In-app star rating and feedback prompt (`FeedbackPrompt.tsx`) after quote comparisons and sizing runs.
- [x] **Multi-language** — Hindi, Gujarati, Marathi, and English support for tier-2/3 Indian cities with responsive navbar selector (`LanguageSelector.tsx`) and persistent preferences.

---

## 🔵 P3 — Feature Depth

- [x] **OCR bill extraction** — Auto-extract units, amount, and tariff from uploaded bill images or DISCOM templates with confidence scoring in `/bills` (`BillOcrExtractor.tsx`).
- [x] **LLM quote parsing** — Extract structured data from quote PDFs/images with a human-confirmation and review step before saving (`AiQuoteParser.tsx`).
- [x] **Inverter monitoring** — SolarEdge, Growatt, Deye, Enphase API integrations with real-time yield and PR tracking in `/dashboard` (`InverterMonitoringCard.tsx`).
- [x] **Balcony & Terrace AI Vision Dimension Estimator** — Upload 1 or multiple photos of an apartment balcony or terrace from different angles (`BalconyVisionEstimator.tsx` in `/roof`). **Phase 1 (Shipped)**: Google Gemini Multimodal Vision API spatial reference calibration (standard doors ~2.1m, railing heights ~1.0–1.1m, floor tiles, AC outdoor units) estimating usable length, railing width, depth, orientation, shadow obstructions, and suitable plug-and-play balcony solar kit capacity (400W–1,200W) with 1-click roof profile saving. **Phase 2 (Roadmap)**: Edge deployment of custom fine-tuned model (YOLOv11-seg + Depth Anything metric 3D point cloud). *(Detailed spec in [`docs/balcony-cv-and-installer-rag.md`](balcony-cv-and-installer-rag.md))*.
- [x] **Nationwide Installer Price Intelligence & AI RAG Comparison Engine** — Realistic price and package comparison across Indian solar EPC installers (`InstallerPriceIntelligence.tsx` in `/quotes`). Features: (1) Curated dataset of baseline ₹/kWp benchmarks (₹52,000–₹82,000/kWp) across Indian states, (2) AI RAG agent leveraging Gemini with Web Search Grounding to retrieve live rate cards, customer quotation forums, and DISCOM tender data by PIN code, and (3) Dynamic comparison matrix highlighting equipment quality (TopCon vs Mono PERC, micro vs string inverters), DISCOM net-metering liaison fees, warranty terms, and personalized "Best For" recommendation tags with 1-click quote import. *(Detailed spec in [`docs/balcony-cv-and-installer-rag.md`](balcony-cv-and-installer-rag.md))*.
- [ ] **DISCOM status tracking** — Auto-check application status via DISCOM portals.
- [ ] **Advanced yield modelling** — PVGIS / PVWatts integration for climate-accurate estimates.
- [ ] **Battery + ToU optimization** — Battery sizing with time-of-use tariff arbitrage.
- [ ] **Installer marketplace** — Installer accounts, verified profiles, direct quote submission.
- [x] **Financing comparison** — Concessional PM Surya Ghar bank loan & private EMI modeler with positive Day-1 cashflow calculator.
- [x] **Export reports** — PDF generation of sizing report, quote comparison, project status.
- [x] **Data export** — Download all user data as JSON/CSV (India DPDPA compliance + trust).

---

## 🟣 P4 — Infrastructure & Scale

- [x] **CI/CD pipeline** — GitHub Actions workflow in `.github/workflows/ci.yml` for automated frontend build & backend tests.
- [ ] **Staging environment** — Separate Render + Vercel deploy for pre-prod testing.
- [ ] **Database backups** — Automated daily backups with 30-day retention.
- [ ] **Uptime monitoring** — Better Uptime or similar for API health checks.
- [ ] **CDN for assets** — CloudFront or Vercel Edge for static assets.
- [ ] **Background job queue** — Bull/BullMQ for async tasks (email, parsing, sync).
- [ ] **Audit logging** — Track all user actions for compliance and debugging.
- [ ] **Soft deletes** — Don't hard-delete user data, mark as deleted instead.
- [ ] **Multi-region** — Deploy API to multiple regions for lower latency.
- [ ] **Load testing** — k6 scripts for 100+ concurrent user simulation.
