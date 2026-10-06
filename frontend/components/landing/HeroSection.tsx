'use client';

import Link from 'next/link';
import { useState } from 'react';

const JOURNEY = [
  {
    number: '01',
    label: 'Plan',
    output: 'Size and payback range',
    detail: 'Use your bill and usable roof area to set a defensible system-size range before speaking to installers.',
    metric: '5 kWp',
    metricLabel: 'example recommendation',
  },
  {
    number: '02',
    label: 'Compare',
    output: 'Normalized quote audit',
    detail: 'Compare price per kWp, equipment, written scope and warranties instead of choosing the lowest total.',
    metric: '7 checks',
    metricLabel: 'automatic red-flag rules',
  },
  {
    number: '03',
    label: 'Track',
    output: 'Installation control',
    detail: 'Give every approval and installation stage an owner, target date and document to collect.',
    metric: '9 stages',
    metricLabel: 'from survey to subsidy',
  },
  {
    number: '04',
    label: 'Verify',
    output: 'Performance verdict',
    detail: 'Compare each inverter reading with a seasonal projection and get a clear action when output drops.',
    metric: '−15%',
    metricLabel: 'underperformance trigger',
  },
] as const;

export default function HeroSection() {
  const [activeStage, setActiveStage] = useState(0);
  const active = JOURNEY[activeStage];

  return (
    <section className="relative overflow-hidden bg-[#fbfaf7]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_20%,rgba(246,167,35,0.13),transparent_30%),radial-gradient(circle_at_12%_70%,rgba(38,95,66,0.10),transparent_28%)]" />
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d6d9d5] bg-white px-3 py-1.5 text-xs font-semibold text-[#46504a]">
            <span className="h-2 w-2 rounded-full bg-[#278457]" /> Independent solar decision tools for India
          </div>
          <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#17201b] sm:text-5xl md:text-6xl">
            Know what to buy.<br /><span className="text-[#bd4809]">Know what to question.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#4e5852]">
            Turn your electricity bill, roof and installer quotes into a clear solar decision—then keep the installation and output accountable.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="rounded-xl bg-[#17201b] px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#2a352f]">
              Try the 4-step demo →
            </Link>
            <a href="#calculator" className="rounded-xl border border-[#bcc3be] bg-white px-6 py-3.5 text-center text-sm font-bold text-[#17201b] transition hover:border-[#bd4809]">
              Calculate my starting point
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[#5f6963]">
            <span>✓ No signup for the demo</span>
            <span>✓ Assumptions shown</span>
            <span>✓ No installer placement</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[#d98b1d]/10 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border border-[#31443a] bg-[#16251e] shadow-[0_28px_80px_rgba(22,37,30,0.24)]">
            <div className="flex items-center justify-between border-b border-[#ffffff24] px-5 py-4">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[#a9cbb9]">PRODUCT PREVIEW</p>
                <p className="mt-1 text-sm font-semibold text-white">Choose a stage to preview</p>
              </div>
              <span className="rounded-full border border-[#ffffff30] bg-[#ffffff12] px-3 py-1 text-xs font-semibold text-[#d8e5dd]">Click a step</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
              {JOURNEY.map((stage, index) => (
                <button
                  key={stage.number}
                  type="button"
                  onClick={() => setActiveStage(index)}
                  aria-pressed={activeStage === index}
                  className={`rounded-xl border p-3 text-left transition ${
                    activeStage === index
                      ? 'border-[#f6a723] bg-[#f6a723] text-[#211707]'
                      : 'border-[#ffffff24] bg-[#ffffff0a] text-white hover:border-[#a9cbb9] hover:bg-[#ffffff12]'
                  }`}
                >
                  <span className="block text-[10px] font-bold tracking-wider opacity-70">{stage.number}</span>
                  <span className="mt-1 block text-sm font-bold">{stage.label}</span>
                </button>
              ))}
            </div>

            <div className="mx-4 mb-4 rounded-2xl border border-[#ffffff24] bg-[#20352b] p-5" aria-live="polite">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#a9cbb9]">{active.output}</p>
                  <h2 className="mt-2 text-xl font-bold text-white">{active.label} with evidence</h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-[#f6b94e]">{active.metric}</p>
                  <p className="max-w-[110px] text-[10px] leading-4 text-[#b8c8bf]">{active.metricLabel}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#d5e2da]">{active.detail}</p>
              <Link href="/demo" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f6b94e] hover:text-[#ffd17c]">
                Try this workflow <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
