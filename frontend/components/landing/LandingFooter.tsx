'use client';

import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-headline-lg font-bold text-on-surface font-jakarta">
              RoofToGrid
            </div>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
              Independent rooftop solar planning, quote auditing and project tracking for Indian homeowners.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href="mailto:aarsh@rooftogrid.in" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                aarsh@rooftogrid.in
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="/#how-it-works" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">How It Works</a></li>
              <li><a href="/#calculator" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Calculator</a></li>
              <li><a href="/#principles" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Product principles</a></li>
              <li><Link href="/demo" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Guided demo</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Solar Guides &amp; Blog</Link></li>
              <li><a href="https://www.pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">PM Surya Ghar Portal</a></li>
              <li><a href="https://mnre.gov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">MNRE Guidelines</a></li>
              <li><a href="/#faq" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-outline-variant/50 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant/60">
            © {new Date().getFullYear()} RoofToGrid Technologies. All rights reserved. Built with ☀️ in India.
          </p>
          <p className="text-xs text-on-surface-variant/40">
            Solar estimates are indicative and based on national averages. Not a substitute for a professional site survey.
          </p>
        </div>
      </div>
    </footer>
  );
}
