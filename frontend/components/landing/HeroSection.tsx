'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#f2f8f5] via-[#fffaf0] to-[#eef5ff] lg:flex lg:min-h-[calc(100svh-4rem)] lg:items-center">
      <div className="landing-glow landing-glow-sun -right-28 -top-24" />
      <div className="landing-glow landing-glow-sky -left-28 top-48" />
      <div className="landing-glow landing-glow-leaf bottom-0 left-[42%]" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1180px] items-center gap-10 px-4 py-12 md:px-8 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-8">
        <div className="flex flex-col justify-center lg:min-h-[31rem]">
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#17201b] sm:text-5xl md:text-6xl">
            Plan your rooftop solar.<br /><span className="text-[#bd4809]">Protect every rupee you invest.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#4e5852]">
            Size the right system from your electricity bill, compare installer quotes on equal terms, and track the project until your panels are producing what was promised.
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
            <span>✓ PM Surya Ghar estimate</span>
            <span>✓ Quote red-flag checks</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[#d98b1d]/10 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border border-[#31443a] bg-[#16251e] shadow-[0_28px_80px_rgba(22,37,30,0.24)]">
            <div className="relative h-44 overflow-hidden sm:h-48">
              <Image
                src="/house.jpg"
                alt="Rooftop solar panels installed on an Indian home"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16251e] via-[#16251e]/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9e9df]">Rooftop to grid</p>
                  <p className="mt-1 text-lg font-bold text-white">One plan for the full solar journey</p>
                </div>
                <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">Built for India</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#ffffff24] px-5 py-3">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[#a9cbb9]">PRODUCT PREVIEW</p>
                <p className="mt-1 text-sm font-semibold text-white">Choose a stage to preview</p>
              </div>
              <span className="rounded-full border border-[#ffffff30] bg-[#ffffff12] px-3 py-1 text-xs font-semibold text-[#d8e5dd]">Click a step</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
              {JOURNEY.map((stage, index) => (
                <button
                  key={stage.number}
                  type="button"
                  onClick={() => setActiveStage(index)}
                  aria-pressed={activeStage === index}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
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

            <div className="mx-3 mb-3 rounded-2xl border border-[#ffffff24] bg-[#20352b] p-4" aria-live="polite">
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
              <p className="mt-3 text-sm leading-6 text-[#d5e2da]">{active.detail}</p>
              <Link href="/demo" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#f6b94e] hover:text-[#ffd17c]">
                Try this workflow <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
