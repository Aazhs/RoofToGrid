'use client';

import React from 'react';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

export function ComparisonSection() {
  const [headerRef, headerVisible] = useScrollReveal();
  
  const comparisons = [
    {
      feature: 'Finding installers',
      without: 'Google and hope for the best',
      with: 'Structured quote entry for any installer',
    },
    {
      feature: 'Comparing quotes',
      without: 'Spreadsheets and confusion',
      with: 'Auto-normalized ₹/kWp comparison',
    },
    {
      feature: 'Subsidy calculation',
      without: 'Visit 5 government websites',
      with: 'PM Surya Ghar auto-calculated',
    },
    {
      feature: 'Project tracking',
      without: 'WhatsApp message chaos',
      with: '9-milestone visual tracker',
    },
    {
      feature: 'Performance monitoring',
      without: 'Trust the installer blindly',
      with: 'Monthly generation vs projection tracking',
    }
  ];

  return (
    <section className="py-20 md:py-32 max-w-[1280px] mx-auto px-4 md:px-16">
      <div 
        ref={headerRef} 
        className={`transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <h2 className="text-headline-lg md:text-display-lg font-semibold mb-4 font-jakarta">Why RoofToGrid Exists</h2>
        <p className="text-body-lg text-on-surface-variant mb-12 max-w-2xl">
          The traditional way to go solar in India is broken — opaque pricing, confusing subsidy math, and no standardized comparison. We built RoofToGrid to put homeowners back in control.
        </p>
      </div>

      <div className="w-full">
        {/* Header Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-surface-container-high text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
          <div className="hidden md:block">Feature</div>
          <div className="hidden md:block">Without RoofToGrid</div>
          <div className="hidden md:block">With RoofToGrid</div>
        </div>

        {/* Rows */}
        {comparisons.map((row, index) => (
          <ComparisonRow key={index} row={row} index={index} />
        ))}
      </div>
    </section>
  );
}

function ComparisonRow({ row, index }: { row: any, index: number }) {
  const [ref, visible] = useScrollReveal();
  
  return (
    <div 
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 py-5 border-b border-surface-container-high transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="font-semibold text-on-surface md:text-body-lg mb-2 md:mb-0 flex items-center">
        {row.feature}
      </div>
      <div className="text-on-surface-variant/60 flex items-center gap-2">
        <span className="text-error font-bold text-lg">✗</span> {row.without}
      </div>
      <div className="text-on-surface flex items-center gap-2">
        <span className="text-primary-container font-bold text-lg">✓</span> {row.with}
      </div>
    </div>
  );
}
