/** Helpers — testing-strategy.md §2 ("unit (helpers)"): storage keys, EMI math, validation schemas. */
import { describe, expect, it } from 'vitest';
import { clamp, linearScore, monthlyEmi, round, roundToHalf, totalOfEmi } from '../../src/domain/math';
import { buildStorageKey } from '../../src/storage/types';
import { registerSchema } from '../../src/modules/auth/schema';
import { createBillSchema } from '../../src/modules/bills/schema';
import { createQuoteSchema } from '../../src/modules/quotes/schema';
import { upsertGenerationSchema } from '../../src/modules/monitoring/schema';

describe('math helpers', () => {
  it('rounds to a given precision and survives non-finite input', () => {
    expect(round(4.2649, 2)).toBe(4.26);
    expect(round(Number.NaN)).toBe(0);
    expect(round(Number.POSITIVE_INFINITY, 2)).toBe(0);
  });

  it('rounds to the nearest half kWp (AC-A10)', () => {
    expect(roundToHalf(3.24)).toBe(3);
    expect(roundToHalf(3.26)).toBe(3.5);
    expect(roundToHalf(3.75)).toBe(4);
  });

  it('clamps', () => {
    expect(clamp(120, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('computes EMI and degrades to principal ÷ tenure at 0%', () => {
    // Reference: 235000 × r × (1+r)^60 / ((1+r)^60 − 1) with r = 9.5 / 1200
    expect(Math.round(monthlyEmi(235000, 9.5, 60))).toBe(4935);
    expect(monthlyEmi(120000, 0, 12)).toBe(10000);
    expect(monthlyEmi(0, 9, 12)).toBe(0);
    expect(monthlyEmi(100000, 9, 0)).toBe(0);
    expect(Math.round(totalOfEmi(120000, 0, 12))).toBe(120000);
  });

  it('ramps a linear score between best and worst', () => {
    expect(linearScore(40000, 40000, 85000)).toBe(100);
    expect(linearScore(85000, 40000, 85000)).toBe(0);
    expect(linearScore(62500, 40000, 85000)).toBeCloseTo(50, 6);
    expect(linearScore(10000, 40000, 85000)).toBe(100); // clamped
  });
});

describe('storage keys (AC-E3)', () => {
  it('namespaces by user and date and keeps the extension only', () => {
    const key = buildStorageKey('user_123', 'My DISCOM Bill (final).PDF', 'abc-uuid');
    expect(key).toMatch(/^u\/user_123\/\d{4}\/\d{2}\/abc-uuid\.pdf$/);
  });

  it('never embeds the original filename or a traversal sequence', () => {
    const key = buildStorageKey('u1', '../../etc/passwd', 'uuid');
    expect(key).not.toContain('passwd');
    expect(key).not.toContain('..');
  });

  it('tolerates a file with no extension', () => {
    expect(buildStorageKey('u1', 'scan', 'uuid')).toMatch(/uuid$/);
  });
});

describe('validation schemas (NFR-S3)', () => {
  it('normalizes email case and requires a letter plus a number in passwords', () => {
    const parsed = registerSchema.parse({
      email: '  Asha@Example.COM ',
      password: 'solar2026',
      fullName: 'Asha Mehta',
    });
    expect(parsed.email).toBe('asha@example.com');
    expect(() =>
      registerSchema.parse({ email: 'a@b.com', password: 'onlyletters', fullName: 'Asha' }),
    ).toThrow();
  });

  it('requires either a tariff or a bill amount (AC-A5)', () => {
    expect(() => createBillSchema.parse({ billMonth: '2026-06', unitsKwh: 400 })).toThrow();
    expect(createBillSchema.parse({ billMonth: '2026-06', unitsKwh: 400, billAmount: 3600 })).toMatchObject(
      { unitsKwh: 400 },
    );
  });

  it('rejects an impossible bill month', () => {
    expect(() =>
      createBillSchema.parse({ billMonth: '2026-13', unitsKwh: 400, tariffPerKwh: 9 }),
    ).toThrow();
  });

  it('requires rate and tenure for financed quotes (AC-B7)', () => {
    const base = { installerName: 'SunPath', systemSizeKwp: 5, totalPrice: 295000 };
    expect(() => createQuoteSchema.parse({ ...base, financingType: 'LOAN' })).toThrow();
    expect(
      createQuoteSchema.parse({ ...base, financingType: 'LOAN', interestRatePct: 9, tenureMonths: 60 }),
    ).toMatchObject({ financingType: 'LOAN' });
  });

  it('rejects a down payment above the total price', () => {
    expect(() =>
      createQuoteSchema.parse({
        installerName: 'SunPath',
        systemSizeKwp: 5,
        totalPrice: 100000,
        downPayment: 200000,
      }),
    ).toThrow();
  });

  it('rejects negative generation (AC-D1 input guard)', () => {
    expect(() => upsertGenerationSchema.parse({ month: '2026-06', generatedKwh: -1 })).toThrow();
    expect(upsertGenerationSchema.parse({ month: '2026-06', generatedKwh: 0 })).toMatchObject({
      generatedKwh: 0,
    });
  });
});
