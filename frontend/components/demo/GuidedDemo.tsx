'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ORIENTATIONS, ROOF_TYPES, SHADING_LEVELS } from '@/lib/constants';
import {
  MODEL_ID,
  calculatePlan,
  evaluateDemoQuotes,
  evaluatePerformance,
  type PlanInputs,
} from '@/lib/solar-model';
import type { Orientation, RoofType, ShadingLevel } from '@/lib/types';

const STEPS = [
  { number: 1, short: 'Plan', title: 'Size the system' },
  { number: 2, short: 'Compare', title: 'Audit three quotes' },
  { number: 3, short: 'Track', title: 'Control the project' },
  { number: 4, short: 'Verify', title: 'Check performance' },
] as const;

const MILESTONES = [
  { title: 'Sizing and budget confirmed', owner: 'You', proof: 'Saved sizing report' },
  { title: 'Technical site survey', owner: 'Installer', proof: 'Survey notes + roof measurements' },
  { title: 'Design and equipment confirmed', owner: 'You + installer', proof: 'Layout, SLD and final BOM' },
  { title: 'DISCOM application submitted', owner: 'Installer', proof: 'Portal acknowledgement number' },
  { title: 'Technical feasibility approved', owner: 'DISCOM', proof: 'Approval letter' },
  { title: 'Installation scheduled', owner: 'Installer', proof: 'Delivery and work dates' },
  { title: 'Installation completed', owner: 'Installer', proof: 'Commissioning checklist' },
  { title: 'Net meter activated', owner: 'DISCOM', proof: 'Meter test report' },
  { title: 'Subsidy received', owner: 'MNRE / bank', proof: 'DBT credit confirmation' },
] as const;

const MONTHS = [
  ['January', 0.078], ['February', 0.082], ['March', 0.092], ['April', 0.095],
  ['May', 0.094], ['June', 0.08], ['July', 0.069], ['August', 0.07],
  ['September', 0.078], ['October', 0.086], ['November', 0.089], ['December', 0.087],
] as const;

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

const number = (value: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);

const DEFAULT_INPUTS: PlanInputs = {
  monthlyBill: 4500,
  tariffPerKwh: 7.5,
  usableAreaSqft: 500,
  roofType: 'FLAT',
  orientation: 'S',
  shadingLevel: 'NONE',
};

export function GuidedDemo() {
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [inputs, setInputs] = useState<PlanInputs>(DEFAULT_INPUTS);
  const plan = useMemo(() => calculatePlan(inputs), [inputs]);
  const quotes = useMemo(() => evaluateDemoQuotes(plan), [plan]);
  const [selectedQuoteId, setSelectedQuoteId] = useState('clear-roof');
  const [completedMilestones, setCompletedMilestones] = useState(3);
  const [monitorMonth, setMonitorMonth] = useState(9);
  const [actualGeneration, setActualGeneration] = useState(0);

  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId) ?? quotes[0];
  const projectedGeneration = Math.round(plan.annualGenerationKwh * (MONTHS[monitorMonth]?.[1] ?? 1 / 12));
  const performance = evaluatePerformance(actualGeneration, projectedGeneration);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bill = Number(params.get('bill'));
    const tariff = Number(params.get('tariff'));
    const area = Number(params.get('area'));
    setInputs((current) => ({
      ...current,
      monthlyBill: Number.isFinite(bill) && bill >= 500 ? bill : current.monthlyBill,
      tariffPerKwh: Number.isFinite(tariff) && tariff >= 1 ? tariff : current.tariffPerKwh,
      usableAreaSqft: Number.isFinite(area) && area >= 20 ? area : current.usableAreaSqft,
    }));
  }, []);

  useEffect(() => {
    setActualGeneration(Math.round(projectedGeneration * 0.88));
  }, [projectedGeneration]);

  const goTo = (next: number) => {
    setStep(next);
    setMaxReached((current) => Math.max(current, next));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadPlan = () => {
    if (!selectedQuote) return;
    const report = [
      'ROOFTOGRID — SOLAR DECISION BRIEF',
      `Generated ${new Date().toLocaleDateString('en-IN')}`,
      '',
      '1. HOME & USAGE',
      `Monthly bill: ${money(inputs.monthlyBill)}`,
      `Estimated consumption: ${plan.monthlyUnits} units/month`,
      `Usable roof: ${inputs.usableAreaSqft} sqft, ${inputs.orientation}, ${inputs.shadingLevel.toLowerCase()} shade`,
      '',
      '2. PLANNING RANGE',
      `Recommended size: ${plan.recommendedKwp} kWp`,
      `Estimated annual generation: ${number(plan.annualGenerationKwh)} kWh`,
      `Estimated net cost after subsidy: ${money(plan.netCost)}`,
      `Estimated annual savings: ${money(plan.annualSavings)}`,
      `Simple payback: ${plan.paybackYears ?? 'Not available'} years`,
      '',
      '3. SAMPLE QUOTE DECISION',
      `Selected sample: ${selectedQuote.name}`,
      `Normalized price: ${money(selectedQuote.pricePerKwp)}/kWp`,
      `Value score: ${selectedQuote.score}/100`,
      ...(selectedQuote.redFlags.length ? selectedQuote.redFlags.map((flag) => `Ask: ${flag}`) : ['Ask for final BOM, model numbers and exclusions in writing.']),
      '',
      '4. PERFORMANCE CHECK',
      `Month checked: ${MONTHS[monitorMonth]?.[0]}`,
      `Projected month: ${projectedGeneration} kWh`,
      `Actual entered: ${actualGeneration} kWh`,
      `Variance: ${performance.variancePercent}% (${performance.health})`,
      `Action: ${performance.action}`,
      '',
      `Assumption set: ${MODEL_ID}. This is a planning estimate, not a site survey or installer recommendation.`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rooftogrid-decision-brief.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="border-b border-outline-variant/60 bg-surface/95">
        <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="text-lg font-bold tracking-tight">RoofToGrid</Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-on-surface-variant sm:inline">No account · Nothing uploaded</span>
            <Link href="/register" className="rounded-lg bg-on-surface px-4 py-2 text-sm font-semibold text-surface">
              Save for real
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[1180px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Interactive walkthrough</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
              Make one solar decision from start to finish.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant md:text-base">
              Use your own rough numbers, audit fictional quotes, see the paperwork path and test a generation reading.
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
            Demo data is clearly labelled. Calculations use {MODEL_ID}.
          </div>
        </div>

        <nav aria-label="Demo progress" className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
          {STEPS.map((item) => {
            const active = step === item.number;
            const available = item.number <= maxReached;
            return (
              <button
                key={item.number}
                type="button"
                disabled={!available}
                onClick={() => goTo(item.number)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-slate-900'
                    : available
                      ? 'border-outline-variant bg-surface-container-lowest hover:border-brand-400'
                      : 'cursor-not-allowed border-outline-variant/50 bg-surface-container-low text-on-surface-variant/50'
                }`}
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider">0{item.number} · {item.short}</span>
                <span className="mt-1 block text-sm font-semibold">{item.title}</span>
              </button>
            );
          })}
        </nav>

        {step === 1 && (
          <section aria-labelledby="step-one-title" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 1 of 4</p>
              <h2 id="step-one-title" className="mt-2 text-2xl font-semibold">Start with what you already know</h2>
              <p className="mt-2 text-sm text-on-surface-variant">A bill and a rough shade-free roof measurement are enough for a first-pass plan.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <DemoNumber label="Monthly bill (₹)" value={inputs.monthlyBill} min={500} step={250}
                  onChange={(monthlyBill) => setInputs({ ...inputs, monthlyBill })} />
                <DemoNumber label="Effective tariff (₹/unit)" value={inputs.tariffPerKwh} min={1} step={0.1}
                  onChange={(tariffPerKwh) => setInputs({ ...inputs, tariffPerKwh })} />
                <DemoNumber label="Usable shade-free roof (sqft)" value={inputs.usableAreaSqft} min={20} step={10}
                  onChange={(usableAreaSqft) => setInputs({ ...inputs, usableAreaSqft })} />
                <DemoSelect label="Roof type" value={inputs.roofType} options={ROOF_TYPES}
                  onChange={(roofType) => setInputs({ ...inputs, roofType: roofType as RoofType })} />
                <DemoSelect label="Direction" value={inputs.orientation} options={ORIENTATIONS}
                  onChange={(orientation) => setInputs({ ...inputs, orientation: orientation as Orientation })} />
                <DemoSelect label="Daytime shade" value={inputs.shadingLevel} options={SHADING_LEVELS}
                  onChange={(shadingLevel) => setInputs({ ...inputs, shadingLevel: shadingLevel as ShadingLevel })} />
              </div>
            </div>

            <div className="rounded-2xl bg-[#16251e] p-5 text-white md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a9cbb9]">Your planning result</p>
                  <p className="mt-2 text-5xl font-semibold">{plan.recommendedKwp || '—'} <span className="text-xl font-normal text-white/60">kWp</span></p>
                  <p className="mt-2 text-sm text-white/70">{plan.reason}</p>
                </div>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold">{plan.suitability}</span>
              </div>

              {plan.recommendedKwp > 0 ? (
                <>
                  <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
                    <Result label="Estimated net cost" value={money(plan.netCost)} />
                    <Result label="Central subsidy" value={money(plan.subsidy)} />
                    <Result label="Yearly savings" value={money(plan.annualSavings)} />
                    <Result label="Simple payback" value={`${plan.paybackYears} years`} />
                    <Result label="Annual generation" value={`${number(plan.annualGenerationKwh)} units`} />
                    <Result label="Usage offset" value={`${plan.offsetPercent}%`} />
                  </dl>
                  <div className="mt-5 flex flex-col justify-between gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center">
                    <p className="max-w-md text-xs leading-5 text-white/60">Conservative rule-based estimate. A physical survey must confirm area, structure and shade.</p>
                    <button onClick={() => goTo(2)} className="rounded-lg bg-[#f6a723] px-5 py-3 text-sm font-bold text-[#211707] hover:bg-[#ffb843]">
                      Audit sample quotes →
                    </button>
                  </div>
                </>
              ) : (
                <button onClick={() => setInputs({ ...inputs, shadingLevel: 'LIGHT', usableAreaSqft: 300 })} className="mt-8 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#16251e]">
                  Try a workable example
                </button>
              )}
            </div>
          </section>
        )}

        {step === 2 && selectedQuote && (
          <section aria-labelledby="step-two-title">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 2 of 4</p>
                <h2 id="step-two-title" className="mt-2 text-2xl font-semibold">Compare scope, not just the total</h2>
                <p className="mt-2 text-sm text-on-surface-variant">These installers are fictional. The scoring rules and red-flag checks are the real product behaviour.</p>
              </div>
              <div className="text-sm text-on-surface-variant">Sized for <strong className="text-on-surface">{plan.recommendedKwp} kWp</strong></div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {quotes.map((quote, index) => {
                const selected = quote.id === selectedQuoteId;
                return (
                  <article key={quote.id} className={`flex flex-col rounded-2xl border p-5 ${selected ? 'border-brand-500 bg-brand-50/70 shadow-lg' : 'border-outline-variant bg-surface-container-lowest'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Sample quote {String.fromCharCode(65 + index)}</p>
                        <h3 className="mt-1 text-lg font-semibold">{quote.name}</h3>
                      </div>
                      {index === 0 && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800">Best score</span>}
                    </div>
                    <p className="mt-5 text-3xl font-semibold">{money(quote.totalPrice)}</p>
                    <p className="text-xs text-on-surface-variant">{money(quote.pricePerKwp)}/kWp · before subsidy</p>
                    <dl className="mt-5 space-y-2 border-y border-outline-variant py-4 text-sm">
                      <QuoteRow label="Value score" value={`${quote.score}/100`} />
                      <QuoteRow label="Equipment" value={quote.equipmentTier} />
                      <QuoteRow label="Net after subsidy" value={money(quote.netCost)} />
                      <QuoteRow label="Simple payback" value={`${quote.paybackYears} years`} />
                    </dl>
                    <div className="mt-4 flex-1">
                      <p className="text-sm font-semibold">{quote.redFlags.length ? `${quote.redFlags.length} red flags` : 'No automatic red flags'}</p>
                      <ul className="mt-2 space-y-2 text-xs leading-5 text-on-surface-variant">
                        {(quote.redFlags.length ? quote.redFlags.slice(0, 3) : [quote.verdict]).map((flag) => <li key={flag}>• {flag}</li>)}
                      </ul>
                    </div>
                    <button onClick={() => setSelectedQuoteId(quote.id)} className={`mt-5 rounded-lg px-4 py-2.5 text-sm font-semibold ${selected ? 'bg-on-surface text-surface' : 'border border-outline-variant hover:border-brand-500'}`}>
                      {selected ? 'Selected for project' : 'Choose this sample'}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold">Your negotiation brief for {selectedQuote.name}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {selectedQuote.redFlags[0] ?? 'Ask for panel and inverter model numbers, final structure specification, exclusions and delivery dates in writing.'}
                </p>
              </div>
              <button onClick={() => goTo(3)} className="rounded-lg bg-on-surface px-5 py-3 text-sm font-semibold text-surface">Build the project plan →</button>
            </div>
          </section>
        )}

        {step === 3 && selectedQuote && (
          <section aria-labelledby="step-three-title" className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 3 of 4</p>
              <h2 id="step-three-title" className="mt-2 text-2xl font-semibold">Know the next owner and the proof to collect</h2>
              <p className="mt-2 text-sm text-on-surface-variant">A project tracker is useful only when every stage has an owner and a document—not just a percentage.</p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
                {MILESTONES.map((milestone, index) => {
                  const done = index < completedMilestones;
                  const current = index === completedMilestones;
                  return (
                    <div key={milestone.title} className={`grid gap-2 border-b border-outline-variant px-4 py-4 last:border-0 sm:grid-cols-[36px_1fr_auto] sm:items-center ${current ? 'bg-amber-50/70' : ''}`}>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-600 text-white' : current ? 'bg-amber-400 text-amber-950' : 'bg-surface-container-high text-on-surface-variant'}`}>{done ? '✓' : index + 1}</span>
                      <div>
                        <p className="text-sm font-semibold">{milestone.title}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">Keep: {milestone.proof}</p>
                      </div>
                      <span className="text-xs font-medium text-on-surface-variant">Owner: {milestone.owner}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="h-fit rounded-2xl bg-[#16251e] p-5 text-white lg:sticky lg:top-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a9cbb9]">Project control</p>
              <h3 className="mt-2 text-xl font-semibold">{selectedQuote.name} · {plan.recommendedKwp} kWp</h3>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#f6a723]" style={{ width: `${Math.round((completedMilestones / MILESTONES.length) * 100)}%` }} /></div>
              <p className="mt-2 text-sm text-white/70">{completedMilestones} of {MILESTONES.length} stages complete</p>
              <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-white/50">Next action</p>
                <p className="mt-2 font-semibold">{MILESTONES[completedMilestones]?.title ?? 'Project complete'}</p>
                <p className="mt-1 text-sm text-white/65">{MILESTONES[completedMilestones]?.proof ?? 'Store the final subsidy confirmation.'}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button disabled={completedMilestones === 0} onClick={() => setCompletedMilestones((value) => Math.max(0, value - 1))} className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-30">Undo</button>
                <button disabled={completedMilestones === MILESTONES.length} onClick={() => setCompletedMilestones((value) => Math.min(MILESTONES.length, value + 1))} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#16251e] disabled:opacity-30">Complete next</button>
              </div>
              <button onClick={() => goTo(4)} className="mt-6 w-full rounded-lg bg-[#f6a723] px-4 py-3 text-sm font-bold text-[#211707]">Check system output →</button>
            </aside>
          </section>
        )}

        {step === 4 && selectedQuote && (
          <section aria-labelledby="step-four-title">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 4 of 4</p>
            <h2 id="step-four-title" className="mt-2 text-2xl font-semibold">Turn a generation reading into an action</h2>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">Enter the monthly total from the inverter app. RoofToGrid compares it with the saved projection rather than showing decorative “live” telemetry.</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-7">
                <label htmlFor="monitor-month" className="mb-5 block text-sm font-semibold">
                  Month being checked
                  <select id="monitor-month" value={monitorMonth} onChange={(event) => setMonitorMonth(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 font-normal text-on-surface">
                    {MONTHS.map(([label], index) => <option key={label} value={index}>{label}</option>)}
                  </select>
                </label>
                <label htmlFor="actual-generation" className="text-sm font-semibold">Actual generation this month</label>
                <div className="mt-3 flex items-end gap-2">
                  <input id="actual-generation" type="number" min={0} value={actualGeneration} onChange={(event) => setActualGeneration(Math.max(0, Number(event.target.value)))} className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-3xl font-semibold" />
                  <span className="pb-3 text-sm text-on-surface-variant">kWh</span>
                </div>
                <input aria-label="Adjust actual generation" type="range" min={0} max={Math.max(100, Math.round(projectedGeneration * 1.3))} value={actualGeneration} onChange={(event) => setActualGeneration(Number(event.target.value))} className="mt-5 w-full accent-brand-600" />
                <div className="mt-2 flex justify-between text-xs text-on-surface-variant"><span>0</span><span>Projection: {projectedGeneration}</span><span>+30%</span></div>
              </div>

              <div className={`rounded-2xl border p-5 md:p-7 ${performance.health === 'HEALTHY' ? 'border-emerald-300 bg-emerald-50' : performance.health === 'WATCH' ? 'border-amber-300 bg-amber-50' : 'border-red-300 bg-red-50'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Performance verdict</p>
                    <p className="mt-2 text-4xl font-semibold text-slate-900">{performance.variancePercent > 0 ? '+' : ''}{performance.variancePercent}%</p>
                    <p className="mt-1 text-sm text-slate-600">against the monthly projection</p>
                  </div>
                  <span className="rounded-full border border-current px-3 py-1 text-xs font-bold text-slate-800">{performance.health}</span>
                </div>
                <div className="mt-6 rounded-xl bg-white/70 p-4 text-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wider">What to do next</p>
                  <p className="mt-2 text-sm leading-6">{performance.action}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#16251e] p-6 text-white md:flex md:items-center md:justify-between md:gap-8 md:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#a9cbb9]">Demo complete</p>
                <h3 className="mt-2 text-2xl font-semibold">You now have a decision, not a dashboard tour.</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Download the numbers and questions you generated, or create an account to save real bills, quotes, milestones and monthly readings.</p>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-0">
                <button onClick={downloadPlan} className="rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold hover:bg-white/10">Download brief</button>
                <Link href="/register" className="rounded-lg bg-[#f6a723] px-5 py-3 text-center text-sm font-bold text-[#211707]">Create free account</Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function DemoNumber({ label, value, min, step, onChange }: { label: string; value: number; min: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input type="number" value={value} min={min} step={step} onChange={(event) => onChange(Math.max(min, Number(event.target.value)))} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-on-surface" />
    </label>
  );
}

function DemoSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-on-surface">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="bg-[#16251e] p-4"><dt className="text-xs text-white/50">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}

function QuoteRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><dt className="text-on-surface-variant">{label}</dt><dd className="font-semibold">{value}</dd></div>;
}
