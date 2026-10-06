'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { calculatePlan } from '@/lib/solar-model';

const TARIFFS = [
  { value: 7.2, label: 'India planning average · ₹7.20/unit' },
  { value: 7.5, label: 'Karnataka example · ₹7.50/unit' },
  { value: 8.5, label: 'Maharashtra example · ₹8.50/unit' },
  { value: 6.5, label: 'Delhi example · ₹6.50/unit' },
  { value: 6, label: 'Gujarat example · ₹6.00/unit' },
  { value: 7, label: 'Tamil Nadu / UP example · ₹7.00/unit' },
];

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

export function QuickCalculator() {
  const [bill, setBill] = useState(4500);
  const [tariff, setTariff] = useState(7.5);
  const [area, setArea] = useState(500);
  const result = useMemo(() => calculatePlan({
    monthlyBill: bill,
    tariffPerKwh: tariff,
    usableAreaSqft: area,
    roofType: 'FLAT',
    orientation: 'S',
    shadingLevel: 'NONE',
  }), [area, bill, tariff]);

  const demoHref = `/demo?bill=${bill}&tariff=${tariff}&area=${area}`;

  return (
    <section id="calculator" className="border-y border-outline-variant bg-surface-container-low py-20 md:py-28">
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">60-second first pass</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-on-surface md:text-5xl">Get a useful range before anyone sells to you.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-on-surface-variant">
              Start with your bill and shade-free roof area. We show the cost, subsidy and payback assumptions—not a magic lead-generation number.
            </p>
            <div className="mt-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
              <strong className="text-on-surface">What this is:</strong> a conservative planning estimate.<br />
              <strong className="text-on-surface">What this is not:</strong> a site survey, structural approval or installer quote.
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-5 md:p-7">
                <h3 className="text-lg font-semibold text-on-surface">Your starting numbers</h3>
                <p className="mt-1 text-xs text-[#66716b]">Drag the sliders or type your values. Results update immediately.</p>
                <div className="mt-6 space-y-6">
                  <label className="block">
                    <span className="flex items-center justify-between gap-4 text-sm font-medium text-on-surface">
                      <span>Average monthly bill</span>
                      <span className="flex items-center rounded-lg border border-[#c8ceca] bg-white px-2.5 py-1.5">
                        <span className="mr-1 text-[#66716b]">₹</span>
                        <input aria-label="Type average monthly bill" type="number" min={500} max={20000} step={250} value={bill} onChange={(event) => setBill(Math.min(20000, Math.max(500, Number(event.target.value))))} className="w-20 bg-transparent text-right text-base font-bold text-[#17201b] outline-none" />
                      </span>
                    </span>
                    <input aria-label="Adjust average monthly bill" type="range" min={500} max={20000} step={250} value={bill} onChange={(event) => setBill(Number(event.target.value))} className="solar-range mt-4 w-full" />
                    <span className="mt-1 flex justify-between text-[10px] text-[#7a847e]"><span>₹500</span><span>{money(bill)}</span><span>₹20,000</span></span>
                  </label>
                  <label className="block text-sm font-medium text-on-surface">
                    Tariff assumption
                    <select value={tariff} onChange={(event) => setTariff(Number(event.target.value))} className="mt-2 w-full cursor-pointer rounded-xl border border-[#c8ceca] bg-white px-3 py-3 text-sm text-[#17201b]">
                      {TARIFFS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="flex items-center justify-between gap-4 text-sm font-medium text-on-surface">
                      <span>Usable, shade-free roof</span>
                      <span className="flex items-center rounded-lg border border-[#c8ceca] bg-white px-2.5 py-1.5">
                        <input aria-label="Type usable roof area" type="number" min={60} max={1500} step={20} value={area} onChange={(event) => setArea(Math.min(1500, Math.max(60, Number(event.target.value))))} className="w-16 bg-transparent text-right text-base font-bold text-[#17201b] outline-none" />
                        <span className="ml-1 text-xs text-[#66716b]">sqft</span>
                      </span>
                    </span>
                    <input aria-label="Adjust usable shade-free roof area" type="range" min={60} max={1500} step={20} value={area} onChange={(event) => setArea(Number(event.target.value))} className="solar-range mt-4 w-full" />
                    <span className="mt-1 flex justify-between text-[10px] text-[#7a847e]"><span>60 sqft</span><span>{area} sqft</span><span>1,500 sqft</span></span>
                  </label>
                </div>
                <p className="mt-6 text-xs leading-5 text-on-surface-variant">Assumes a south-facing flat roof with no shade. You can change roof type, direction and shade in the guided demo.</p>
              </div>

              <div className="bg-[#16251e] p-5 text-[#f7fbf8] md:p-7" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#a9cbb9]">Recommended starting point</p>
                <p className="mt-2 text-5xl font-semibold">{result.recommendedKwp} <span className="text-xl font-normal text-[#c5d3cb]">kWp</span></p>
                <p className="mt-2 text-sm text-[#c5d3cb]">About {result.monthlyUnits} units of monthly use</p>
                <dl className="mt-7 space-y-3">
                  <Metric label="Net cost after subsidy" value={money(result.netCost)} />
                  <Metric label="Estimated subsidy" value={money(result.subsidy)} />
                  <Metric label="Estimated yearly savings" value={money(result.annualSavings)} />
                  <Metric label="Simple payback" value={`${result.paybackYears} years`} />
                </dl>
                <Link href={demoHref} className="mt-7 flex w-full items-center justify-between rounded-xl bg-[#f6a723] px-5 py-4 text-sm font-bold text-[#211707] transition hover:bg-[#ffb843]">
                  <span>Continue with these numbers</span><span aria-hidden="true">→</span>
                </Link>
                <p className="mt-3 text-center text-xs text-[#a9bbb0]">Next: compare sample quotes and build an action plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-baseline justify-between gap-4 border-b border-[#ffffff24] pb-3"><dt className="text-xs text-[#b8c8bf]">{label}</dt><dd className="font-semibold text-[#ffffff]">{value}</dd></div>;
}
