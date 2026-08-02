'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

const SHOWCASE_ITEMS = [
  {
    id: 'sizing',
    tab: 'Sizing Calculator',
    title: 'Three scenarios, one clear decision',
    description: 'Input your electricity bills and roof details. Get Conservative, Optimal, and Max Roof scenarios — each with cost, subsidy, payback period, and 25-year savings calculated instantly.',
    image: '/showcase/sizing-scenarios.jpg',
    stats: [
      { label: 'Scenarios', value: '3' },
      { label: 'Analysis Period', value: '25 yr' },
      { label: 'Subsidy Cap', value: '₹78K' },
    ],
  },
  {
    id: 'comparison',
    tab: 'Quote Comparison',
    title: 'See through every quote',
    description: 'Enter quotes from any installer. Our engine normalizes them to ₹/kWp, scores equipment quality, checks warranties, and flags suspicious pricing — across 17+ metrics.',
    image: '/showcase/quote-comparison.jpg',
    stats: [
      { label: 'Metrics', value: '17+' },
      { label: 'Red Flags', value: '6 checks' },
      { label: 'Scoring', value: 'Weighted' },
    ],
  },
  {
    id: 'milestones',
    tab: 'Project Tracker',
    title: 'Every milestone, tracked',
    description: 'From initial inquiry to subsidy received — track your solar installation across 9 milestones. Log dates, attach documents, and always know what comes next.',
    image: '/showcase/milestone-tracker.jpg',
    stats: [
      { label: 'Milestones', value: '9' },
      { label: 'Doc Vault', value: 'Private' },
      { label: 'Monitoring', value: 'Monthly' },
    ],
  },
];

export function Testimonials() {
  const { ref, isVisible } = useScrollReveal();
  const [activeTab, setActiveTab] = useState(0);
  const active = SHOWCASE_ITEMS[activeTab];

  return (
    <section className="py-20 md:py-32">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Header */}
          <span className="text-label-sm text-outline uppercase tracking-widest mb-4 block font-jakarta">
            INSIDE THE PLATFORM
          </span>
          <h2 className="text-headline-lg md:text-display-lg font-semibold text-on-surface mb-4 font-jakarta">
            See it in action.
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-10 max-w-2xl font-jakarta">
            Real screens from the platform. No mockups, no promises — this is what you get when you sign up.
          </p>

          {/* Tab Switcher */}
          <div className="flex flex-wrap gap-2 mb-10">
            {SHOWCASE_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(idx)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold font-jakarta transition-all duration-200 ${
                  activeTab === idx
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary-container'
                }`}
              >
                {item.tab}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Screenshot */}
            <div className="lg:col-span-7 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low">
              <div className="relative aspect-[16/10]">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  className="object-cover object-top transition-opacity duration-500"
                  sizes="(max-width: 768px) 100vw, 58vw"
                />
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h3 className="text-headline-sm md:text-headline-lg font-semibold text-on-surface mb-4 font-jakarta">
                {active.title}
              </h3>
              <p className="text-body-md text-on-surface-variant font-jakarta mb-8">
                {active.description}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                {active.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-center"
                  >
                    <p className="font-mono text-lg font-bold text-primary-container">
                      {stat.value}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
