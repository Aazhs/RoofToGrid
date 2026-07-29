/** Shared rounding + finance helpers. Pure, framework-free (NFR-X4). */

export function round(value: number, decimals = 0): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Rounds to the nearest 0.5 kWp (AC-A10). */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Standard EMI: P * r * (1+r)^n / ((1+r)^n - 1), with the 0% case degrading to P/n (AC-B7).
 */
export function monthlyEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r <= 0) return principal / tenureMonths;
  const factor = (1 + r) ** tenureMonths;
  return (principal * r * factor) / (factor - 1);
}

export function totalOfEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  return monthlyEmi(principal, annualRatePct, tenureMonths) * tenureMonths;
}

/** Linear ramp from `atBest` (=> 100) down to `atWorst` (=> 0), clamped. */
export function linearScore(value: number, atBest: number, atWorst: number): number {
  if (atWorst === atBest) return value <= atBest ? 100 : 0;
  const raw = ((atWorst - value) / (atWorst - atBest)) * 100;
  return clamp(raw, 0, 100);
}
