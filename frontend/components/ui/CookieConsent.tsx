'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('rooftogrid_cookie_consent');
      if (!saved) {
        // Small delay so it doesn't pop in abruptly on initial paint
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in strict private mode
    }
  }, []);

  const handleChoice = (preference: 'accepted' | 'essential') => {
    try {
      localStorage.setItem('rooftogrid_cookie_consent', preference);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div 
      role="dialog" 
      aria-live="polite"
      aria-label="Cookie and data privacy preferences"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-surface-container border border-outline-variant/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-surface flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L160-560q0 134 85 231.5T440-162Zm280-128q17-30 28.5-62t11.5-70q0-100-50-180t-130-120v20q0 33-23.5 56.5T500-640h-80v80q0 17-11.5 28.5T380-520h-60v80h160q33 0 56.5 23.5T560-360v70h160Z"/>
            </svg>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-on-surface font-jakarta">
              Your Privacy Matters
            </h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              We use essential cookies to maintain secure sessions and performance metrics to enhance your solar calculations — compliant with India&apos;s DPDPA and GDPR.{' '}
              <Link href="/cookies" className="underline hover:text-on-surface transition-colors">
                Cookie Policy
              </Link>
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleChoice('accepted')}
                className="flex-1 rounded-lg bg-primary-container text-surface px-3 py-2 text-xs font-semibold hover:bg-surface-tint transition-colors"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => handleChoice('essential')}
                className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface px-3 py-2 text-xs font-medium hover:bg-surface-container-high transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
