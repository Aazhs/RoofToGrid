/**
 * Versioned assumption sets (NFR-X1, AC-A14).
 *
 * Every persisted SizingRun stores `assumptionSetId` plus a full JSON snapshot, so changing the defaults
 * here never rewrites history. Pure data + pure functions only — no I/O, no framework imports (NFR-X4).
 */

export type RoofTypeKey = 'FLAT' | 'SLOPED' | 'MIXED';
export type OrientationKey = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type ShadingKey = 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY';

export interface CostBand {
  /** upper bound of system size in kWp, inclusive; Infinity for the last band */
  maxKwp: number;
  costPerKwp: number;
}

export interface AssumptionSet {
  id: string;
  region: string;
  currency: string;
  label: string;
  /** kWh generated per kWp per year at ideal orientation with no shading */
  specificYieldKwhPerKwp: number;
  /** roof area consumed per kWp, by roof type (AC-A7) */
  areaPerKwpSqft: Record<RoofTypeKey, number>;
  /** multiplier applied to capacity and generation (AC-A7) */
  shadingDerate: Record<ShadingKey, number>;
  /** generation multiplier by roof orientation */
  orientationFactor: Record<OrientationKey, number>;
  costPerKwpBands: CostBand[];
  subsidy: {
    programme: string;
    perKwFirst2Kw: number;
    thirdKwAmount: number;
    capAmount: number;
    minSystemKwp: number;
  };
  tariffEscalationPct: number;
  degradationPctPerYear: number;
  co2KgPerKwh: number;
  /** fraction of generation that displaces retail-tariff consumption (design §3.2, AC-D4) */
  selfConsumptionRatio: number;
  /** 12 factors, index 0 = January, summing to 1.0 (AC-D2) */
  monthlySeasonality: number[];
  /** minimum usable roof area below which we refuse to size a system (AC-A9) */
  minUsableAreaSqft: number;
  analysisPeriodYears: number;
  disclaimer: string;
}

export const IN_2026_07: AssumptionSet = {
  id: 'IN_2026_07',
  region: 'IN',
  currency: 'INR',
  label: 'India residential — July 2026',
  specificYieldKwhPerKwp: 1450,
  areaPerKwpSqft: { FLAT: 100, SLOPED: 80, MIXED: 90 },
  shadingDerate: { NONE: 1.0, LIGHT: 0.92, MODERATE: 0.8, HEAVY: 0.65 },
  orientationFactor: {
    S: 1.0,
    SE: 0.96,
    SW: 0.96,
    E: 0.88,
    W: 0.88,
    NE: 0.8,
    NW: 0.8,
    N: 0.72,
  },
  costPerKwpBands: [
    { maxKwp: 3, costPerKwp: 65000 },
    { maxKwp: 5, costPerKwp: 58000 },
    { maxKwp: 10, costPerKwp: 52000 },
    { maxKwp: Number.POSITIVE_INFINITY, costPerKwp: 48000 },
  ],
  subsidy: {
    programme: 'PM Surya Ghar (residential, static rules)',
    perKwFirst2Kw: 30000,
    thirdKwAmount: 18000,
    capAmount: 78000,
    minSystemKwp: 1,
  },
  tariffEscalationPct: 3.0,
  degradationPctPerYear: 0.5,
  co2KgPerKwh: 0.71,
  selfConsumptionRatio: 0.85,
  monthlySeasonality: [
    0.078, 0.082, 0.092, 0.095, 0.094, 0.08, 0.069, 0.07, 0.078, 0.086, 0.089, 0.087,
  ],
  minUsableAreaSqft: 60,
  analysisPeriodYears: 25,
  disclaimer:
    'These are conservative estimates based on published averages, not a site survey. Actual generation, ' +
    'cost, subsidy and savings depend on your roof, shading, equipment, tariff slab and DISCOM policy. ' +
    'Always confirm with a physical site assessment before signing a contract.',
};

const REGISTRY: Record<string, AssumptionSet> = {
  [IN_2026_07.id]: IN_2026_07,
};

export const DEFAULT_ASSUMPTION_SET_ID = IN_2026_07.id;

export function getAssumptionSet(id?: string | null): AssumptionSet {
  if (!id) return IN_2026_07;
  return REGISTRY[id] ?? IN_2026_07;
}

export function getAssumptionSetForRegion(region?: string | null): AssumptionSet {
  // Phase 3 adds market packs keyed by region (roadmap §3.1). Today everything resolves to India.
  const match = Object.values(REGISTRY).find((set) => set.region === (region ?? 'IN'));
  return match ?? IN_2026_07;
}

export function costPerKwp(systemSizeKwp: number, set: AssumptionSet = IN_2026_07): number {
  for (const band of set.costPerKwpBands) {
    if (systemSizeKwp <= band.maxKwp) return band.costPerKwp;
  }
  return set.costPerKwpBands[set.costPerKwpBands.length - 1].costPerKwp;
}

/**
 * PM Surya Ghar residential subsidy, static rules (AC-A12).
 *  0.9 kWp -> 0 | 1 -> 30,000 | 2 -> 60,000 | 2.5 -> 69,000 | 3+ -> 78,000 (capped)
 */
export function subsidyForSize(systemSizeKwp: number, set: AssumptionSet = IN_2026_07): number {
  const { perKwFirst2Kw, thirdKwAmount, capAmount, minSystemKwp } = set.subsidy;
  if (!Number.isFinite(systemSizeKwp) || systemSizeKwp < minSystemKwp) return 0;
  const firstTwo = Math.min(systemSizeKwp, 2) * perKwFirst2Kw;
  const third = systemSizeKwp > 2 ? Math.min(systemSizeKwp - 2, 1) * thirdKwAmount : 0;
  return Math.min(Math.round(firstTwo + third), capAmount);
}

/** Sanity guard used by tests and the readiness check: seasonality must be a true distribution. */
export function seasonalitySum(set: AssumptionSet = IN_2026_07): number {
  return set.monthlySeasonality.reduce((a, b) => a + b, 0);
}

/** Shape sent to clients on every estimate screen (AC-A14, NFR-U4). */
export function publicAssumptions(set: AssumptionSet = IN_2026_07) {
  return {
    assumptionSetId: set.id,
    label: set.label,
    region: set.region,
    currency: set.currency,
    specificYieldKwhPerKwp: set.specificYieldKwhPerKwp,
    areaPerKwpSqft: set.areaPerKwpSqft,
    shadingDerate: set.shadingDerate,
    orientationFactor: set.orientationFactor,
    costPerKwpBands: set.costPerKwpBands.map((b) => ({
      maxKwp: Number.isFinite(b.maxKwp) ? b.maxKwp : null,
      costPerKwp: b.costPerKwp,
    })),
    subsidy: set.subsidy,
    tariffEscalationPct: set.tariffEscalationPct,
    degradationPctPerYear: set.degradationPctPerYear,
    co2KgPerKwh: set.co2KgPerKwh,
    selfConsumptionRatio: set.selfConsumptionRatio,
    analysisPeriodYears: set.analysisPeriodYears,
    disclaimer: set.disclaimer,
  };
}
