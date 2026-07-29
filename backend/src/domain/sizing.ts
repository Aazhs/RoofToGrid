/**
 * Rule-based sizing, suitability and savings model (design §3.2).
 * Traces to AC-A7 … AC-A14. Pure functions only — no I/O, no framework imports (NFR-X4).
 */
import {
  AssumptionSet,
  IN_2026_07,
  OrientationKey,
  RoofTypeKey,
  ShadingKey,
  costPerKwp,
  publicAssumptions,
  subsidyForSize,
} from './assumptions';
import { round, roundToHalf } from './math';

export type SuitabilityRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNSUITABLE';
export type ScenarioKeyName = 'CONSERVATIVE' | 'OPTIMAL' | 'MAX_ROOF';

export interface SizingInput {
  avgMonthlyUnits: number;
  tariffPerKwh: number;
  roofType: RoofTypeKey;
  usableAreaSqft: number;
  orientation: OrientationKey;
  shadingLevel: ShadingKey;
}

export interface ScenarioResult {
  key: ScenarioKeyName;
  label: string;
  systemSizeKwp: number;
  annualGenerationKwh: number;
  monthlyGenerationKwh: number;
  estimatedCost: number;
  subsidyAmount: number;
  netCost: number;
  annualSavings: number;
  monthlySavings: number;
  paybackYears: number | null;
  lifetimeSavings25y: number;
  co2OffsetTonnesPerYear: number;
  roofAreaRequiredSqft: number;
  offsetPercent: number;
  notes: string;
}

export interface SuitabilityResult {
  rating: SuitabilityRating;
  reasons: string[];
}

export interface SizingResult {
  suitability: SuitabilityRating;
  suitabilityReasons: string[];
  roofCapacityKwp: number;
  loadBasedKwp: number;
  annualConsumptionKwh: number;
  scenarios: ScenarioResult[];
  assumptions: ReturnType<typeof publicAssumptions>;
  assumptionSetId: string;
  yieldEngine: string;
}

/**
 * Smallest system we will size. AC-A9 fixes the hard floor at 60 sqft of usable area, which on a flat roof
 * (100 sqft/kWp) is only 0.6 kWp — so the practical floor has to be half a kWp, not a full one, otherwise
 * a roof that passes the area test would still be reported as unsuitable (design §7).
 */
export const MIN_SYSTEM_KWP = 0.5;

const SCENARIO_LABELS: Record<ScenarioKeyName, string> = {
  CONSERVATIVE: 'Conservative — lower upfront cost',
  OPTIMAL: 'Optimal — matches your usage',
  MAX_ROOF: 'Maximum — uses your full roof',
};

const SCENARIO_NOTES: Record<ScenarioKeyName, string> = {
  CONSERVATIVE:
    'Covers most of your daytime usage with the smallest spend. A good fit if your budget is tight.',
  OPTIMAL:
    'Sized to offset close to your full yearly consumption. Usually the best payback for homeowners.',
  MAX_ROOF:
    'Fills the usable roof area you reported. Best if you expect usage to grow (EV, air conditioning).',
};

/** Roof capacity after shading derate (AC-A7). */
export function roofCapacityKwp(
  usableAreaSqft: number,
  roofType: RoofTypeKey,
  shadingLevel: ShadingKey,
  set: AssumptionSet = IN_2026_07,
): number {
  const areaPerKwp = set.areaPerKwpSqft[roofType];
  if (!Number.isFinite(usableAreaSqft) || usableAreaSqft <= 0 || !areaPerKwp) return 0;
  return round((usableAreaSqft / areaPerKwp) * set.shadingDerate[shadingLevel], 2);
}

/** Size needed to offset annual consumption at this roof's orientation and shading. */
export function loadBasedKwp(
  avgMonthlyUnits: number,
  orientation: OrientationKey,
  shadingLevel: ShadingKey,
  set: AssumptionSet = IN_2026_07,
): number {
  const perKwpYield =
    set.specificYieldKwhPerKwp * set.orientationFactor[orientation] * set.shadingDerate[shadingLevel];
  if (perKwpYield <= 0) return 0;
  return round((avgMonthlyUnits * 12) / perKwpYield, 2);
}

/** AC-A11 */
export function annualGenerationKwh(
  systemSizeKwp: number,
  orientation: OrientationKey,
  shadingLevel: ShadingKey,
  set: AssumptionSet = IN_2026_07,
): number {
  return Math.round(
    systemSizeKwp *
      set.specificYieldKwhPerKwp *
      set.orientationFactor[orientation] *
      set.shadingDerate[shadingLevel],
  );
}

/**
 * Savings are capped at what the household actually consumes, scaled by the self-consumption ratio,
 * so export credit is never valued at full retail tariff (design §3.2, mirrors AC-D4).
 */
export function annualSavings(
  generationKwh: number,
  annualConsumptionKwh: number,
  tariffPerKwh: number,
  set: AssumptionSet = IN_2026_07,
): number {
  const usable = Math.min(generationKwh * set.selfConsumptionRatio, annualConsumptionKwh);
  return round(Math.max(0, usable) * tariffPerKwh, 0);
}

/** AC-A13: null instead of Infinity when there is nothing to save. */
export function paybackYears(netCost: number, savingsPerYear: number): number | null {
  if (!Number.isFinite(savingsPerYear) || savingsPerYear <= 0) return null;
  return round(netCost / savingsPerYear, 1);
}

/** Σ over the analysis period with tariff escalation and panel degradation. */
export function lifetimeSavings(
  firstYearSavings: number,
  set: AssumptionSet = IN_2026_07,
): number {
  let total = 0;
  const esc = set.tariffEscalationPct / 100;
  const deg = set.degradationPctPerYear / 100;
  for (let y = 0; y < set.analysisPeriodYears; y += 1) {
    total += firstYearSavings * (1 + esc) ** y * (1 - deg) ** y;
  }
  return Math.round(total);
}

/** AC-A8 / AC-A9 — always returns at least one human-readable reason. */
export function assessSuitability(
  input: SizingInput,
  capacityKwp: number,
  set: AssumptionSet = IN_2026_07,
): SuitabilityResult {
  const reasons: string[] = [];
  const orientationFactor = set.orientationFactor[input.orientation];

  if (input.shadingLevel === 'HEAVY') {
    reasons.push(
      'Heavy shading through the day would cut generation so much that solar is hard to justify. ' +
        'Trimming trees or using a different roof face can change this.',
    );
    return { rating: 'UNSUITABLE', reasons };
  }

  if (input.usableAreaSqft < set.minUsableAreaSqft) {
    reasons.push(
      `Usable roof area of ${Math.round(input.usableAreaSqft)} sqft is below the ${set.minUsableAreaSqft} sqft ` +
        'needed for even a 1 kWp system (roughly two panels).',
    );
    return { rating: 'UNSUITABLE', reasons };
  }

  if (capacityKwp < MIN_SYSTEM_KWP) {
    reasons.push(
      `After allowing for walkways and shading, the roof fits less than ${MIN_SYSTEM_KWP} kWp, which is ` +
        'below the smallest system worth installing.',
    );
    return { rating: 'UNSUITABLE', reasons };
  }

  // Area
  if (capacityKwp >= 5) {
    reasons.push(`Roof can hold roughly ${capacityKwp} kWp, which is generous for a home system.`);
  } else if (capacityKwp >= 3) {
    reasons.push(`Roof can hold roughly ${capacityKwp} kWp, enough for a typical household.`);
  } else {
    reasons.push(
      `Roof can hold roughly ${capacityKwp} kWp, so expect a compact system. Systems under 1 kWp do not ` +
        'qualify for the residential subsidy.',
    );
  }

  // Orientation
  if (orientationFactor >= 0.96) {
    reasons.push('Orientation is close to ideal for the northern hemisphere (south facing).');
  } else if (orientationFactor >= 0.88) {
    reasons.push('East or west facing roofs still generate well, about 12% below a south facing roof.');
  } else if (orientationFactor >= 0.8) {
    reasons.push('Off-south orientation costs roughly 20% of potential generation.');
  } else {
    reasons.push(
      'North facing roofs lose close to 30% of potential generation. Tilted mounting structures can recover part of that.',
    );
  }

  // Shading
  if (input.shadingLevel === 'NONE') {
    reasons.push('No reported shading, so panels should run at full output through the day.');
  } else if (input.shadingLevel === 'LIGHT') {
    reasons.push('Light shading trims about 8% of generation.');
  } else {
    reasons.push('Moderate shading trims about 20% of generation; panel layout matters here.');
  }

  // Roll up
  let rating: SuitabilityRating;
  if (input.shadingLevel === 'NONE' && orientationFactor >= 0.96 && capacityKwp >= 3) {
    rating = 'EXCELLENT';
  } else if (input.shadingLevel !== 'MODERATE' && orientationFactor >= 0.88 && capacityKwp >= 2) {
    rating = 'GOOD';
  } else if (orientationFactor >= 0.8 || input.shadingLevel === 'MODERATE') {
    rating = 'FAIR';
  } else {
    rating = 'POOR';
  }

  if (input.roofType === 'FLAT') {
    reasons.push('Flat roofs need a raised structure, which adds cost but lets panels face the ideal angle.');
  }

  return { rating, reasons };
}

function buildScenario(
  key: ScenarioKeyName,
  systemSizeKwp: number,
  input: SizingInput,
  annualConsumptionKwh: number,
  set: AssumptionSet,
): ScenarioResult {
  const generation = annualGenerationKwh(systemSizeKwp, input.orientation, input.shadingLevel, set);
  const estimatedCost = Math.round(systemSizeKwp * costPerKwp(systemSizeKwp, set));
  const subsidyAmount = subsidyForSize(systemSizeKwp, set);
  const netCost = Math.max(0, estimatedCost - subsidyAmount);
  const savings = annualSavings(generation, annualConsumptionKwh, input.tariffPerKwh, set);

  return {
    key,
    label: SCENARIO_LABELS[key],
    systemSizeKwp: round(systemSizeKwp, 2),
    annualGenerationKwh: generation,
    monthlyGenerationKwh: Math.round(generation / 12),
    estimatedCost,
    subsidyAmount,
    netCost,
    annualSavings: savings,
    monthlySavings: Math.round(savings / 12),
    paybackYears: paybackYears(netCost, savings),
    lifetimeSavings25y: lifetimeSavings(savings, set),
    co2OffsetTonnesPerYear: round((generation * set.co2KgPerKwh) / 1000, 2),
    roofAreaRequiredSqft: Math.round(systemSizeKwp * set.areaPerKwpSqft[input.roofType]),
    offsetPercent:
      annualConsumptionKwh > 0 ? round((generation / annualConsumptionKwh) * 100, 0) : 0,
    notes: SCENARIO_NOTES[key],
  };
}

/**
 * Main entry point used by both the public estimate endpoint and the persisted run (AC-A1, AC-A15).
 */
export function computeSizing(input: SizingInput, set: AssumptionSet = IN_2026_07): SizingResult {
  const capacity = roofCapacityKwp(input.usableAreaSqft, input.roofType, input.shadingLevel, set);
  const loadBased = loadBasedKwp(input.avgMonthlyUnits, input.orientation, input.shadingLevel, set);
  const annualConsumptionKwh = Math.round(input.avgMonthlyUnits * 12);
  const suitability = assessSuitability(input, capacity, set);

  const base = {
    suitability: suitability.rating,
    suitabilityReasons: suitability.reasons,
    roofCapacityKwp: capacity,
    loadBasedKwp: loadBased,
    annualConsumptionKwh,
    assumptions: publicAssumptions(set),
    assumptionSetId: set.id,
    yieldEngine: 'rule-based',
  };

  // AC-A9: no scenario cards for an unsuitable roof, just the explanation.
  if (suitability.rating === 'UNSUITABLE') {
    return { ...base, scenarios: [] };
  }

  // Never exceed derated capacity, and never go below the practical floor (AC-A10).
  const maxSize = Math.max(MIN_SYSTEM_KWP, Math.floor(capacity * 2) / 2);
  const candidates: Array<{ key: ScenarioKeyName; size: number }> = [
    { key: 'CONSERVATIVE', size: Math.max(MIN_SYSTEM_KWP, roundToHalf(loadBased * 0.7)) },
    { key: 'OPTIMAL', size: Math.max(MIN_SYSTEM_KWP, roundToHalf(loadBased)) },
    { key: 'MAX_ROOF', size: maxSize },
  ].map((c) => ({ key: c.key as ScenarioKeyName, size: Math.min(roundToHalf(c.size), maxSize) }));

  // Dedupe by size, keeping the later (more roof-bound) key so a clamped set reads honestly (AC-A10).
  const bySize = new Map<number, ScenarioKeyName>();
  for (const c of candidates) bySize.set(c.size, c.key);

  const scenarios = [...bySize.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([size, key]) => buildScenario(key, size, input, annualConsumptionKwh, set));

  return { ...base, scenarios };
}

/** AC-A6 — 12-month mean units and units-weighted average tariff for wizard pre-fill. */
export function billStats(
  bills: Array<{ billMonth: string; unitsKwh: number; tariffPerKwh: number; billAmount?: number | null }>,
): {
  monthsCounted: number;
  avgMonthlyUnits: number;
  weightedTariffPerKwh: number;
  avgMonthlyBill: number | null;
  ready: boolean;
} {
  const recent = [...bills].sort((a, b) => b.billMonth.localeCompare(a.billMonth)).slice(0, 12);
  if (recent.length === 0) {
    return {
      monthsCounted: 0,
      avgMonthlyUnits: 0,
      weightedTariffPerKwh: 0,
      avgMonthlyBill: null,
      ready: false,
    };
  }
  const totalUnits = recent.reduce((sum, b) => sum + b.unitsKwh, 0);
  const weightedTariff =
    totalUnits > 0
      ? recent.reduce((sum, b) => sum + b.tariffPerKwh * b.unitsKwh, 0) / totalUnits
      : 0;
  const amounts = recent.filter((b) => typeof b.billAmount === 'number');

  return {
    monthsCounted: recent.length,
    avgMonthlyUnits: round(totalUnits / recent.length, 1),
    weightedTariffPerKwh: round(weightedTariff, 2),
    avgMonthlyBill:
      amounts.length > 0
        ? round(amounts.reduce((s, b) => s + (b.billAmount as number), 0) / amounts.length, 0)
        : null,
    ready: recent.length >= 3, // AC-A6
  };
}
