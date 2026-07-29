/** Sizing calculator — testing-strategy.md §3.1. Test titles carry the AC id. */
import { describe, expect, it } from 'vitest';
import {
  IN_2026_07 as SET,
  costPerKwp,
  publicAssumptions,
  seasonalitySum,
  subsidyForSize,
} from '../../src/domain/assumptions';
import {
  annualGenerationKwh,
  annualSavings,
  assessSuitability,
  billStats,
  computeSizing,
  lifetimeSavings,
  loadBasedKwp,
  paybackYears,
  roofCapacityKwp,
  type SizingInput,
} from '../../src/domain/sizing';

const base: SizingInput = {
  avgMonthlyUnits: 420,
  tariffPerKwh: 9,
  roofType: 'FLAT',
  usableAreaSqft: 650,
  orientation: 'S',
  shadingLevel: 'NONE',
};

describe('roof capacity (AC-A7)', () => {
  it('uses 100/80/90 sqft per kWp by roof type', () => {
    expect(roofCapacityKwp(800, 'FLAT', 'NONE', SET)).toBe(8);
    expect(roofCapacityKwp(800, 'SLOPED', 'NONE', SET)).toBe(10);
    expect(roofCapacityKwp(900, 'MIXED', 'NONE', SET)).toBe(10);
  });

  it('multiplies capacity by the shading derate', () => {
    expect(roofCapacityKwp(1000, 'FLAT', 'NONE', SET)).toBe(10);
    expect(roofCapacityKwp(1000, 'FLAT', 'LIGHT', SET)).toBe(9.2);
    expect(roofCapacityKwp(1000, 'FLAT', 'MODERATE', SET)).toBe(8);
    expect(roofCapacityKwp(1000, 'FLAT', 'HEAVY', SET)).toBe(6.5);
  });

  it('returns 0 for a non-positive area', () => {
    expect(roofCapacityKwp(0, 'FLAT', 'NONE', SET)).toBe(0);
  });
});

describe('suitability (AC-A8, AC-A9)', () => {
  it('always returns a rating and at least one reason', () => {
    const inputs: SizingInput[] = [
      base,
      { ...base, orientation: 'N' },
      { ...base, shadingLevel: 'MODERATE' },
      { ...base, usableAreaSqft: 61 },
      { ...base, usableAreaSqft: 59 },
      { ...base, shadingLevel: 'HEAVY' },
    ];
    for (const input of inputs) {
      const capacity = roofCapacityKwp(input.usableAreaSqft, input.roofType, input.shadingLevel, SET);
      const result = assessSuitability(input, capacity, SET);
      expect(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'UNSUITABLE']).toContain(result.rating);
      expect(result.reasons.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('heavy shading is UNSUITABLE with no scenarios (AC-A9)', () => {
    const result = computeSizing({ ...base, shadingLevel: 'HEAVY' }, SET);
    expect(result.suitability).toBe('UNSUITABLE');
    expect(result.scenarios).toHaveLength(0);
    expect(result.suitabilityReasons[0]).toMatch(/shading/i);
  });

  it('59 sqft is UNSUITABLE and 60 sqft is rated with scenarios (AC-A9 boundary)', () => {
    const below = computeSizing({ ...base, usableAreaSqft: 59 }, SET);
    expect(below.suitability).toBe('UNSUITABLE');
    expect(below.scenarios).toHaveLength(0);

    const at = computeSizing({ ...base, usableAreaSqft: 60 }, SET);
    expect(at.suitability).not.toBe('UNSUITABLE');
    expect(at.scenarios.length).toBeGreaterThan(0);
  });

  it('rates an unshaded south-facing large roof EXCELLENT', () => {
    expect(computeSizing(base, SET).suitability).toBe('EXCELLENT');
  });
});

describe('scenarios (AC-A10)', () => {
  it('are sorted ascending, rounded to 0.5 kWp and never exceed derated capacity', () => {
    const result = computeSizing(base, SET);
    const sizes = result.scenarios.map((s) => s.systemSizeKwp);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    for (const size of sizes) {
      expect(size * 2).toBe(Math.round(size * 2));
      expect(size).toBeLessThanOrEqual(result.roofCapacityKwp);
    }
  });

  it('collapses duplicate sizes on a small roof where all scenarios converge', () => {
    const result = computeSizing({ ...base, usableAreaSqft: 120, avgMonthlyUnits: 900 }, SET);
    const sizes = result.scenarios.map((s) => s.systemSizeKwp);
    expect(new Set(sizes).size).toBe(sizes.length);
    expect(sizes.length).toBeLessThanOrEqual(3);
  });

  it('offers three scenarios when the roof is not the binding constraint', () => {
    expect(computeSizing(base, SET).scenarios).toHaveLength(3);
  });
});

describe('generation (AC-A11)', () => {
  it('is size × yield × orientation × shading, integer rounded', () => {
    expect(annualGenerationKwh(5, 'S', 'NONE', SET)).toBe(7250);
    expect(annualGenerationKwh(5, 'S', 'LIGHT', SET)).toBe(Math.round(5 * 1450 * 0.92));
    expect(Number.isInteger(annualGenerationKwh(3.5, 'SE', 'MODERATE', SET))).toBe(true);
  });

  it('north-facing produces 72% of south for the same size', () => {
    const south = annualGenerationKwh(5, 'S', 'NONE', SET);
    const north = annualGenerationKwh(5, 'N', 'NONE', SET);
    expect(north / south).toBeCloseTo(0.72, 5);
  });

  it('is monotonically non-decreasing in system size (deterministic sweep)', () => {
    let previous = 0;
    for (let size = 0.5; size <= 20; size += 0.5) {
      const generation = annualGenerationKwh(size, 'SE', 'LIGHT', SET);
      expect(generation).toBeGreaterThanOrEqual(previous);
      previous = generation;
    }
  });
});

describe('subsidy (AC-A12)', () => {
  it('follows the PM Surya Ghar static table', () => {
    expect(subsidyForSize(0.9, SET)).toBe(0);
    expect(subsidyForSize(1, SET)).toBe(30000);
    expect(subsidyForSize(2, SET)).toBe(60000);
    expect(subsidyForSize(2.5, SET)).toBe(69000);
    expect(subsidyForSize(3, SET)).toBe(78000);
    expect(subsidyForSize(5, SET)).toBe(78000);
    expect(subsidyForSize(10, SET)).toBe(78000);
  });
});

describe('payback and savings (AC-A13)', () => {
  it('is netCost / annualSavings to one decimal', () => {
    expect(paybackYears(217000, 50000)).toBe(4.3);
    expect(paybackYears(100000, 40000)).toBe(2.5);
  });

  it('is null rather than Infinity or NaN when savings are zero or negative', () => {
    expect(paybackYears(200000, 0)).toBeNull();
    expect(paybackYears(200000, -10)).toBeNull();
    expect(paybackYears(200000, Number.NaN)).toBeNull();
  });

  it('caps savings by consumption × self-consumption ratio (design §3.2)', () => {
    // Generation far exceeds consumption: savings must stop at consumption × tariff.
    expect(annualSavings(20000, 5040, 9, SET)).toBe(5040 * 9);
    // Generation below consumption: savings use the self-consumption ratio.
    expect(annualSavings(4000, 10000, 9, SET)).toBe(Math.round(4000 * 0.85 * 9));
  });

  it('never produces a negative payback across a sweep of scenarios', () => {
    for (let units = 50; units <= 1200; units += 50) {
      for (const area of [80, 200, 650, 1500]) {
        const result = computeSizing({ ...base, avgMonthlyUnits: units, usableAreaSqft: area }, SET);
        for (const scenario of result.scenarios) {
          if (scenario.paybackYears !== null) expect(scenario.paybackYears).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('lifetime savings', () => {
  it('applies escalation and degradation and exceeds 25 × year one', () => {
    const yearOne = 45000;
    const lifetime = lifetimeSavings(yearOne, SET);
    expect(lifetime).toBeGreaterThan(yearOne * 25);
    expect(lifetime).toBeLessThan(yearOne * 40);
  });
});

describe('assumption disclosure (AC-A14)', () => {
  it('exposes assumption set id, yield, cost bands, escalation and a disclaimer', () => {
    const result = computeSizing(base, SET);
    expect(result.assumptionSetId).toBe('IN_2026_07');
    expect(result.assumptions.specificYieldKwhPerKwp).toBe(1450);
    expect(result.assumptions.costPerKwpBands.length).toBeGreaterThan(0);
    expect(result.assumptions.tariffEscalationPct).toBe(3);
    expect(result.assumptions.disclaimer).toMatch(/estimates/i);
    expect(publicAssumptions(SET).subsidy.capAmount).toBe(78000);
  });

  it('keeps seasonality a true distribution (AC-D2 guard)', () => {
    expect(seasonalitySum(SET)).toBeCloseTo(1, 9);
  });

  it('applies cost bands by system size', () => {
    expect(costPerKwp(2, SET)).toBe(65000);
    expect(costPerKwp(5, SET)).toBe(58000);
    expect(costPerKwp(9, SET)).toBe(52000);
    expect(costPerKwp(25, SET)).toBe(48000);
  });
});

describe('load-based sizing', () => {
  it('grows when orientation or shading reduces yield', () => {
    const south = loadBasedKwp(420, 'S', 'NONE', SET);
    const north = loadBasedKwp(420, 'N', 'NONE', SET);
    const shaded = loadBasedKwp(420, 'S', 'MODERATE', SET);
    expect(north).toBeGreaterThan(south);
    expect(shaded).toBeGreaterThan(south);
  });
});

describe('bill statistics (AC-A6)', () => {
  it('averages the last 12 months and weights the tariff by units', () => {
    const stats = billStats([
      { billMonth: '2026-01', unitsKwh: 100, tariffPerKwh: 10, billAmount: 1000 },
      { billMonth: '2026-02', unitsKwh: 300, tariffPerKwh: 6, billAmount: 1800 },
    ]);
    expect(stats.avgMonthlyUnits).toBe(200);
    expect(stats.weightedTariffPerKwh).toBe(7); // (100×10 + 300×6) / 400
    expect(stats.avgMonthlyBill).toBe(1400);
    expect(stats.ready).toBe(false);
  });

  it('is ready at three months and ignores anything older than twelve', () => {
    const months = Array.from({ length: 15 }, (_, i) => ({
      billMonth: `2025-${String(i + 1).padStart(2, '0')}`,
      unitsKwh: 100,
      tariffPerKwh: 8,
      billAmount: 800,
    }));
    const stats = billStats(months);
    expect(stats.monthsCounted).toBe(12);
    expect(stats.ready).toBe(true);
  });

  it('handles an empty history without dividing by zero', () => {
    const stats = billStats([]);
    expect(stats).toMatchObject({ monthsCounted: 0, avgMonthlyUnits: 0, ready: false });
  });
});
