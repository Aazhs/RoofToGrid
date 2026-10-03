'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

/* ── Sizing constants (mirrors backend domain/assumptions.ts) ── */
const SPECIFIC_YIELD = 1450;
const SQFT_PER_KWP: Record<string, number> = { FLAT: 100, SLOPED: 80, MIXED: 90 };
const ORIENTATION_FACTOR: Record<string, number> = {
  S: 1.0, SE: 0.96, SW: 0.96, E: 0.88, W: 0.88, NE: 0.80, NW: 0.80, N: 0.72,
};
const SHADING_DERATE: Record<string, number> = { NONE: 1.0, LIGHT: 0.92, MODERATE: 0.80, HEAVY: 0.65 };
const SELF_CONSUMPTION = 0.85;
const COST_BANDS = [
  { max: 3, cost: 65000 },
  { max: 5, cost: 58000 },
  { max: 10, cost: 52000 },
  { max: Infinity, cost: 48000 },
];

function costPerKwp(sizeKwp: number) {
  return COST_BANDS.find((b) => sizeKwp <= b.max)!.cost;
}

function subsidy(sizeKwp: number) {
  if (sizeKwp < 1) return 0;
  let amt = 0;
  const first2 = Math.min(sizeKwp, 2);
  amt += first2 * 30000;
  if (sizeKwp > 2) amt += Math.min(sizeKwp - 2, 1) * 18000;
  return Math.min(amt, 78000);
}

interface Result {
  systemSizeKwp: number;
  annualGenerationKwh: number;
  monthlySavings: number;
  paybackYears: number | null;
  subsidyAmount: number;
  netCost: number;
  co2OffsetTonnes: number;
}

function compute(
  avgUnits: number, tariff: number, roofType: string,
  areaSqft: number, orientation: string, shading: string,
): Result | null {
  const oFactor = ORIENTATION_FACTOR[orientation] ?? 1;
  const sDerate = SHADING_DERATE[shading] ?? 1;
  const roofCapKwp = (areaSqft / (SQFT_PER_KWP[roofType] ?? 100)) * sDerate;
  const loadKwp = (avgUnits * 12) / (SPECIFIC_YIELD * oFactor * sDerate);
  let size = Math.round(Math.min(loadKwp, roofCapKwp) * 2) / 2; // round to 0.5
  if (size < 0.5) return null;

  const annualGen = Math.round(size * SPECIFIC_YIELD * oFactor * sDerate);
  const annualSavings = Math.min(annualGen * SELF_CONSUMPTION, avgUnits * 12) * tariff;
  const totalCost = size * costPerKwp(size);
  const sub = subsidy(size);
  const net = totalCost - sub;
  const payback = annualSavings > 0 ? Math.round((net / annualSavings) * 10) / 10 : null;
  const co2 = Math.round(annualGen * 0.71) / 1000;

  return {
    systemSizeKwp: size,
    annualGenerationKwh: annualGen,
    monthlySavings: Math.round(annualSavings / 12),
    paybackYears: payback,
    subsidyAmount: sub,
    netCost: net,
    co2OffsetTonnes: Math.round(co2 * 10) / 10,
  };
}

const FIELDS = {
  roofTypes: [
    { value: 'FLAT', label: 'Flat / terrace' },
    { value: 'SLOPED', label: 'Sloped / tiled' },
    { value: 'MIXED', label: 'Mixed' },
  ],
  orientations: [
    { value: 'S', label: 'South (best)' },
    { value: 'SE', label: 'South-east' },
    { value: 'SW', label: 'South-west' },
    { value: 'E', label: 'East' },
    { value: 'W', label: 'West' },
    { value: 'NE', label: 'North-east' },
    { value: 'NW', label: 'North-west' },
    { value: 'N', label: 'North' },
  ],
  shadings: [
    { value: 'NONE', label: 'No shading' },
    { value: 'LIGHT', label: 'Light shading' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'HEAVY', label: 'Heavy' },
  ],
};

export function RoughCalculator() {
  const { ref, isVisible, style } = useScrollReveal();

  const [units, setUnits] = useState('350');
  const [tariff, setTariff] = useState('8.5');
  const [roofType, setRoofType] = useState('FLAT');
  const [area, setArea] = useState('500');
  const [orientation, setOrientation] = useState('S');
  const [shading, setShading] = useState('NONE');
  const [result, setResult] = useState<Result | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCompute = () => {
    const r = compute(
      Number(units) || 350, Number(tariff) || 8.5, roofType,
      Number(area) || 500, orientation, shading,
    );
    setResult(r);
    setShowResult(true);
  };

  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <section id="calculator" className="bg-surface-container-low py-24 md:py-32">
      <div ref={ref} style={style} className="mx-auto max-w-[1280px] px-4 md:px-16">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="text-label-sm uppercase tracking-widest text-primary">
            INSTANT ESTIMATE
          </p>
          <h2 className="mt-4 font-jakarta text-display-lg font-semibold tracking-tight text-on-surface">
            Your Solar Numbers in 30 Seconds.
          </h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">
            No signup needed. Enter your bill details and roof info — we will show you what solar can do for your home.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ── Form ── */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-surface-container-high bg-surface p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Monthly units */}
                <div>
                  <label htmlFor="calc-units" className="block text-sm font-medium text-on-surface mb-1.5">
                    Average monthly units (kWh)
                  </label>
                  <input
                    id="calc-units"
                    type="number"
                    min={50}
                    max={5000}
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors"
                    placeholder="350"
                  />
                  <p className="mt-1 text-xs text-on-surface-variant/70">The &ldquo;units&rdquo; line on your electricity bill</p>
                </div>

                {/* Tariff */}
                <div>
                  <label htmlFor="calc-tariff" className="block text-sm font-medium text-on-surface mb-1.5">
                    Tariff per unit (₹)
                  </label>
                  <input
                    id="calc-tariff"
                    type="number"
                    min={1}
                    max={30}
                    step={0.5}
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors"
                    placeholder="8.5"
                  />
                  <p className="mt-1 text-xs text-on-surface-variant/70">Divide bill amount by units if unsure</p>
                </div>

                {/* Roof type */}
                <div>
                  <label htmlFor="calc-roof" className="block text-sm font-medium text-on-surface mb-1.5">
                    Roof type
                  </label>
                  <select
                    id="calc-roof"
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors"
                  >
                    {FIELDS.roofTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Usable area */}
                <div>
                  <label htmlFor="calc-area" className="block text-sm font-medium text-on-surface mb-1.5">
                    Usable roof area (sqft)
                  </label>
                  <input
                    id="calc-area"
                    type="number"
                    min={50}
                    max={10000}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors"
                    placeholder="500"
                  />
                  <p className="mt-1 text-xs text-on-surface-variant/70">Shade-free area you can cover</p>
                </div>

                {/* Orientation */}
                <div>
                  <label htmlFor="calc-orientation" className="block text-sm font-medium text-on-surface mb-1.5">
                    Roof orientation
                  </label>
                  <select
                    id="calc-orientation"
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors"
                  >
                    {FIELDS.orientations.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Shading */}
                <div>
                  <label htmlFor="calc-shading" className="block text-sm font-medium text-on-surface mb-1.5">
                    Shading
                  </label>
                  <select
                    id="calc-shading"
                    value={shading}
                    onChange={(e) => setShading(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors"
                  >
                    {FIELDS.shadings.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCompute}
                className="mt-6 w-full rounded-xl bg-primary-container px-6 py-4 text-center font-semibold text-surface transition-all duration-200 hover:bg-surface-tint hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
              >
                Show My Options →
              </button>
            </div>
          </div>

          {/* ── Results ── */}
          <div className="lg:col-span-5">
            {showResult && result ? (
              <div className="rounded-2xl border border-primary-container/30 bg-surface p-6 lg:p-8 space-y-6 animate-fade-in">
                <div>
                  <p className="text-label-sm uppercase tracking-widest text-primary">Your estimate</p>
                  <p className="mt-2 font-jakarta text-headline-lg font-semibold text-on-surface">
                    {result.systemSizeKwp} kWp System
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wide">Monthly Savings</p>
                    <p className="mt-1 font-jakarta text-headline-sm font-bold text-primary-container">₹{fmt(result.monthlySavings)}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wide">Payback Period</p>
                    <p className="mt-1 font-jakarta text-headline-sm font-bold text-on-surface">
                      {result.paybackYears ? `${result.paybackYears} yrs` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wide">PM Surya Ghar Subsidy</p>
                    <p className="mt-1 font-jakarta text-headline-sm font-bold text-primary-container">₹{fmt(result.subsidyAmount)}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wide">Net Cost</p>
                    <p className="mt-1 font-jakarta text-headline-sm font-bold text-on-surface">₹{fmt(result.netCost)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" className="text-primary-container shrink-0"><path d="M440-40v-400H280L600-920v400h160L440-40Z"/></svg>
                  <p className="text-sm text-on-surface">
                    <strong>{fmt(result.annualGenerationKwh)} kWh/year</strong> · offsets {result.co2OffsetTonnes} tonnes CO₂
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="block w-full rounded-xl bg-primary-container px-6 py-4 text-center font-semibold text-surface transition-all duration-200 hover:bg-surface-tint hover:scale-[1.01] active:scale-[0.99]"
                >
                  Get Your Full Detailed Report →
                </Link>

                <p className="text-xs text-on-surface-variant/60 text-center">
                  Based on national averages and PM Surya Ghar 2024-25 rates. Not a substitute for a site survey.
                </p>
              </div>
            ) : showResult && !result ? (
              <div className="rounded-2xl border border-outline-variant bg-surface p-6 lg:p-8 text-center">
                <p className="text-on-surface-variant">Your roof area is too small for a practical solar system. You need at least 50 sqft of shade-free space.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/50 bg-surface p-6 lg:p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48" fill="currentColor" className="text-on-surface-variant/30 mb-4"><path d="M440-40v-400H280L600-920v400h160L440-40Zm70-496v-250L352-520h148v250l158-266H510Z"/></svg>
                <p className="text-on-surface-variant font-medium">Enter your details and click &ldquo;Show My Options&rdquo;</p>
                <p className="mt-2 text-sm text-on-surface-variant/60">No account needed. Results are instant.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
