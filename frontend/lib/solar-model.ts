import type { Orientation, PanelTechnology, RoofType, ShadingLevel } from './types';

export const MODEL_ID = 'IN_2026_07';
export const SPECIFIC_YIELD = 1450;
export const SELF_CONSUMPTION = 0.85;

const AREA_PER_KWP: Record<RoofType, number> = { FLAT: 100, SLOPED: 80, MIXED: 90 };
const SHADING_FACTOR: Record<ShadingLevel, number> = {
  NONE: 1,
  LIGHT: 0.92,
  MODERATE: 0.8,
  HEAVY: 0.65,
};
const ORIENTATION_FACTOR: Record<Orientation, number> = {
  S: 1,
  SE: 0.96,
  SW: 0.96,
  E: 0.88,
  W: 0.88,
  NE: 0.8,
  NW: 0.8,
  N: 0.72,
};

export interface PlanInputs {
  monthlyBill: number;
  tariffPerKwh: number;
  usableAreaSqft: number;
  roofType: RoofType;
  orientation: Orientation;
  shadingLevel: ShadingLevel;
}

export interface PlanResult {
  monthlyUnits: number;
  annualConsumptionKwh: number;
  roofCapacityKwp: number;
  recommendedKwp: number;
  annualGenerationKwh: number;
  monthlyGenerationKwh: number;
  grossCost: number;
  subsidy: number;
  netCost: number;
  annualSavings: number;
  monthlySavings: number;
  paybackYears: number | null;
  lifetimeBenefit: number;
  offsetPercent: number;
  suitability: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNSUITABLE';
  reason: string;
}

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

function costPerKwp(size: number): number {
  if (size <= 3) return 65000;
  if (size <= 5) return 58000;
  if (size <= 10) return 52000;
  return 48000;
}

export function subsidyForSize(size: number): number {
  if (size < 1) return 0;
  const firstTwo = Math.min(size, 2) * 30000;
  const third = size > 2 ? Math.min(size - 2, 1) * 18000 : 0;
  return Math.min(78000, Math.round(firstTwo + third));
}

function lifetimeSavings(firstYearSavings: number): number {
  let total = 0;
  for (let year = 0; year < 25; year += 1) {
    total += firstYearSavings * 1.03 ** year * 0.995 ** year;
  }
  return Math.round(total);
}

export function calculatePlan(input: PlanInputs): PlanResult {
  const monthlyUnits = Math.max(0, input.monthlyBill / Math.max(input.tariffPerKwh, 0.5));
  const annualConsumptionKwh = Math.round(monthlyUnits * 12);
  const shade = SHADING_FACTOR[input.shadingLevel];
  const orientation = ORIENTATION_FACTOR[input.orientation];
  const roofCapacityKwp = Math.round((input.usableAreaSqft / AREA_PER_KWP[input.roofType]) * shade * 100) / 100;
  const loadBasedKwp = annualConsumptionKwh / (SPECIFIC_YIELD * orientation * shade);
  const maxInstallable = Math.floor(roofCapacityKwp * 2) / 2;
  const unsuitable = input.usableAreaSqft < 60 || input.shadingLevel === 'HEAVY' || maxInstallable < 0.5;
  const recommendedKwp = unsuitable ? 0 : Math.max(0.5, Math.min(roundToHalf(loadBasedKwp), maxInstallable));
  const annualGenerationKwh = Math.round(recommendedKwp * SPECIFIC_YIELD * orientation * shade);
  const grossCost = Math.round(recommendedKwp * costPerKwp(recommendedKwp));
  const subsidy = subsidyForSize(recommendedKwp);
  const netCost = Math.max(0, grossCost - subsidy);
  const annualSavings = Math.round(
    Math.min(annualGenerationKwh * SELF_CONSUMPTION, annualConsumptionKwh) * input.tariffPerKwh,
  );
  const paybackYears = annualSavings > 0 ? Math.round((netCost / annualSavings) * 10) / 10 : null;
  const offsetPercent = annualConsumptionKwh > 0
    ? Math.round((annualGenerationKwh / annualConsumptionKwh) * 100)
    : 0;

  let suitability: PlanResult['suitability'] = 'GOOD';
  let reason = 'The roof and annual usage support a practical residential system.';
  if (unsuitable) {
    suitability = 'UNSUITABLE';
    reason = input.shadingLevel === 'HEAVY'
      ? 'Heavy daytime shade makes a standard rooftop system difficult to justify without a site survey.'
      : 'The usable area is below the practical minimum for a residential rooftop system.';
  } else if (orientation >= 0.96 && shade === 1 && roofCapacityKwp >= 3) {
    suitability = 'EXCELLENT';
    reason = 'Good orientation, no reported shade and enough usable area make this a strong starting point.';
  } else if (orientation < 0.8) {
    suitability = 'POOR';
    reason = 'A north-facing roof loses substantial output; ask a site surveyor whether another roof face or tilted structure is practical.';
  } else if (input.shadingLevel === 'MODERATE') {
    suitability = 'FAIR';
    reason = 'The roof can work, but orientation or shade reduces output; confirm the layout during a site survey.';
  } else if (roofCapacityKwp < loadBasedKwp * 0.65) {
    suitability = 'POOR';
    reason = 'The roof fits a system, but it cannot offset most of the consumption you entered.';
  }

  return {
    monthlyUnits: Math.round(monthlyUnits),
    annualConsumptionKwh,
    roofCapacityKwp,
    recommendedKwp,
    annualGenerationKwh,
    monthlyGenerationKwh: Math.round(annualGenerationKwh / 12),
    grossCost,
    subsidy,
    netCost,
    annualSavings,
    monthlySavings: Math.round(annualSavings / 12),
    paybackYears,
    lifetimeBenefit: lifetimeSavings(annualSavings) - netCost,
    offsetPercent,
    suitability,
    reason,
  };
}

export interface DemoQuoteInput {
  id: string;
  name: string;
  ratePerKwp: number;
  panelTechnology: PanelTechnology;
  panelWarrantyYears: number;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  includesAmcYears: number;
  generationDeclared: boolean;
}

export interface EvaluatedDemoQuote extends DemoQuoteInput {
  totalPrice: number;
  pricePerKwp: number;
  equipmentTier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  score: number;
  netCost: number;
  paybackYears: number | null;
  redFlags: string[];
  verdict: string;
}

const DEMO_QUOTES: DemoQuoteInput[] = [
  {
    id: 'clear-roof',
    name: 'ClearRoof Energy',
    ratePerKwp: 61000,
    panelTechnology: 'TOPCON',
    panelWarrantyYears: 15,
    inverterWarrantyYears: 10,
    workmanshipWarrantyYears: 5,
    includesNetMetering: true,
    includesStructure: true,
    includesAmcYears: 2,
    generationDeclared: true,
  },
  {
    id: 'sunline',
    name: 'Sunline Local EPC',
    ratePerKwp: 53500,
    panelTechnology: 'MONO_PERC',
    panelWarrantyYears: 12,
    inverterWarrantyYears: 7,
    workmanshipWarrantyYears: 3,
    includesNetMetering: true,
    includesStructure: true,
    includesAmcYears: 1,
    generationDeclared: false,
  },
  {
    id: 'budget-solar',
    name: 'Budget Solar Works',
    ratePerKwp: 33500,
    panelTechnology: 'POLY',
    panelWarrantyYears: 8,
    inverterWarrantyYears: 3,
    workmanshipWarrantyYears: 1,
    includesNetMetering: false,
    includesStructure: false,
    includesAmcYears: 0,
    generationDeclared: false,
  },
];

function linearScore(value: number, best: number, worst: number): number {
  if (best === worst) return 100;
  return Math.max(0, Math.min(100, ((value - worst) / (best - worst)) * 100));
}

export function evaluateDemoQuotes(plan: PlanResult): EvaluatedDemoQuote[] {
  return DEMO_QUOTES.map((quote) => {
    const pricePerKwp = quote.ratePerKwp;
    const totalPrice = Math.round(pricePerKwp * plan.recommendedKwp);
    const premiumTech = ['TOPCON', 'HJT', 'N_TYPE'].includes(quote.panelTechnology);
    const equipmentTier: EvaluatedDemoQuote['equipmentTier'] = premiumTech && quote.panelWarrantyYears >= 15 && quote.inverterWarrantyYears >= 10
      ? 'PREMIUM'
      : (quote.panelTechnology === 'MONO_PERC' || premiumTech) && quote.panelWarrantyYears >= 12 && quote.inverterWarrantyYears >= 7
        ? 'STANDARD'
        : 'BASIC';
    const redFlags: string[] = [];
    if (pricePerKwp < 35000) redFlags.push('Price is below the realistic quality floor—ask what has been excluded.');
    if (quote.panelWarrantyYears < 10) redFlags.push('Panel product warranty is shorter than 10 years.');
    if (quote.inverterWarrantyYears < 5) redFlags.push('Inverter warranty is shorter than 5 years.');
    if (quote.workmanshipWarrantyYears < 2) redFlags.push('Workmanship warranty is shorter than 2 years.');
    if (!quote.includesNetMetering) redFlags.push('Net-metering support is not included in writing.');
    if (!quote.includesStructure) redFlags.push('Mounting structure is excluded from the quoted price.');

    const price = pricePerKwp < 35000 ? 45 : linearScore(pricePerKwp, 40000, 85000);
    const equipment = equipmentTier === 'PREMIUM' ? 94 : equipmentTier === 'STANDARD' ? 70 : 35;
    const warranty =
      linearScore(quote.panelWarrantyYears, 15, 5) * 0.4 +
      linearScore(quote.inverterWarrantyYears, 12, 5) * 0.35 +
      linearScore(quote.workmanshipWarrantyYears, 5, 1) * 0.25;
    const transparency =
      (quote.includesNetMetering ? 30 : 0) +
      (quote.includesStructure ? 25 : 0) +
      (quote.generationDeclared ? 15 : 0) +
      (quote.includesAmcYears > 0 ? 15 : 0) + 15;
    const score = Math.round((price * 0.4 + equipment * 0.25 + warranty * 0.25 + transparency * 0.1) * 10) / 10;
    const netCost = Math.max(0, totalPrice - subsidyForSize(plan.recommendedKwp));
    const paybackYears = plan.annualSavings > 0 ? Math.round((netCost / plan.annualSavings) * 10) / 10 : null;
    const verdict = redFlags.length > 0
      ? `${redFlags.length} written term${redFlags.length === 1 ? '' : 's'} to resolve before signing.`
      : equipmentTier === 'PREMIUM'
        ? 'Stronger warranty package; confirm the premium is worth it to you.'
        : 'Balanced price and scope; ask for exact equipment model numbers.';

    return { ...quote, totalPrice, pricePerKwp, equipmentTier, score, netCost, paybackYears, redFlags, verdict };
  }).sort((a, b) => b.score - a.score);
}

export function evaluatePerformance(actualKwh: number, projectedKwh: number) {
  const variancePercent = projectedKwh > 0 ? Math.round(((actualKwh - projectedKwh) / projectedKwh) * 1000) / 10 : 0;
  const health = variancePercent < -15 ? 'UNDERPERFORMING' : variancePercent < -5 ? 'WATCH' : 'HEALTHY';
  const action = health === 'UNDERPERFORMING'
    ? 'Check inverter faults and recent outages, then inspect for new shade or heavy soiling. Escalate with readings if the gap continues.'
    : health === 'WATCH'
      ? 'Clean the panels if needed and compare again next month before escalating.'
      : 'No action needed. Save the reading and keep the monthly comparison going.';
  return { variancePercent, health, action } as const;
}
