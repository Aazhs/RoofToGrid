# RoofToGrid

Rooftop-solar planning and installer-matching for homeowners: work out whether solar makes sense for your
home, compare installer quotes on equal terms, and track the project from site survey to net metering.

- **Frontend** — Next.js (App Router) + Tailwind, deployed on Vercel
- **Backend** — Express 5 + TypeScript + Prisma, deployed on Render
- **Database & storage** — Supabase Postgres + a private Supabase Storage bucket

Product and technical documents live in [`docs/`](docs):
[requirements](docs/requirements.md) · [design]docs/design.md) · [roadmap](docs/roadmap.md) ·
[business model](docs/business-model.md) · [testing strategy](docs/testing-strategy.md) ·
[integration strategy](docs/integration-strategy.md)

---

## What is in the MVP

| Journey | What you can do | Where |
|---|---|---|
| A — Should I go solar? | Public calculator, bill capture, roof capture, rule-based sizing with subsidy, savings and payback | `/`, `/onboarding`, `/bills`, `/roof`, `/sizing` |
| B — Compare quotes | Structured quote entry, normalized comparison, value score, red flags, EMI-aware costs | `/quotes`, `/quotes/compare` |
| C — Track the project | Nine-milestone lifecycle with status, dates, notes; commissioning derived from net metering | `/projects` |
| D — Monitor and maintain | Monthly generation vs seasonal projection, savings, warranty status, service requests | `/projects/[id]` → Monitoring |
| E — Document vault | Private uploads tied to projects, milestones or quotes, with ownership-checked downloads | `/documents` |

Deliberately **not** in the MVP, but designed for: OCR/LLM quote parsing, live DISCOM and subsidy status,
inverter monitoring feeds, professional yield simulation, installer portal. Each sits behind an interface with
a working stub — see [`docs/integration-strategy.md`](docs/integration-strategy.md) and
`backend/src/integrations/`.

---

## Repository layout

```
backend/                Express API
  prisma/
    schema.prisma       data model (docs/design.md §2)
    migrations/0_init   baseline migration
    seed.ts             demo account covering all four journeys
  src/
    domain/             pure calculators: sizing, quote scoring, milestones, performance
    modules/<domain>/   routes.ts + service.ts + schema.ts per domain
    integrations/       YieldEngine, DISCOM, subsidy, inverter, parsers, notifications (stubs today)
    storage/            StorageProvider: local disk (dev) or Supabase Storage (prod)
    middleware/         auth, validation, rate limits, uploads, error handling
  tests/
    unit/               domain + helpers (no database needed)
    integration/        routes → service → real Postgres (skips when no database)
frontend/               Next.js app
  app/                  routes: landing, auth, dashboard, onboarding, bills, roof, sizing, quotes, projects, documents, profile
  components/ui/        Button, Field, Card, Badge, Stepper, Feedback (alerts, toasts, empty states)
  components/domain/    sizing form and results, quote form, comparison table, milestone row, performance chart, document panel
  lib/                  api client, auth context, formatting, constants, hooks, shared types
docs/                   product and technical documents
infra/                  Supabase setup SQL
render.yaml             Render blueprint for the API
```

---

## Run it locally

Prerequisites: Node.js 20+, npm 10+, and a Postgres 14+ database (local install, Docker, or a free Supabase
project).

### 1. Database

Either point at a Supabase project, or run Postgres locally:

```bash
docker run --name rooftogrid-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
# edit .env: DATABASE_URL, DIRECT_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npm install
npm run migrate:deploy        # applies prisma/migrations
npm run seed                  # optional demo data
npm run dev                   # http://localhost:4000
```

Generate the two secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Useful checks:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/health/ready         # database + storage reachability
curl http://localhost:4000/api/v1/sizing/assumptions   # the numbers behind every estimate
```

In development `STORAGE_DRIVER=local` writes uploads to `backend/.uploads/` (git-ignored). Nothing is served
statically from there — downloads still go through the authenticated endpoint.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local    # Windows: copy .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` must include the version prefix, e.g. `http://localhost:4000/api/v1`.

### 4. Demo login

After `npm run seed`:

```
email:    demo@rooftogrid.com
password: DemoSolar#2026
```

That account has 12 months of bills, a roof profile, a saved sizing run, three quotes (premium, financed and a
suspiciously cheap one), a commissioned project with milestone history, three months of generation logs,
warranties including one about to expire, an open service request, and five documents.

---

## Tests

```bash
cd backend
npm run test:unit    # 95 domain + helper tests, no database required
npm test             # adds API integration tests (skipped automatically without a database)

cd frontend
npm run typecheck
npm run build
```

Test titles carry acceptance-criteria ids (`AC-A11`, `AC-B4`, …) so a failure points at a requirement, not
just a line of code. See [`docs/testing-strategy.md`](docs/testing-strategy.md).

---

## Deploy to production

Target topology: `app.rooftogrid.com` (Vercel) → `api.rooftogrid.com` (Render) → Supabase Postgres + Storage.

### 1. Supabase

1. Create a project, note the region.
2. SQL editor → run [`infra/supabase-setup.sql`](infra/supabase-setup.sql). This creates the **private**
   `rooftogrid-documents` bucket.
3. Collect: pooled connection string (port 6543, append `?pgbouncer=true&connection_limit=1`), direct
   connection string (port 5432), project URL, and the service-role key.

The service-role key is a server-side secret. It belongs only in Render's environment, never in the frontend.

### 2. Render (API)

1. New → Blueprint → select this repo. [`render.yaml`](render.yaml) sets the build, pre-deploy migration and
   health check.
2. Fill the `sync: false` variables: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`. JWT secrets are generated for you.
3. Set `CORS_ORIGINS` to your exact frontend origins (production plus any preview domains you use) and
   `COOKIE_DOMAIN` to `.rooftogrid.com` if the app and API share the domain.
4. Add the custom domain `api.rooftogrid.com` and point a CNAME at the Render host.

Migrations run via `preDeployCommand`. On plans without pre-deploy commands, run `npm run migrate:deploy`
once from a Render shell or one-off job after each schema change.

### 3. Vercel (frontend)

1. Import the repo, set **Root Directory** to `frontend`.
2. Environment variable: `NEXT_PUBLIC_API_URL = https://api.rooftogrid.com/api/v1`.
3. Add `app.rooftogrid.com` (and `rooftogrid.com` if you want the apex to serve the app).

### 4. Cross-origin notes

- The refresh token is an httpOnly cookie scoped to `/api/v1/auth`. In production it is issued with
  `Secure` and `SameSite=None`, so the app and API may sit on different hosts.
- Preview deployments get fresh Vercel URLs. Either add them to `CORS_ORIGINS` or use a stable preview alias;
  the allowlist is exact-match by design.
- After the first deploy, verify:
  `curl https://api.rooftogrid.com/api/v1/health/ready` → `{"data":{"ready":true,...}}`

### 5. Seeding production

Don't. `npm run seed` deletes and recreates the demo user. Run it only against development or a staging
database.

---

## Security posture

- bcrypt (cost 12) password hashing; login failures return one generic message.
- 15-minute JWT access tokens plus rotating refresh tokens stored as HMAC-SHA256 hashes; reusing a rotated
  token revokes the whole family.
- Every request body, query and param is validated with Zod before it reaches a service.
- Ownership is enforced in the data layer on every read and write. Not-owned returns 404, never 403 with a
  leak.
- helmet, an exact-match CORS allowlist, and rate limits (global 300/15 min, auth 20/15 min, public sizing
  30/15 min).
- Storage buckets are private; uploads are capped at 10 MB and restricted to PDF/JPEG/PNG/WebP; keys are
  namespaced `u/{userId}/{yyyy}/{mm}/{uuid}.{ext}` and never contain the original filename.
- Structured JSON logs with request ids; credentials and tokens are redacted; stack traces never reach
  clients in production.

## Honesty about the numbers

Estimates come from published averages and static subsidy rules, not a site survey or an irradiance
simulation. Every estimate screen shows the assumption set it used (`IN_2026_07` today), and every saved
sizing run stores a snapshot of those assumptions, so changing the defaults later never rewrites history.
