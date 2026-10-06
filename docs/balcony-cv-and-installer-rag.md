# Technical Specification: Balcony AI Vision & Installer Price Intelligence RAG

## Document Overview
This research document describes two possible future capabilities. Neither is implemented or offered in the current product:
1. **Balcony & Terrace AI Vision Dimension Estimator**: Multi-angle computer vision system estimating physical dimensions and plug-and-play solar feasibility for Indian apartment balconies.
2. **Nationwide Solar Installer Price Intelligence & AI RAG Comparison Engine**: Comprehensive price benchmark database combined with real-time web retrieval to provide realistic, localized installer comparisons across India.

---

# Part 1: Balcony & Terrace AI Vision Dimension Estimator

## 1. Problem Context
Over 60 million Indian urban households live in multi-story apartment complexes (Bengaluru, Mumbai, Pune, Delhi NCR, Hyderabad, Chennai, Ahmedabad). The vast majority do not possess individual rooftop rights, disqualifying them from traditional 3–10 kWp rooftop solar setups.

However, many apartment balconies receive 4 to 6 hours of unshaded daily sunlight. Emerging **balcony solar kits** (typically 400W–800W micro-inverter systems hooked to railings or exterior walls) can generate 1.5–3.5 kWh daily, offsetting continuous base loads (refrigerators, ceiling fans, Wi-Fi routers, home offices) without requiring roof access.

Homeowners lack the technical ability to accurately measure railing length, assess structural railing types, identify shading obstructions, and determine what kit will physically and legally fit.

---

## 2. System Architecture

```
[User Camera / Photos]
  (1 to 4 angles: Facing Railing, Side Depth, Floor/Ceiling)
           │
           ▼
[Client Preprocessing]
  - EXIF orientation correction
  - Resize & WebP compression (max 1600x1200)
  - Privacy blur: detect and mask faces / interior rooms
           │
           ▼
[Spatial Estimation Engine]
  ┌──────────────────────────────────────────────────┐
  │ Phase 1 (Immediate):                             │
  │ Google Gemini Multimodal Vision API              │
  │ (gemini-1.5-flash / gemini-2.0-flash)            │
  │ - Spatial anchor calibration (doors, tiles, AC)  │
  │ - Structured JSON schema enforcement             │
  ├──────────────────────────────────────────────────┤
  │ Phase 2 (Future):                                │
  │ Custom Edge Computer Vision Pipeline             │
  │ - Object Detection: YOLOv11-seg (balcony railing)│
  │ - Metric Depth: Depth Anything V2                │
  │ - 3D Point-Cloud / Photogrammetry projection     │
  └──────────────────────────────────────────────────┘
           │
           ▼
[Feasibility Output & Solar Kit Recommender]
  - Railing usable length & height
  - Usable surface area (sq. ft. & sq. m)
  - Recommended kit (e.g. 400W vs 800W TopCon)
  - Daily energy yield (kWh) & bill offset (₹)
  - Society / RWA compliance & mounting checklist
```

---

## 3. Phase 1 Implementation: Gemini Multimodal Vision API

### Reference Anchor Scaling
To derive real-world metric dimensions from 2D images without depth sensors (LiDAR), Gemini is instructed to locate standardized architectural reference objects common to Indian apartments:
- **Balcony Access Doorway**: Standard standard door height = 2.1 m (7.0 ft), width = 0.9 m (3.0 ft).
- **Parapet / Railing Height**: Standard Indian municipal building bylaws mandate 1.0 m to 1.1 m (3.3–3.6 ft) railing height.
- **Vitrified Floor Tiles**: Standard sizes = 600 mm × 600 mm (2 × 2 ft) or 300 mm × 300 mm (1 × 1 ft).
- **Split AC Outdoor Unit**: Standard dimensions = ~0.8 m width × 0.55 m height.

### Structured Output Schema
```typescript
export interface BalconyEstimationResult {
  dimensions: {
    railingLengthMeters: number;
    railingHeightMeters: number;
    floorDepthMeters: number;
    usableAreaSqMeters: number;
    usableAreaSqFt: number;
    confidenceScore: number; // 0 to 100%
  };
  railingType: 'MS_GRILL' | 'STAINLESS_STEEL' | 'TOUGHENED_GLASS' | 'CONCRETE_PARAPET' | 'MIXED';
  orientation: {
    estimatedHeading: 'SOUTH' | 'SOUTH_WEST' | 'SOUTH_EAST' | 'EAST' | 'WEST' | 'NORTH';
    solarExposureRating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
    dailySunlightHours: number;
  };
  obstructions: {
    hasOverhang: boolean;
    hasAdjacentBuildingShadow: boolean;
    hasTreeShadow: boolean;
    details: string;
  };
  recommendedSolarSetup: {
    capacityWatts: number; // e.g. 400 or 800
    panelType: 'RIGID_BIFACIAL' | 'LIGHTWEIGHT_FLEXIBLE';
    panelCount: number;
    inverterType: 'PLUG_AND_PLAY_MICROINVERTER';
    estimatedDailyKwh: number;
    estimatedMonthlySavingsInr: number;
  };
  complianceGuidance: {
    rwaNocRequired: boolean;
    safetyPrecautions: string[];
  };
}
```

---

# Part 2: Nationwide Installer Price Intelligence & AI RAG Comparison

## 1. Problem Context
India's residential solar installation market is highly decentralized:
- **National Brands**: Tata Power Solar, Waaree Energies, Loom Solar, Havells Solar, Luminous.
- **Tech-Forward D2C EPCs**: SolarSquare, Freyr Energy, EcoSoch, SolarSmiths, ZunRoof.
- **Local Empanelled EPCs**: Over 5,000 local vendors empanelled under the PM Surya Ghar National Portal across DISCOM circles (e.g. BESCOM, MSEDCL, UGVCL, BSES, TANGEDCO).

Prices for the exact same system capacity (e.g. 5 kWp) vary from **₹2,50,000 to ₹3,60,000 gross** across different vendors. Homeowners struggle to understand:
1. Is the price premium for a brand like Tata Power Solar or SolarSquare justified?
2. What hardware difference exists between TopCon vs Mono PERC, or String vs Microinverters?
3. Which vendors bundle DISCOM net-metering liaison fees versus passing them on as unexpected surprise costs?

---

## 2. System Architecture

```
[Homeowner Inputs]
  - State & PIN Code (e.g. 560034 - Koramangala, Bengaluru)
  - Sanctioned Load / Desired Capacity (e.g. 5 kWp)
  - Monthly Electricity Bill (e.g. ₹5,000/mo)
           │
           ▼
[Intelligence Engine: 2-Tier Pipeline]
  ┌────────────────────────────────────────────────────────┐
  │ Tier 1: Verified National Benchmark Dataset            │
  │ - State-by-state base pricing per kWp                  │
  │ - Equipment tiers (TopCon, Mono PERC, Bifacial)        │
  │ - PM Surya Ghar subsidy rules (₹30k / ₹60k / ₹78k)     │
  │ - Installer track record, warranties, and AMC metrics  │
  ├────────────────────────────────────────────────────────┤
  │ Tier 2: Real-Time AI RAG Agent (Gemini + Grounding)    │
  │ - Live web retrieval of active regional rate cards     │
  │ - DISCOM vendor empanelment tenders                    │
  │ - Customer reviews & quote submissions from target PIN │
  └────────────────────────────────────────────────────────┘
           │
           ▼
[Synthesis & Transparency Normalizer]
  - Levelized Price per Watt (₹/Wp)
  - Hardware Quality Score
  - Hidden Cost Detection (Net metering, bi-directional meter)
  - Net Cost calculation post ₹78,000 PM Surya Ghar subsidy
           │
           ▼
[Interactive Homeowner Comparison Card]
  - Side-by-side comparison of 3 to 4 shortlisted installers
  - Badges: "Best Technology", "Best Value", "Fastest Payback"
```

---

## 3. Real-World Benchmark Pricing Matrix (India 2026)

Based on actual market data and PM Surya Ghar benchmark parameters:

| Installer Tier | Representative Brands | Avg Rate / kWp (Gross) | Inverter Make | Panel Technology | Structure Type | AMC Bundled |
|---|---|---|---|---|---|---|
| **Tier 1 Premium National** | Tata Power Solar, Loom Solar | ₹65,000 – ₹78,000 | Growatt / Enphase / Sungrow | N-Type TopCon / Bifacial | Elevated HDG 1.5m | 5 Years Comprehensive |
| **Tier 2 Direct Manufacturer** | Waaree Energies, Vikram Solar, Goldi | ₹54,000 – ₹64,000 | Waaree W1 / GoodWe / Solis | Mono PERC / TopCon | Flush Aluminium / GI | 1–2 Years Free |
| **D2C Tech-Enabled EPCs** | SolarSquare, Freyr Energy, EcoSoch | ₹60,000 – ₹72,000 | Growatt / Deye / SolarEdge | Mono PERC / TopCon | Wind-Resilient HDG | 5 Years + App Telemetry |
| **Local Empanelled Vendors** | DISCOM Portal Empanelled | ₹48,000 – ₹56,000 | Polycab / UTL / Solis | Mono PERC DCR | Standard Ground/Roof Rail | 1 Year Basic |

---

## 4. Key Decision Metrics Provided to User

1. **Gross Turnkey Price vs. Net Cost**:
   - Explicitly subtracts the direct bank transfer (DBT) subsidy under PM Surya Ghar (up to ₹78,000).
2. **Levelized ₹/Watt Analysis**:
   - Converts lump-sum pricing to standard ₹/Wp for apples-to-apples comparison.
3. **Hidden Fee Radar**:
   - Flags whether DISCOM bi-directional meter cost, statutory testing charges, and earthing pit kits are included or billed at actuals.
4. **Warranty Risk Assessment**:
   - Differentiates between installer workmanship warranties (typically 2–5 years) and manufacturer linear performance warranties (25–30 years).
5. **Personalized "Best For" Recommendation**:
   - High consumption + small roof -> **TopCon / Bifacial (Tata Power / SolarSquare)**
   - Budget-conscious + maximum payback speed -> **Waaree / Empanelled EPC**
