# Multi-Language & Regional Localization

## Strategic Context

Rooftop solar adoption in India is expanding rapidly beyond metropolitan Tier-1 cities into Tier-2 and Tier-3 urban and semi-urban centers across Karnataka, Gujarat, Maharashtra, Rajasthan, and Uttar Pradesh under the **PM Surya Ghar: Muft Bijli Yojana**.

To eliminate language friction for non-English native homeowners, RoofToGrid incorporates client-side regional localization.

---

## Supported Languages

| Language Code | Language | Native Script | Primary Solar Hubs |
|---|---|---|---|
| `en` | English | English | Pan-India / Tech-forward hubs |
| `hi` | Hindi | हिन्दी | Delhi NCR, UP, MP, Rajasthan, Bihar |
| `gu` | Gujarati | ગુજરાતી | Ahmedabad, Surat, Rajkot, Vadodara |
| `mr` | Marathi | मराठी | Pune, Nagpur, Nashik, Chhatrapati Sambhajinagar |

---

## Implementation Architecture (`lib/i18n.tsx`)

### 1. Zero-Overhead Client State
- Built using a lightweight React Context (`LanguageProvider`, `useLanguage`).
- Zero heavy runtime dependencies (e.g. avoiding massive bundle overhead of heavy external frameworks).
- Instant switching with no page reload required.

### 2. Preference Persistence
- Selected language preference is preserved in browser `localStorage` under `rooftogrid_language_pref`.
- Automatically restores user preference on repeat visits.

### 3. UI Integration (`LanguageSelector.tsx`)
- Sleek dropdown available in:
  - **Desktop Navigation Bar**: Positioned alongside the theme toggle.
  - **Mobile Drawer**: Dedicated bottom row for thumb-friendly switching.
- Displays regional native script titles (हिन्दी, ગુજરાતી, मराठी, English) for clear legibility.

### 4. Localized Surfaces
- **Navigation**: Section links, login, and primary call to actions.
- **Hero Section**: Value propositions, national subsidy badges, and primary sizing CTA.
- **Quick Estimator**: Monthly bill inputs, DISCOM region selectors, subsidy metrics, and 25-year financial breakdown prompts.
