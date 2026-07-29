/** Quote comparison — testing-strategy.md §3.2. */
import { describe, expect, it } from 'vitest';
import { IN_2026_07 as SET } from '../../src/domain/assumptions';
import { monthlyEmi } from '../../src/domain/math';
import {
  bestInColumn,
  detectRedFlags,
  equipmentTier,
  evaluateQuote,
  financedTotals,
  priceScore,
  pricePerKwp,
  resolveGeneration,
  type ComparisonRow,
  type QuoteInput,
  type ScoringContext,
} from '../../src/domain/quoteScoring';

const ctx: ScoringContext = {
  tariffPerKwh: 9,
  annualConsumptionKwh: 5040,
  platformAnnualGenerationKwh: 7250,
};

const premium: QuoteInput = {
  installerName: 'SunPath Energy',
  systemSizeKwp: 5,
  totalPrice: 295000,
  panelBrand: 'Waaree',
  panelTechnology: 'TOPCON',
  panelWattage: 550,
  panelProductWarrantyYears: 15,
  panelPerformanceWarrantyYears: 30,
  inverterBrand: 'Sungrow',
  inverterType: 'STRING',
  inverterWarrantyYears: 10,
  workmanshipWarrantyYears: 5,
  includesNetMetering: true,
  includesStructure: true,
  includesAmcYears: 5,
  expectedAnnualGenerationKwh: 7100,
  financingType: 'CASH',
};

const cheap: QuoteInput = {
  ...premium,
  installerName: 'ValueVolt',
  systemSizeKwp: 5.5,
  totalPrice: 181500, // ₹33,000/kWp
  panelTechnology: 'POLY',
  panelWattage: 340,
  panelProductWarrantyYears: 5,
  panelPerformanceWarrantyYears: 20,
  inverterType: 'UNKNOWN',
  inverterWarrantyYears: 2,
  workmanshipWarrantyYears: 0,
  includesNetMetering: false,
  includesStructure: false,
  includesAmcYears: 0,
  expectedAnnualGenerationKwh: null,
};

describe('price per kWp (AC-B1)', () => {
  it('is total ÷ size, rupee rounded', () => {
    expect(pricePerKwp(295000, 5)).toBe(59000);
    expect(pricePerKwp(181500, 5.5)).toBe(33000);
    expect(pricePerKwp(100001, 3)).toBe(33334);
  });

  it('does not divide by zero', () => {
    expect(pricePerKwp(100000, 0)).toBe(0);
  });
});

describe('equipment tier (AC-B2)', () => {
  it('follows the tier matrix', () => {
    expect(
      equipmentTier({ panelTechnology: 'TOPCON', panelProductWarrantyYears: 15, inverterWarrantyYears: 10 }),
    ).toBe('PREMIUM');
    expect(
      equipmentTier({ panelTechnology: 'MONO_PERC', panelProductWarrantyYears: 12, inverterWarrantyYears: 7 }),
    ).toBe('STANDARD');
    expect(
      equipmentTier({ panelTechnology: 'POLY', panelProductWarrantyYears: 25, inverterWarrantyYears: 15 }),
    ).toBe('BASIC');
  });

  it('downgrades when any PREMIUM threshold is one year short', () => {
    expect(
      equipmentTier({ panelTechnology: 'TOPCON', panelProductWarrantyYears: 14, inverterWarrantyYears: 10 }),
    ).toBe('STANDARD');
    expect(
      equipmentTier({ panelTechnology: 'HJT', panelProductWarrantyYears: 15, inverterWarrantyYears: 9 }),
    ).toBe('STANDARD');
  });
});

describe('value score (AC-B3)', () => {
  it('stays within 0..100 and the weights sum to 1', () => {
    for (const quote of [premium, cheap]) {
      const result = evaluateQuote(quote, ctx, SET);
      expect(result.valueScore).toBeGreaterThanOrEqual(0);
      expect(result.valueScore).toBeLessThanOrEqual(100);
      const w = result.scoreBreakdown.weights;
      expect(w.price + w.equipment + w.warranty + w.transparency).toBeCloseTo(1, 9);
    }
  });

  it('is identical for identical quotes and higher for strictly better warranties', () => {
    const a = evaluateQuote(premium, ctx, SET);
    const b = evaluateQuote({ ...premium }, ctx, SET);
    expect(a.valueScore).toBe(b.valueScore);

    // Compare mid-range warranties so neither side is already at the top of its ramp.
    const modest: QuoteInput = { ...premium, panelProductWarrantyYears: 12, workmanshipWarrantyYears: 3 };
    const better: QuoteInput = { ...modest, workmanshipWarrantyYears: 4 };
    expect(evaluateQuote(better, ctx, SET).valueScore).toBeGreaterThan(
      evaluateQuote(modest, ctx, SET).valueScore,
    );
  });

  it('caps the price component for suspiciously cheap quotes (AC-B3/B4)', () => {
    expect(priceScore(30000)).toBe(45);
    expect(priceScore(45000)).toBeGreaterThan(priceScore(30000));
    expect(evaluateQuote(cheap, ctx, SET).valueScore).toBeLessThan(
      evaluateQuote(premium, ctx, SET).valueScore,
    );
  });

  it('scores an overpriced quote at zero on price', () => {
    expect(priceScore(90000)).toBe(0);
  });
});

describe('red flags (AC-B4)', () => {
  it('fires at each boundary and not one unit inside it', () => {
    const clean = { ...premium };
    expect(detectRedFlags(clean, 59000)).toHaveLength(0);

    expect(detectRedFlags(clean, 34999).some((f) => /below the realistic floor/i.test(f))).toBe(true);
    expect(detectRedFlags(clean, 35000).some((f) => /below the realistic floor/i.test(f))).toBe(false);

    expect(detectRedFlags(clean, 85001).some((f) => /above the typical/i.test(f))).toBe(true);
    expect(detectRedFlags(clean, 85000).some((f) => /above the typical/i.test(f))).toBe(false);

    expect(
      detectRedFlags({ ...clean, panelProductWarrantyYears: 9 }, 59000).some((f) => /Panel product/i.test(f)),
    ).toBe(true);
    expect(
      detectRedFlags({ ...clean, panelProductWarrantyYears: 10 }, 59000).some((f) => /Panel product/i.test(f)),
    ).toBe(false);

    expect(
      detectRedFlags({ ...clean, inverterWarrantyYears: 4 }, 59000).some((f) => /Inverter warranty/i.test(f)),
    ).toBe(true);
    expect(
      detectRedFlags({ ...clean, workmanshipWarrantyYears: 1 }, 59000).some((f) => /Workmanship/i.test(f)),
    ).toBe(true);
    expect(
      detectRedFlags({ ...clean, includesNetMetering: false }, 59000).some((f) => /Net metering/i.test(f)),
    ).toBe(true);
    expect(
      detectRedFlags({ ...clean, includesStructure: false }, 59000).some((f) => /Mounting structure/i.test(f)),
    ).toBe(true);
  });

  it('raises several flags on the cheap quote', () => {
    expect(evaluateQuote(cheap, ctx, SET).redFlags.length).toBeGreaterThanOrEqual(4);
  });
});

describe('comparability across sizes (AC-B5)', () => {
  it('compares purely on per-kWp and per-year metrics', () => {
    const small = evaluateQuote({ ...premium, systemSizeKwp: 3, totalPrice: 177000 }, ctx, SET);
    const large = evaluateQuote({ ...premium, systemSizeKwp: 6, totalPrice: 354000 }, ctx, SET);
    expect(small.pricePerKwp).toBe(large.pricePerKwp);
    expect(small.valueScore).toBe(large.valueScore);
  });

  it('flags the best cell per column', () => {
    const rows: ComparisonRow[] = [
      { ...rowStub('a'), pricePerKwp: 59000, valueScore: 82, paybackYears: 4.2 },
      { ...rowStub('b'), pricePerKwp: 51600, valueScore: 66, paybackYears: 3.8 },
    ];
    const best = bestInColumn(rows);
    expect(best.pricePerKwp).toEqual(['b']);
    expect(best.valueScore).toEqual(['a']);
    expect(best.paybackYears).toEqual(['b']);
  });

  it('handles an empty comparison', () => {
    expect(bestInColumn([])).toEqual({});
  });
});

describe('generation source (AC-B6)', () => {
  it('prefers the installer figure and tags the source', () => {
    const result = resolveGeneration(premium, ctx, SET);
    expect(result).toEqual({ estimatedAnnualGenerationKwh: 7100, generationSource: 'INSTALLER' });
  });

  it('falls back to the platform estimate', () => {
    const result = resolveGeneration({ ...premium, expectedAnnualGenerationKwh: null }, ctx, SET);
    expect(result).toEqual({ estimatedAnnualGenerationKwh: 7250, generationSource: 'PLATFORM' });
  });

  it('falls back to specific yield when no platform estimate is supplied', () => {
    const result = resolveGeneration(
      { ...premium, expectedAnnualGenerationKwh: null },
      { tariffPerKwh: 9, annualConsumptionKwh: 5040 },
      SET,
    );
    expect(result.estimatedAnnualGenerationKwh).toBe(5 * 1450);
  });
});

describe('financing (AC-B7)', () => {
  const loan: QuoteInput = {
    ...premium,
    financingType: 'LOAN',
    interestRatePct: 9.5,
    tenureMonths: 60,
    downPayment: 60000,
  };

  it('uses standard EMI math over the tenure', () => {
    const emi = monthlyEmi(295000 - 60000, 9.5, 60);
    const { financedTotalCost, monthlyPayment } = financedTotals(loan);
    expect(monthlyPayment).toBe(Math.round(emi));
    expect(financedTotalCost).toBe(Math.round(60000 + emi * 60));
    expect(financedTotalCost).toBeGreaterThan(295000);
  });

  it('equals the cash total at 0% interest', () => {
    const zero = financedTotals({ ...loan, interestRatePct: 0 });
    expect(zero.financedTotalCost).toBe(295000);
    expect(zero.costOfCredit).toBe(0);
  });

  it('treats cash quotes as the sticker price', () => {
    expect(financedTotals(premium)).toEqual({
      financedTotalCost: 295000,
      monthlyPayment: null,
      costOfCredit: 0,
    });
  });

  it('computes payback on the financed total, so a loan pays back later than cash', () => {
    const cash = evaluateQuote(premium, ctx, SET);
    const financed = evaluateQuote(loan, ctx, SET);
    expect(financed.paybackYears).not.toBeNull();
    expect(financed.paybackYears as number).toBeGreaterThan(cash.paybackYears as number);
  });

  it('subtracts the subsidy before computing payback', () => {
    const result = evaluateQuote(premium, ctx, SET);
    expect(result.subsidyEstimate).toBe(78000);
    expect(result.netCostAfterSubsidy).toBe(295000 - 78000);
    expect(result.paybackYears).toBe(
      Math.round(((295000 - 78000) / result.estimatedAnnualSavings) * 10) / 10,
    );
  });
});

function rowStub(id: string): ComparisonRow {
  return {
    quoteId: id,
    installerName: id,
    systemSizeKwp: 5,
    totalPrice: 295000,
    pricePerKwp: 59000,
    equipmentTier: 'PREMIUM',
    panelSummary: 'Waaree · TOPCON',
    inverterSummary: 'Sungrow · STRING',
    panelProductWarrantyYears: 15,
    inverterWarrantyYears: 10,
    workmanshipWarrantyYears: 5,
    includesNetMetering: true,
    includesStructure: true,
    financingType: 'CASH',
    financedTotalCost: 295000,
    estimatedAnnualGenerationKwh: 7100,
    generationSource: 'INSTALLER',
    estimatedAnnualSavings: 45360,
    paybackYears: 4.8,
    valueScore: 80,
    redFlagCount: 0,
    isSelected: false,
  };
}
