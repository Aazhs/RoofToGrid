# Feature: Rough Numbers in 30 Seconds — Landing Page Calculator

## Overview

An inline, no-signup solar estimator on the landing page that lets visitors get a quick sizing estimate in 30 seconds without creating an account. This was a high-engagement feature from the previous landing page design.

> **IMPORTANT**: This is a **future feature** documented for later implementation. No code changes needed now.

---

## User Value

- **Zero friction** — no account required, nothing is saved
- **Instant gratification** — visitors see rough solar numbers immediately
- **Conversion funnel** — after seeing results, users are motivated to sign up for the full detailed analysis

---

## UI Specification

### Location
Place between the **StatsCounter** and **FeatureGrid** sections on the landing page, or as an interactive panel within the Hero section.

### Form Fields

| Field | Type | Default | Required | Hint |
|---|---|---|---|---|
| Average monthly units | `number` | 350 | ✅ | The units (kWh) line on your electricity bill, averaged over a year |
| Tariff per unit (₹) | `number` | 8.5 | ✅ | Divide your bill amount by the units if you are not sure |
| Roof type | `select` | Flat / terrace | No | Options: Flat/terrace, Sloped/tiled, Mixed |
| Usable roof area (sqft) | `number` | 500 | ✅ | Only the shade-free part you are happy to cover, leaving walkways |
| Orientation | `select` | South (best) | No | Options from existing `ORIENTATIONS` constant |
| Shading | `select` | None | No | Options from existing `SHADING_LEVELS` constant |

### CTA Button
**"Show my options"** — runs the calculation client-side (no API call needed)

### Results Panel
After clicking, show a card below the form with:
- **Recommended system size** (kWp) — from the sizing domain logic
- **Estimated monthly savings** (₹)
- **Approximate payback period** (years)
- **PM Surya Ghar subsidy estimate** (₹)
- **CTA**: "Sign up to get your full detailed report →" linking to `/register`

---

## Technical Notes

### Calculation
Reuse the existing frontend-compatible sizing logic from `backend/domain/sizing.ts`. The rough calculator can use simplified constants:

```typescript
const SPECIFIC_YIELD = 1450; // kWh/kWp/year (India average)
const PANEL_DEGRADATION = 0.005; // 0.5%/year
const SQFT_PER_KWP = { FLAT: 100, SLOPED: 80, MIXED: 90 };
const ORIENTATION_FACTOR = { S: 1.0, SE: 0.95, SW: 0.95, E: 0.90, W: 0.90, NE: 0.80, NW: 0.80, N: 0.75 };
const SHADING_FACTOR = { NONE: 1.0, LIGHT: 0.93, MODERATE: 0.80, HEAVY: 0.60 };

// Subsidy (PM Surya Ghar 2024-25 rates)
// Up to 2 kW: ₹30,000/kW
// 2-3 kW: ₹18,000/kW (for the 3rd kW)
// Above 3 kW: no additional subsidy
// Max: ₹78,000
```

### Implementation
- **Client-side only** — no API call, no auth, no data persistence
- **New component**: `components/landing/RoughCalculator.tsx`
- **Add to**: `app/page.tsx` between `<StatsCounter />` and `<FeatureGrid />`
- **Reuse**: Existing constants from `lib/constants.ts` (`ROOF_TYPES`, `ORIENTATIONS`, `SHADING_LEVELS`)
- **Styling**: Match landing page design tokens (surface, on-surface, primary-container, etc.)

### Existing Constants to Reuse
- `ROOF_TYPES` — `frontend/lib/constants.ts` lines 35-39
- `ORIENTATIONS` — `frontend/lib/constants.ts` lines 41-50
- `SHADING_LEVELS` — `frontend/lib/constants.ts` lines 52-57
