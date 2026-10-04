'use client';

import React from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

export function CTABanner() {
  const [ref, visible] = useScrollReveal();

  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-surface-container-low">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary opacity-5 blur-[120px] rounded-full pointer-events-none" />
      
      <div 
        ref={ref}
        className={`max-w-[1280px] mx-auto px-4 md:px-16 text-center relative z-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <h2 className="text-headline-lg md:text-display-lg font-semibold text-on-surface mb-4 font-jakarta">
          Your roof is already generating — just not for you. Yet.
        </h2>
        
        <p className="text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
          Join the growing number of Indian homeowners who plan their solar transition with data, not guesswork. Start free — upgrade if you need Pro features.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard"
            className="bg-primary-container text-surface px-10 py-4 rounded-lg text-lg font-semibold hover:bg-surface-tint transition-colors duration-200 ease-in-out inline-flex items-center gap-2"
          >
            Start Your Solar Plan
            <span aria-hidden="true">→</span>
          </Link>
          <a
            href="#pricing"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            View pricing →
          </a>
        </div>

        {/* Social proof row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-on-surface-variant/60">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/></svg>
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M440-40v-400H280L600-920v400h160L440-40Z"/></svg>
            Free plan available forever
          </span>
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"/></svg>
            Bank-grade data privacy
          </span>
        </div>
      </div>
    </section>
  );
}
