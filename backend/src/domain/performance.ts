/**
 * Post-install performance, savings and warranty health (design §3.5).
 * Traces to AC-D2 … AC-D5. Pure functions only (NFR-X4).
 */
import { AssumptionSet, IN_2026_07 } from './assumptions';
import { round } from './math';

export type HealthStatus = 'HEALTHY' | 'WATCH' | 'UNDERPERFORMING' | 'NO_DATA';
export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export const UNDERPERFORMANCE_THRESHOLD_PCT = -15; // AC-D3
export const WATCH_THRESHOLD_PCT = -5;
export const WARRANTY_EXPIRING_WINDOW_DAYS = 90; // AC-D5

export interface GenerationLogLike {
  month: string; // YYYY-MM
  generatedKwh: number;
  billAmount?: number | null;
  unitsImportedKwh?: number | null;
  unitsExportedKwh?: number | null;
}

export interface MonthlyPerformanceRow {
  month: string;
  monthLabel: string;
  generatedKwh: number;
  projectedKwh: number;
  variancePercent: number | null;
  savings: number;
  billAmount: number | null;
  health: HealthStatus;
}

export interface PerformanceSummary {
  months: MonthlyPerformanceRow[];
  totalGeneratedKwh: number;
  totalProjectedKwh: number;
  overallVariancePercent: number | null;
  totalSavings: number;
  averageMonthlySavings: number;
  health: HealthStatus;
  co2OffsetTonnes: number;
  monthsLogged: number;
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function monthIndex(month: string): number {
  const parts = month.split('-');
  const idx = Number(parts[1]) - 1;
  return idx >= 0 && idx <= 11 ? idx : 0;
}

export function monthLabel(month: string): string {
  const parts = month.split('-');
  return `${MONTH_LABELS[monthIndex(month)]} ${parts[0] ?? ''}`.trim();
}

/** AC-D2 — seasonality curve, not a flat 1/12. */
export function projectedForMonth(
  annualProjectionKwh: number,
  month: string,
  set: AssumptionSet = IN_2026_07,
): number {
  const factor = set.monthlySeasonality[monthIndex(month)] ?? 1 / 12;
  return round(annualProjectionKwh * factor, 0);
}

/** AC-D3 */
export function variancePercent(actual: number, projected: number): number | null {
  if (!Number.isFinite(projected) || projected <= 0) return null;
  return round(((actual - projected) / projected) * 100, 1);
}

/** AC-D3 */
export function healthFromVariance(variance: number | null): HealthStatus {
  if (variance === null) return 'NO_DATA';
  if (variance < UNDERPERFORMANCE_THRESHOLD_PCT) return 'UNDERPERFORMING';
  if (variance < WATCH_THRESHOLD_PCT) return 'WATCH';
  return 'HEALTHY';
}

/** AC-D4 — export credit is never over-counted at retail tariff. */
export function monthlySavings(
  generatedKwh: number,
  baselineMonthlyUnits: number | null | undefined,
  tariffPerKwh: number | null | undefined,
): number {
  const tariff = tariffPerKwh ?? 0;
  if (tariff <= 0) return 0;
  const baseline = baselineMonthlyUnits && baselineMonthlyUnits > 0 ? baselineMonthlyUnits : generatedKwh;
  return Math.round(Math.min(generatedKwh, baseline) * tariff);
}

export function summarizePerformance(
  logs: GenerationLogLike[],
  project: {
    expectedAnnualGenerationKwh?: number | null;
    baselineMonthlyUnits?: number | null;
    baselineTariffPerKwh?: number | null;
  },
  set: AssumptionSet = IN_2026_07,
): PerformanceSummary {
  const annual = project.expectedAnnualGenerationKwh ?? 0;
  const ordered = [...logs].sort((a, b) => a.month.localeCompare(b.month));

  const months: MonthlyPerformanceRow[] = ordered.map((log) => {
    const projected = annual > 0 ? projectedForMonth(annual, log.month, set) : 0;
    const variance = variancePercent(log.generatedKwh, projected);
    return {
      month: log.month,
      monthLabel: monthLabel(log.month),
      generatedKwh: round(log.generatedKwh, 1),
      projectedKwh: projected,
      variancePercent: variance,
      savings: monthlySavings(
        log.generatedKwh,
        project.baselineMonthlyUnits,
        project.baselineTariffPerKwh,
      ),
      billAmount: log.billAmount ?? null,
      health: healthFromVariance(variance),
    };
  });

  const totalGeneratedKwh = round(
    months.reduce((s, m) => s + m.generatedKwh, 0),
    1,
  );
  const totalProjectedKwh = round(
    months.reduce((s, m) => s + m.projectedKwh, 0),
    0,
  );
  const totalSavings = months.reduce((s, m) => s + m.savings, 0);
  const overall = variancePercent(totalGeneratedKwh, totalProjectedKwh);

  return {
    months,
    totalGeneratedKwh,
    totalProjectedKwh,
    overallVariancePercent: overall,
    totalSavings,
    averageMonthlySavings: months.length > 0 ? Math.round(totalSavings / months.length) : 0,
    health: months.length === 0 ? 'NO_DATA' : healthFromVariance(overall),
    co2OffsetTonnes: round((totalGeneratedKwh * set.co2KgPerKwh) / 1000, 2),
    monthsLogged: months.length,
  };
}

export interface WarrantyLike {
  startDate: Date | string;
  durationYears: number;
}

export function warrantyExpiry(warranty: WarrantyLike): Date {
  const start = new Date(warranty.startDate);
  const expiry = new Date(start);
  const wholeYears = Math.floor(warranty.durationYears);
  const remainderMonths = Math.round((warranty.durationYears - wholeYears) * 12);
  expiry.setFullYear(expiry.getFullYear() + wholeYears);
  expiry.setMonth(expiry.getMonth() + remainderMonths);
  return expiry;
}

/** AC-D5 */
export function warrantyStatus(
  warranty: WarrantyLike,
  now: Date = new Date(),
): { status: WarrantyStatus; expiryDate: Date; daysRemaining: number } {
  const expiryDate = warrantyExpiry(warranty);
  const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / 86_400_000);
  let status: WarrantyStatus = 'ACTIVE';
  if (daysRemaining < 0) status = 'EXPIRED';
  else if (daysRemaining <= WARRANTY_EXPIRING_WINDOW_DAYS) status = 'EXPIRING_SOON';
  return { status, expiryDate, daysRemaining };
}
