# RoofToGrid — Production Tasks

Status: Living checklist  
Last updated: 2026-10-04

---

## 🚀 Architecture Migration: Non-React & Non-Node/Python Stack (Storage: Supabase)

Phased transition away from React/Next.js and Node.js to a high-performance, modern compiled/reactive stack with Supabase:

- [ ] **M0 — Stack Evaluation & Technology Decision**: Compare frontend (Svelte 5 / SvelteKit vs SolidJS vs Astro) and backend (Go vs Rust vs Elixir) against performance, developer velocity, and Supabase ecosystem compatibility.
- [ ] **M1 — Supabase Schema & Auth Alignment**: Configure Supabase PostgreSQL tables, Row Level Security (RLS) policies, and JWT token authentication for multi-language homeowners and installers.
- [ ] **M2 — High-Performance Backend Implementation (e.g. Go / Chi / pgx)**:
  - Build single-binary REST API server in Go with sub-millisecond cold starts and <20MB RAM footprint.
  - Port core domain math: sizing engine (`SizingService`), quote normalization & scoring (`QuoteScoringService`), subsidy engine, and milestone workflows.
  - Implement Supabase database connector with connection pooling (`pgxpool`).
- [ ] **M3 — Reactive Frontend Implementation (e.g. SvelteKit / Svelte 5 with Runes)**:
  - Set up SvelteKit project with zero Virtual DOM overhead and native fine-grained reactivity.
  - Port Lumina Grid / Slate design system tokens and reusable UI primitives.
  - Build landing page, instant solar estimator, and language selector (English, Hindi, Gujarati, Marathi).
- [ ] **M4 — Feature Porting to SvelteKit**:
  - Port Smart Bill OCR Extractor, AI Quote Parser, Inverter Monitoring Telemetry, and Balcony AI Vision Estimator.
  - Re-implement PWA service worker and DPDPA data export.
- [ ] **M5 — Quality Verification & Dual-Deploy Cutover**:
  - Docker multi-stage build for Go backend + static/Node adapter for SvelteKit.
  - End-to-end verification and migration validation before cutover.

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
