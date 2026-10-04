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
              India&apos;s smartest rooftop solar planning platform. Built for homeowners, powered by data.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href="mailto:aarsh@rooftogrid.in" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                aarsh@rooftogrid.in
              </a>
              <a href="https://github.com/Aazhs/RoofToGrid" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                Open Source on GitHub
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="/#features" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Features</a></li>
              <li><a href="/#how-it-works" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">How It Works</a></li>
              <li><a href="/#pricing" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Pricing</a></li>
              <li><Link href="/dashboard" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Try It Free</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="https://www.pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">PM Surya Ghar Portal</a></li>
              <li><a href="https://mnre.gov.in" target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">MNRE Guidelines</a></li>
              <li><a href="https://github.com/Aazhs/RoofToGrid" target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">GitHub Repository</a></li>
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
