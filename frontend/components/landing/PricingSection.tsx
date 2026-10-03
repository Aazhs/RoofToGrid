'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/landing/useScrollReveal';
import { UpiCheckoutModal } from '@/components/billing/UpiCheckoutModal';
import { useSubscription } from '@/lib/subscription';

export function PricingSection() {
  const { ref, isVisible, style } = useScrollReveal();
  const { isPro } = useSubscription();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <section id="pricing" className="bg-surface py-24 md:py-32">
        <div
          ref={ref}
          style={style}
          className="mx-auto max-w-[1280px] px-4 md:px-16"
        >
          {/* Header */}
          <div className="mb-16 max-w-2xl">
            <p className="text-label-sm uppercase tracking-widest text-primary">
              PRICING
            </p>
            <h2 className="mt-4 font-jakarta text-display-lg font-semibold tracking-tight text-on-surface">
              Plan With Confidence. Scale When Ready.
            </h2>
            <p className="mt-6 text-body-lg text-on-surface-variant">
              Start free with our core tools. Upgrade to Pro for advanced analytics, priority support, and unlimited document storage.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Free Plan */}
            <div className="relative overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-low p-8 md:col-span-4 lg:p-10">
              <div className="relative z-10">
                <h3 className="font-jakarta text-headline-sm font-semibold text-on-surface">
                  Free
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-jakarta text-display-sm font-bold text-on-surface">
                    ₹0
                  </span>
                  <span className="text-body-lg text-on-surface-variant">forever</span>
                </div>
                <p className="mt-4 text-body-md text-on-surface-variant">
                  Everything you need to evaluate whether solar makes sense for your home.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    'Unlimited sizing estimates',
                    'Up to 3 quote comparisons',
                    'PM Surya Ghar subsidy calculator',
                    '1 project tracker',
                    '3 months of performance data',
                    '50 MB document storage',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="h-5 w-5 shrink-0 text-primary-container" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-body-md text-on-surface">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard" className="mt-10 block w-full rounded-xl border border-outline px-6 py-4 text-center font-semibold text-on-surface transition-all duration-200 hover:border-primary-container hover:text-primary-container hover:scale-[1.01] active:scale-[0.99]">
                  Try It Free
                </Link>
              </div>
            </div>

            {/* Pro Plan — highlighted */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary-container bg-surface-container-low p-8 md:col-span-4 lg:p-10">
              {/* Popular badge */}
              <div className="absolute top-0 right-0 bg-primary-container text-surface text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
                Most Popular
              </div>
              {/* Ambient glow */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />

              <div className="relative z-10">
                <h3 className="font-jakarta text-headline-sm font-semibold text-on-surface">
                  Pro
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-jakarta text-display-sm font-bold text-on-surface">
                    ₹499
                  </span>
                  <span className="text-body-lg text-on-surface-variant">/ month</span>
                </div>
                <p className="mt-4 text-body-md text-on-surface-variant">
                  Full power for serious solar buyers tracking their investment end-to-end.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    'Everything in Free',
                    'Unlimited quote comparisons',
                    'Unlimited project trackers',
                    'Full performance history',
                    'Warranty expiry alerts',
                    'Priority email support',
                    '2 GB document storage',
                    'Export reports as PDF',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="h-5 w-5 shrink-0 text-primary-container" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-body-md text-on-surface">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isPro ? (
                  <Link
                    href="/dashboard"
                    className="mt-10 block w-full rounded-xl bg-emerald-600 px-6 py-4 text-center font-semibold text-white transition-all duration-200 hover:bg-emerald-700"
                  >
                    ✓ Pro Active · Open App
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="mt-10 block w-full rounded-xl bg-primary-container px-6 py-4 text-center font-semibold text-on-primary-container transition-all duration-200 hover:bg-primary-container/90 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary-container/20 cursor-pointer"
                  >
                    Start Pro — ₹499/mo
                  </button>
                )}
                <p className="mt-3 text-center text-xs text-on-surface-variant">Instant UPI activation. Cancel anytime.</p>
              </div>
            </div>

            {/* Installer Pro Plan */}
            <div className="rounded-2xl border border-surface-container-high bg-surface p-8 md:col-span-4 lg:p-10">
              <div className="flex items-center gap-3">
                <h3 className="font-jakarta text-headline-sm font-semibold text-on-surface">
                  Installer Pro
                </h3>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-container uppercase tracking-wider">Coming Soon</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-jakarta text-display-sm font-bold text-on-surface">
                  ₹4,999
                </span>
                <span className="text-body-lg text-on-surface-variant">/ month</span>
              </div>
              <p className="mt-4 text-body-md text-on-surface-variant">
                Lead generation and project management for verified solar installers.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  'Verified installer profile',
                  'Qualified lead matching',
                  'Direct quote submission',
                  'Performance reputation score',
                  'API access for CRM',
                  'Priority directory listing',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="h-5 w-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-body-md text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>

              <button disabled className="mt-10 block w-full rounded-xl border border-outline px-6 py-4 text-center font-semibold text-on-surface/50 cursor-not-allowed transition-all duration-200">
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-on-surface-variant">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/></svg>
              256-bit SSL encrypted
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
              Data never shared
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M440-40v-400H280L600-920v400h160L440-40Z"/></svg>
              Direct UPI · Zero Platform Fees
            </span>
          </div>
        </div>
      </section>

      {/* UPI Checkout Modal */}
      <UpiCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}

