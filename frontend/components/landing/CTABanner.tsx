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
          Plan your solar transition with data, not guesswork.
        </p>
        
        <Link 
          href="/dashboard"
          className="bg-primary-container text-surface px-10 py-4 rounded-lg text-lg font-semibold hover:bg-surface-tint transition-colors duration-200 ease-in-out inline-flex items-center gap-2"
        >
          Try the Platform Free
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
