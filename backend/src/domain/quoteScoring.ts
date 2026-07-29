/**
 * Quote normalization and transparent scoring (design §3.3).
 * Traces to AC-B1 … AC-B7. Pure functions only (NFR-X4).
 */
import { AssumptionSet, IN_2026_07, subsidyForSize } from './assumptions';
import { linearScore, monthlyEmi, round } from './math';

export type PanelTechnologyKey =
  | 'MONO_PERC'
  | 'TOPCON'
  | 'HJT'
  | 'N_TYPE'
  | 'POLY'
  | 'THIN_FILM'
  | 'UNKNOWN';
export type InverterTypeKey = 'STRING' | 'MICRO' | 'HYBRID' | 'UNKNOWN';
export type EquipmentTierKey = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type FinancingTypeKey = 'CASH' | 'LOAN' | 'LEASE_PPA';
export type GenerationSourceKey = 'INSTALLER' | 'PLATFORM';

export interface QuoteInput {
  installerName: string;
  systemSizeKwp: number;
  totalPrice: number;
  panelBrand?: string | null;
  panelTechnology: PanelTechnologyKey;
  panelWattage?: number | null;
  panelProductWarrantyYears: number;
  panelPerformanceWarrantyYears: number;
  inverterBrand?: string | null;
  inverterType: InverterTypeKey;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  includesAmcYears: number;
  expectedAnnualGenerationKwh?: number | null;
  financingType: FinancingTypeKey;
  interestRatePct?: number | null;
  tenureMonths?: number | null;
  downPayment?: number | null;
}

/** Household context so savings are comparable across quotes (AC-B5). */
export interface ScoringContext {
  tariffPerKwh: number;
  annualConsumptionKwh: number;
  /** platform generation estimate for this system size, used when the installer gave none (AC-B6) */
  platformAnnualGenerationKwh?: number | null;
}

export interface ScoreBreakdown {
  price: number;
  equipment: number;
  warranty: number;
  transparency: number;
  weights: { price: number; equipment: number; warranty: number; transparency: number };
}

export interface QuoteEvaluation {
  pricePerKwp: number;
  equipmentTier: EquipmentTierKey;
  valueScore: number;
  scoreBreakdown: ScoreBreakdown;
  redFlags: string[];
  financedTotalCost: number;
  monthlyPayment: number | null;
  estimatedAnnualGenerationKwh: number;
  generationSource: GenerationSourceKey;
  estimatedAnnualSavings: number;
  subsidyEstimate: number;
  paybackYears: number | null;
  netCostAfterSubsidy: number;
  costOfCredit: number;
}

// AC-B4 thresholds
export const RED_FLAG_THRESHOLDS = {
  suspiciouslyLowPricePerKwp: 35000,
  overpricedPerKwp: 85000,
  minPanelProductWarrantyYears: 10,
  minInverterWarrantyYears: 5,
  minWorkmanshipWarrantyYears: 2,
};

const WEIGHTS = { price: 0.4, equipment: 0.25, warranty: 0.25, transparency: 0.1 }; // AC-B3

const PREMIUM_TECHS: PanelTechnologyKey[] = ['TOPCON', 'HJT', 'N_TYPE'];

/** AC-B1 */
export function pricePerKwp(totalPrice: number, systemSizeKwp: number): number {
  if (!Number.isFinite(systemSizeKwp) || systemSizeKwp <= 0) return 0;
  return Math.round(totalPrice / systemSizeKwp);
}

/** AC-B2 */
export function equipmentTier(input: {
  panelTechnology: PanelTechnologyKey;
  panelProductWarrantyYears: number;
  inverterWarrantyYears: number;
}): EquipmentTierKey {
  const { panelTechnology, panelProductWarrantyYears, inverterWarrantyYears } = input;
  if (
    PREMIUM_TECHS.includes(panelTechnology) &&
    panelProductWarrantyYears >= 15 &&
    inverterWarrantyYears >= 10
  ) {
    return 'PREMIUM';
  }
  if (
    (panelTechnology === 'MONO_PERC' || PREMIUM_TECHS.includes(panelTechnology)) &&
    panelProductWarrantyYears >= 12 &&
    inverterWarrantyYears >= 7
  ) {
    return 'STANDARD';
  }
  return 'BASIC';
}

/**
 * Price component. Suspiciously cheap quotes are capped rather than rewarded, so "cheapest" never
 * automatically wins (design §3.3).
 */
export function priceScore(perKwp: number): number {
  if (perKwp <= 0) return 0;
  if (perKwp < RED_FLAG_THRESHOLDS.suspiciouslyLowPricePerKwp) return 45;
  return round(linearScore(perKwp, 40000, RED_FLAG_THRESHOLDS.overpricedPerKwp), 1);
}

export function equipmentScore(input: QuoteInput): number {
  const tier = equipmentTier(input);
  const base = tier === 'PREMIUM' ? 90 : tier === 'STANDARD' ? 65 : 35;
  let bonus = 0;
  if (input.inverterType === 'MICRO' || input.inverterType === 'HYBRID') bonus += 6;
  if (input.panelBrand && input.panelBrand.trim().length > 1) bonus += 2;
  if (input.inverterBrand && input.inverterBrand.trim().length > 1) bonus += 2;
  if ((input.panelWattage ?? 0) >= 540) bonus += 2;
  return round(Math.min(100, base + bonus), 1);
}

export function warrantyScore(input: QuoteInput): number {
  const panelProduct = linearScore(input.panelProductWarrantyYears, 15, 5);
  const panelPerformance = linearScore(input.panelPerformanceWarrantyYears, 27, 20);
  const inverter = linearScore(input.inverterWarrantyYears, 12, 5);
  const workmanship = linearScore(input.workmanshipWarrantyYears, 5, 1);
  return round(
    panelProduct * 0.3 + panelPerformance * 0.2 + inverter * 0.3 + workmanship * 0.2,
    1,
  );
}

/** Scope and financing disclosure: what the installer actually committed to in writing. */
export function transparencyScore(input: QuoteInput): number {
  let score = 0;
  if (input.includesNetMetering) score += 30;
  if (input.includesStructure) score += 25;
  if ((input.expectedAnnualGenerationKwh ?? 0) > 0) score += 15;
  if (input.includesAmcYears > 0) score += 15;
  const financingDisclosed =
    input.financingType === 'CASH' ||
    ((input.interestRatePct ?? -1) >= 0 && (input.tenureMonths ?? 0) > 0);
  if (financingDisclosed) score += 15;
  return round(Math.min(100, score), 1);
}

/** AC-B4 */
export function detectRedFlags(input: QuoteInput, perKwp: number): string[] {
  const flags: string[] = [];
  if (perKwp > 0 && perKwp < RED_FLAG_THRESHOLDS.suspiciouslyLowPricePerKwp) {
    flags.push(
      `Price of ₹${perKwp.toLocaleString('en-IN')}/kWp is below the realistic floor for quality equipment. ` +
        'Ask what is being left out (structure, cabling, net metering, warranty paperwork).',
    );
  }
  if (perKwp > RED_FLAG_THRESHOLDS.overpricedPerKwp) {
    flags.push(
      `Price of ₹${perKwp.toLocaleString('en-IN')}/kWp is well above the typical residential range. ` +
        'Ask for a line-item breakdown.',
    );
  }
  if (input.panelProductWarrantyYears < RED_FLAG_THRESHOLDS.minPanelProductWarrantyYears) {
    flags.push(
      `Panel product warranty of ${input.panelProductWarrantyYears} years is short; 10–15 years is standard.`,
    );
  }
  if (input.inverterWarrantyYears < RED_FLAG_THRESHOLDS.minInverterWarrantyYears) {
    flags.push(
      `Inverter warranty of ${input.inverterWarrantyYears} years is short; the inverter is the part most likely to need replacing.`,
    );
  }
  if (input.workmanshipWarrantyYears < RED_FLAG_THRESHOLDS.minWorkmanshipWarrantyYears) {
    flags.push(
      'Workmanship warranty under 2 years leaves you exposed to leaks and mounting issues.',
    );
  }
  if (!input.includesNetMetering) {
    flags.push('Net metering application and liaison is not included — this can cost time and money later.');
  }
  if (!input.includesStructure) {
    flags.push('Mounting structure is not included, which can add a significant amount to the real price.');
  }
  return flags;
}

/** AC-B7 */
export function financedTotals(input: QuoteInput): {
  financedTotalCost: number;
  monthlyPayment: number | null;
  costOfCredit: number;
} {
  const usesCredit = input.financingType === 'LOAN' || input.financingType === 'LEASE_PPA';
  const tenure = input.tenureMonths ?? 0;
  const rate = input.interestRatePct ?? 0;

  if (!usesCredit || tenure <= 0) {
    return { financedTotalCost: Math.round(input.totalPrice), monthlyPayment: null, costOfCredit: 0 };
  }

  const down = Math.min(Math.max(input.downPayment ?? 0, 0), input.totalPrice);
  const principal = input.totalPrice - down;
  const emi = monthlyEmi(principal, rate, tenure);
  const total = down + emi * tenure;

  return {
    financedTotalCost: Math.round(total),
    monthlyPayment: Math.round(emi),
    costOfCredit: Math.round(total - input.totalPrice),
  };
}

/** AC-B6 */
export function resolveGeneration(
  input: QuoteInput,
  ctx: ScoringContext,
  set: AssumptionSet = IN_2026_07,
): { estimatedAnnualGenerationKwh: number; generationSource: GenerationSourceKey } {
  if ((input.expectedAnnualGenerationKwh ?? 0) > 0) {
    return {
      estimatedAnnualGenerationKwh: Math.round(input.expectedAnnualGenerationKwh as number),
      generationSource: 'INSTALLER',
    };
  }
  const platform =
    ctx.platformAnnualGenerationKwh && ctx.platformAnnualGenerationKwh > 0
      ? ctx.platformAnnualGenerationKwh
      : input.systemSizeKwp * set.specificYieldKwhPerKwp;
  return { estimatedAnnualGenerationKwh: Math.round(platform), generationSource: 'PLATFORM' };
}

/** Full evaluation persisted on every quote write (AC-B9). */
export function evaluateQuote(
  input: QuoteInput,
  ctx: ScoringContext,
  set: AssumptionSet = IN_2026_07,
): QuoteEvaluation {
  const perKwp = pricePerKwp(input.totalPrice, input.systemSizeKwp);
  const breakdown: ScoreBreakdown = {
    price: priceScore(perKwp),
    equipment: equipmentScore(input),
    warranty: warrantyScore(input),
    transparency: transparencyScore(input),
    weights: WEIGHTS,
  };

  const valueScore = round(
    breakdown.price * WEIGHTS.price +
      breakdown.equipment * WEIGHTS.equipment +
      breakdown.warranty * WEIGHTS.warranty +
      breakdown.transparency * WEIGHTS.transparency,
    1,
  );

  const { financedTotalCost, monthlyPayment, costOfCredit } = financedTotals(input);
  const { estimatedAnnualGenerationKwh, generationSource } = resolveGeneration(input, ctx, set);

  const usableKwh = Math.min(
    estimatedAnnualGenerationKwh * set.selfConsumptionRatio,
    ctx.annualConsumptionKwh > 0 ? ctx.annualConsumptionKwh : Number.POSITIVE_INFINITY,
  );
  const estimatedAnnualSavings = Math.round(Math.max(0, usableKwh) * ctx.tariffPerKwh);

  const subsidyEstimate = subsidyForSize(input.systemSizeKwp, set);
  const netCostAfterSubsidy = Math.max(0, financedTotalCost - subsidyEstimate);

  return {
    pricePerKwp: perKwp,
    equipmentTier: equipmentTier(input),
    valueScore,
    scoreBreakdown: breakdown,
    redFlags: detectRedFlags(input, perKwp),
    financedTotalCost,
    monthlyPayment,
    estimatedAnnualGenerationKwh,
    generationSource,
    estimatedAnnualSavings,
    subsidyEstimate,
    paybackYears:
      estimatedAnnualSavings > 0 ? round(netCostAfterSubsidy / estimatedAnnualSavings, 1) : null,
    netCostAfterSubsidy,
    costOfCredit,
  };
}

export interface ComparisonRow {
  quoteId: string;
  installerName: string;
  systemSizeKwp: number;
  totalPrice: number;
  pricePerKwp: number;
  equipmentTier: EquipmentTierKey;
  panelSummary: string;
  inverterSummary: string;
  panelProductWarrantyYears: number;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  financingType: FinancingTypeKey;
  financedTotalCost: number;
  estimatedAnnualGenerationKwh: number;
  generationSource: GenerationSourceKey;
  estimatedAnnualSavings: number;
  paybackYears: number | null;
  valueScore: number;
  redFlagCount: number;
  isSelected: boolean;
}

const TIER_RANK: Record<EquipmentTierKey, number> = { BASIC: 1, STANDARD: 2, PREMIUM: 3 };

/**
 * Best-in-column flags for the comparison matrix (AC-B5). Every compared metric is per-kWp or per-year,
 * so quotes of different sizes stay comparable.
 */
export function bestInColumn(rows: ComparisonRow[]): Record<string, string[]> {
  if (rows.length === 0) return {};
  const pick = (
    field: string,
    valueOf: (r: ComparisonRow) => number | null,
    direction: 'min' | 'max',
  ): [string, string[]] => {
    const usable = rows.filter((r) => valueOf(r) !== null);
    if (usable.length === 0) return [field, []];
    const values = usable.map((r) => valueOf(r) as number);
    const target = direction === 'min' ? Math.min(...values) : Math.max(...values);
    return [field, usable.filter((r) => valueOf(r) === target).map((r) => r.quoteId)];
  };

  return Object.fromEntries([
    pick('pricePerKwp', (r) => r.pricePerKwp, 'min'),
    pick('financedTotalCost', (r) => r.financedTotalCost, 'min'),
    pick('equipmentTier', (r) => TIER_RANK[r.equipmentTier], 'max'),
    pick('panelProductWarrantyYears', (r) => r.panelProductWarrantyYears, 'max'),
    pick('inverterWarrantyYears', (r) => r.inverterWarrantyYears, 'max'),
    pick('workmanshipWarrantyYears', (r) => r.workmanshipWarrantyYears, 'max'),
    pick('estimatedAnnualSavings', (r) => r.estimatedAnnualSavings, 'max'),
    pick('paybackYears', (r) => r.paybackYears, 'min'),
    pick('valueScore', (r) => r.valueScore, 'max'),
    pick('redFlagCount', (r) => r.redFlagCount, 'min'),
  ]);
}
