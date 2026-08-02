'use client';

import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant py-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left */}
        <div className="text-headline-lg font-bold text-on-surface font-jakarta">
          RoofToGrid
        </div>
        
        {/* Center */}
        <div className="flex gap-8">
          <a href="#features" className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors opacity-80 hover:opacity-100">
            Features
          </a>
          <a href="#how-it-works" className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors opacity-80 hover:opacity-100">
            How It Works
          </a>
          <a href="#pricing" className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors opacity-80 hover:opacity-100">
            Pricing
          </a>
        </div>
        
        {/* Right */}
        <div className="text-label-sm text-on-surface-variant text-center md:text-right">
          © 2026 RoofToGrid. Built with ☀️ in India.
        </div>
      </div>
    </footer>
  );
}
