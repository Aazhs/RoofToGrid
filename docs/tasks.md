# RoofToGrid — Production Tasks

Status: Living checklist  
Last updated: 2026-10-03

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
