# Next-Gen Architecture & Stack Migration Evaluation

## Strategic Goal
Migrate RoofToGrid away from React / Next.js and Node.js to a lean, modern, high-performance architecture while preserving Supabase for database, authentication, and object storage.

---

## 1. Frontend Alternatives (Replacing React & Next.js)

| Framework | Architecture | Bundle Size | Reactivity Model | Supabase Integration | Best For |
|---|---|---|---|---|---|
| **Svelte 5 / SvelteKit** *(Recommended)* | Compiler-based (No Virtual DOM) | Extremely small (~15–25 KB) | Fine-grained native Runes (`$state`, `$derived`) | First-class official `@supabase/ssr` support | Interactive calculators, high performance, clean syntax |
| **SolidJS / SolidStart** | Reactive JSX (No Virtual DOM) | Minimal (~20 KB) | Fine-grained Signals | Solid-Supabase community & standard JS client | If retaining JSX familiarity is desired |
| **Astro + Islands** | Multi-Page App (MPA) with Islands | Near-zero JS default | Framework-agnostic islands (Svelte/Solid) | Excellent static/SSR with Supabase client | Content-heavy pages with isolated calculator widgets |
| **Vue 3 / Nuxt 3** | Virtual DOM with reactivity compiler | Moderate (~50–70 KB) | Proxy-based `ref` / `reactive` | Official `@nuxtjs/supabase` module | Traditional enterprise SPA/SSR |

### Recommendation: SvelteKit (Svelte 5)
- **Why Svelte 5?**: Svelte eliminates the virtual DOM entirely by compiling components into tiny, vanilla JavaScript that directly manipulates the DOM.
- **Benefits for RoofToGrid**:
  1. **Instant Slider & Calculator Updates**: Svelte 5 runes (`$state`, `$derived`) re-evaluate formulas in sub-millisecond time without React re-render cascades.
  2. **Much Smaller Mobile Bundles**: Indian mobile users on 4G networks experience 3–4x faster initial page loads compared to Next.js bundles.
  3. **Built-in CSS Scoping & Transitions**: Fluid animations for modals, toasts, and social proof counters without external heavy animation libraries.

---

## 2. Backend Alternatives (Uncommon / Non-Node & Non-Python)

| Language & Framework | Binary / Runtime | Memory Footprint | Latency & Concurrency | Supabase / Postgres Driver | Production Strengths |
|---|---|---|---|---|---|
| **Go (Golang with Chi / Fiber)** *(Recommended)* | Single compiled binary (~15MB) | ~15–25 MB RAM | Sub-millisecond latency, lightweight Goroutines | `pgx` (High-perf native PG driver) + Supabase Go client | Extreme simplicity, rapid compilation, cloud-native standard |
| **Rust (Axum + SQLx)** | Single compiled binary (~20MB) | ~8–15 MB RAM | Zero-cost abstractions, absolute maximum speed | `sqlx` (Compile-time verified SQL queries) | Unmatched type safety and resource efficiency, steeper learning curve |
| **Elixir (Phoenix / Plug)** | Erlang BEAM VM | ~40–60 MB RAM | Actor model, legendary fault tolerance | `Postgrex` / `Ecto` | Real-time websockets (LiveView), multi-node distribution |
| **Zig / Nim (HTTP)** | Single native binary | <10 MB RAM | C-level performance | Native C-Postgres bindings | Ultra-niche systems programming |

### Recommendation: Go (Golang) with Chi & pgx
- **Why Go?**:
  1. **Single Static Binary**: Eliminates `node_modules` entirely. Builds into a 15MB standalone binary that deploys anywhere in seconds.
  2. **10x Lower Resource Footprint**: Runs easily on a $5/mo VPS or free container tier with <25MB RAM, compared to Node.js's 150MB+ baseline.
  3. **Native PostgreSQL (`pgx`)**: Connects directly to Supabase with built-in connection pooling, parameterized queries, and SSL.
  4. **Readable & Maintainable**: Solar math (sizing formulas, subsidy tiers, financial amortization, quote normalization) translates into clean, unbloated Go packages.

---

## 3. Storage & Infrastructure: Supabase (Preserved)

- **Database**: PostgreSQL on Supabase (managed schema with Prisma or native SQL migrations).
- **Authentication**: Supabase Auth (Go backend validates JWT tokens using Supabase public key; frontend manages auth state).
- **Row Level Security (RLS)**: Protects user bills, roof measurements, and quotes at the database layer.
- **Storage Buckets**: Supabase Storage for bill PDFs, quote estimates, and balcony photos.

---

## 4. Phased Migration Strategy (Zero Downtime)

```
Phase M1: Finalize Stack Decision (SvelteKit + Go)
    │
    ▼
Phase M2: Build Go Backend in parallel (`backend-go/`)
  - Health checks, Supabase connection pool, JWT middleware
  - Sizing calculation engine, quote scoring engine
  - REST endpoints matching current `/api/v1/*` contracts
    │
    ▼
Phase M3: Build SvelteKit Frontend in parallel (`frontend-svelte/`)
  - Lumina Grid design system in Vanilla CSS / Svelte components
  - Sizing calculators, instant estimator, regional language i18n
    │
    ▼
Phase M4: Feature Porting
  - Bill OCR, AI quote parser, inverter telemetry, balcony CV
    │
    ▼
Phase M5: Cutover & Deprecation of legacy Next.js / Express
```
