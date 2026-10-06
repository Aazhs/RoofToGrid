# RoofToGrid — Product Task Ledger

Status: Living checklist  
Last updated: 2026-10-06

## Current product boundary

The supported stack is **Next.js + React** in `frontend/` and **Express + TypeScript + Prisma** in `backend/`.
The abandoned alternative-stack migration has been removed.

Working today:

- [x] Public, browser-only guided demo covering planning, quote auditing, project stages and performance checks
- [x] Rule-based public sizing API with disclosed `IN_2026_07` assumptions
- [x] Account registration/login and authenticated homeowner records
- [x] Manual bill and roof capture
- [x] Persisted sizing runs with cost, subsidy, savings and payback scenarios
- [x] Structured quote entry, normalization, value scoring and red-flag detection
- [x] Nine-stage project tracker
- [x] Manual generation logs, projection comparison, warranties and service requests
- [x] Private document storage abstraction

Not working yet and not presented as live:

- [ ] Bill OCR and quote parsing
- [ ] Live inverter telemetry
- [ ] Live DISCOM or subsidy status
- [ ] Photo-based roof or balcony measurement
- [ ] Verified installer directory or live price intelligence
- [ ] Payments and paid plans
- [ ] Email, SMS or WhatsApp delivery

## P0 — Reliability and validation

- [ ] Add Playwright coverage for the public four-step demo and authenticated homeowner journey
- [ ] Add frontend component tests for calculator boundaries and quote red flags
- [ ] Run production smoke tests against the deployed API and database after every release
- [ ] Add staging environment and automated database backups
- [ ] Verify all PM Surya Ghar assumptions against current official guidance before each release

## P1 — User value

- [ ] Let a user export the authenticated sizing + quote decision as a printable report
- [ ] Turn dashboard next actions into direct links to the relevant record and form
- [ ] Add a quote negotiation checklist generated from real red flags
- [ ] Add project reminders only after a real notification provider is connected

## P2 — Automation (behind provider interfaces)

- [ ] Implement bill OCR with confidence per field and mandatory confirmation
- [ ] Implement quote parsing with confidence per field and mandatory confirmation
- [ ] Connect one inverter provider and prove read-only credential handling
- [ ] Pilot one DISCOM status integration with a manual fallback

See `docs/requirements.md`, `docs/design.md`, and `docs/integration-strategy.md` for accepted behaviour and the
explicit line between implemented and planned functionality.
