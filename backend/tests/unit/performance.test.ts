/** Performance and warranties — testing-strategy.md §3.4. */
import { describe, expect, it } from 'vitest';
import { IN_2026_07 as SET, seasonalitySum } from '../../src/domain/assumptions';
import {
  healthFromVariance,
  monthlySavings,
  projectedForMonth,
  summarizePerformance,
  variancePercent,
  warrantyExpiry,
  warrantyStatus,
} from '../../src/domain/performance';

describe('seasonality (AC-D2)', () => {
  it('sums to 1.0', () => {
    expect(seasonalitySum(SET)).toBeCloseTo(1, 9);
  });

  it('distributes an annual projection unevenly, not annual ÷ 12', () => {
    const annual = 7200;
    const flat = annual / 12;
    const april = projectedForMonth(annual, '2026-04', SET);
    const july = projectedForMonth(annual, '2026-07', SET);
    expect(april).not.toBe(flat);
    expect(april).toBeGreaterThan(july); // pre-monsoon peak beats monsoon trough
  });

  it('falls back to a flat share for a malformed month', () => {
    expect(projectedForMonth(1200, 'garbage', SET)).toBe(Math.round(1200 * SET.monthlySeasonality[0]));
  });
});

describe('variance and health (AC-D3)', () => {
  it('is (actual - projected) / projected × 100 to one decimal', () => {
    expect(variancePercent(560, 600)).toBe(-6.7);
    expect(variancePercent(660, 600)).toBe(10);
  });

  it('classifies -15.1% as UNDERPERFORMING and -14.9% as WATCH', () => {
    expect(healthFromVariance(-15.1)).toBe('UNDERPERFORMING');
    expect(healthFromVariance(-14.9)).toBe('WATCH');
    expect(healthFromVariance(-4.9)).toBe('HEALTHY');
    expect(healthFromVariance(null)).toBe('NO_DATA');
  });

  it('does not divide by zero', () => {
    expect(variancePercent(500, 0)).toBeNull();
    expect(healthFromVariance(variancePercent(500, 0))).toBe('NO_DATA');
  });
});

describe('savings (AC-D4)', () => {
  it('caps savings at baseline units × tariff when generation exceeds consumption', () => {
    expect(monthlySavings(700, 420, 9)).toBe(420 * 9);
  });

  it('values generation below consumption at the full tariff', () => {
    expect(monthlySavings(300, 420, 9)).toBe(300 * 9);
  });

  it('is zero without a tariff', () => {
    expect(monthlySavings(300, 420, null)).toBe(0);
  });
});

describe('performance summary', () => {
  const logs = [
    { month: '2026-03', generatedKwh: 640 },
    { month: '2026-04', generatedKwh: 585 },
    { month: '2026-05', generatedKwh: 612 },
  ];

  it('rolls up totals, savings and health', () => {
    const summary = summarizePerformance(
      logs,
      { expectedAnnualGenerationKwh: 7100, baselineMonthlyUnits: 420, baselineTariffPerKwh: 9 },
      SET,
    );
    expect(summary.monthsLogged).toBe(3);
    expect(summary.totalGeneratedKwh).toBe(1837);
    expect(summary.totalSavings).toBe(3 * 420 * 9);
    expect(summary.months[0].monthLabel).toBe('Mar 2026');
    expect(['HEALTHY', 'WATCH', 'UNDERPERFORMING']).toContain(summary.health);
    expect(summary.co2OffsetTonnes).toBeGreaterThan(0);
  });

  it('reports NO_DATA with no logs', () => {
    const summary = summarizePerformance([], { expectedAnnualGenerationKwh: 7100 }, SET);
    expect(summary.health).toBe('NO_DATA');
    expect(summary.monthsLogged).toBe(0);
    expect(summary.overallVariancePercent).toBeNull();
  });

  it('handles a project with no projection set', () => {
    const summary = summarizePerformance(logs, {}, SET);
    expect(summary.totalProjectedKwh).toBe(0);
    expect(summary.months.every((m) => m.variancePercent === null)).toBe(true);
  });
});

describe('warranty status (AC-D5)', () => {
  const now = new Date('2026-07-29T00:00:00.000Z');

  it('is ACTIVE 91 days out, EXPIRING_SOON at 90, EXPIRED past expiry', () => {
    const ninetyOne = new Date(now.getTime() + 91 * 86_400_000);
    const ninety = new Date(now.getTime() + 90 * 86_400_000);

    // durationYears = 1 so the start date is exactly one year before the target expiry.
    const startFor = (expiry: Date) => {
      const d = new Date(expiry);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    };

    expect(warrantyStatus({ startDate: startFor(ninetyOne), durationYears: 1 }, now).status).toBe('ACTIVE');
    expect(warrantyStatus({ startDate: startFor(ninety), durationYears: 1 }, now).status).toBe(
      'EXPIRING_SOON',
    );
    expect(warrantyStatus({ startDate: new Date('2020-01-01'), durationYears: 5 }, now).status).toBe(
      'EXPIRED',
    );
  });

  it('supports fractional years', () => {
    expect(warrantyExpiry({ startDate: new Date('2026-01-15'), durationYears: 0.5 }).toISOString()).toBe(
      new Date('2026-07-15T00:00:00.000Z').toISOString(),
    );
  });

  it('handles leap-day and month-end start dates', () => {
    expect(warrantyExpiry({ startDate: new Date('2024-02-29'), durationYears: 1 }).getUTCMonth()).toBe(2);
    expect(warrantyExpiry({ startDate: new Date('2026-01-31'), durationYears: 10 }).getUTCFullYear()).toBe(
      2036,
    );
  });

  it('reports days remaining', () => {
    const status = warrantyStatus({ startDate: new Date('2026-07-29'), durationYears: 10 }, now);
    expect(status.daysRemaining).toBeGreaterThan(3600);
  });
});
