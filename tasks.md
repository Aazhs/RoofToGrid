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

- [ ] **Analytics integration** — Google Analytics 4 + Microsoft Clarity for heatmaps and session replay.
- [ ] **Cookie consent banner** — GDPR/India DPDPA compliant consent for analytics cookies.
- [ ] **Error boundaries** — Graceful error pages (404, 500) with branded design and recovery actions.
- [ ] **Loading skeletons** — Replace spinners with skeleton screens for perceived performance.
- [ ] **PWA manifest** — `manifest.json` for Add to Home Screen on mobile.
- [ ] **Service worker** — Offline-first for cached pages, background sync for generation logs.
- [ ] **Performance audit** — Lighthouse 100/100 target. Lazy load below-fold landing sections.
- [ ] **Image optimization** — Next.js Image component for all images, WebP/AVIF, srcset.
- [ ] **Email verification flow** — Send verification email on register, confirm before full access.
- [ ] **Password reset flow** — "Forgot password" with email token.
- [ ] **Rate limit feedback** — Show user-friendly messages when rate limited.
- [ ] **Toast positioning** — Move toasts to top-right, add animation, auto-dismiss.
- [ ] **Mobile bottom navigation** — Tab bar for mobile instead of hamburger menu.

---

## 🟢 P2 — Growth & Retention

- [ ] **Blog / content marketing** — `/blog` with MDX for solar education articles (SEO traffic).
- [ ] **Referral system** — Share link, track referrals, reward with Pro trial.
- [ ] **Email drip campaigns** — Onboarding emails (day 1, 3, 7) via Resend or MSG91.
- [ ] **Push notifications** — Milestone updates, warranty expiry alerts.
- [ ] **Whatsapp integration** — Share sizing results and quote comparisons via WhatsApp.
- [ ] **Social proof widget** — Live counter of "X homeowners analyzed their roof today".
- [ ] **Testimonial collection** — In-app prompt after sizing run + quote comparison.
- [ ] **Multi-language** — Hindi + regional languages for tier-2/3 cities.

---

## 🔵 P3 — Feature Depth

- [ ] **OCR bill extraction** — Auto-extract units, amount, tariff from uploaded bill images.
- [ ] **LLM quote parsing** — Extract structured data from quote PDFs with human-confirm step.
- [ ] **Inverter monitoring** — SolarEdge, Growatt, Deye API integrations.
- [ ] **DISCOM status tracking** — Auto-check application status via DISCOM portals.
- [ ] **Advanced yield modelling** — PVGIS / PVWatts integration for climate-accurate estimates.
- [ ] **Battery + ToU optimization** — Battery sizing with time-of-use tariff arbitrage.
- [ ] **Installer marketplace** — Installer accounts, verified profiles, direct quote submission.
- [ ] **Financing comparison** — Loan/lease/PPA products with APR normalization.
- [ ] **Export reports** — PDF generation of sizing report, quote comparison, project status.
- [ ] **Data export** — Download all user data as JSON/CSV (compliance + trust).

---

## 🟣 P4 — Infrastructure & Scale

- [ ] **CI/CD pipeline** — GitHub Actions for lint, test, build, deploy on PR merge.
- [ ] **Staging environment** — Separate Render + Vercel deploy for pre-prod testing.
- [ ] **Database backups** — Automated daily backups with 30-day retention.
- [ ] **Uptime monitoring** — Better Uptime or similar for API health checks.
- [ ] **CDN for assets** — CloudFront or Vercel Edge for static assets.
- [ ] **Background job queue** — Bull/BullMQ for async tasks (email, parsing, sync).
- [ ] **Audit logging** — Track all user actions for compliance and debugging.
- [ ] **Soft deletes** — Don't hard-delete user data, mark as deleted instead.
- [ ] **Multi-region** — Deploy API to multiple regions for lower latency.
- [ ] **Load testing** — k6 scripts for 100+ concurrent user simulation.
