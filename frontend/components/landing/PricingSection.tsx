'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

export function PricingSection() {
  const { ref, isVisible, style } = useScrollReveal();

  return (
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
            Open Access for Homeowners.
          </h2>
          <p className="mt-6 text-body-lg text-on-surface-variant">
            We believe the transition to solar should be transparent and accessible. Our core homeowner tools are completely free, supported by our installer network.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Homeowner Free Plan */}
          <div className="relative overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-low p-8 md:col-span-7 lg:p-12">
            {/* Ambient glow */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
            
            <div className="relative z-10">
              <h3 className="font-jakarta text-headline-sm font-semibold text-on-surface">
                Homeowner Free
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-jakarta text-display-sm font-bold text-on-surface">
                  ₹0
                </span>
                <span className="text-body-lg text-on-surface-variant">/ forever</span>
              </div>
              <p className="mt-4 text-body-md text-on-surface-variant">
                Everything you need to confidently evaluate and plan your solar transition.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  'Unlimited roof potential estimates',
                  'Smart quote comparison & red flag detection',
                  'PM Surya Ghar subsidy calculator',
                  '9-milestone project tracker',
                  'Monthly performance tracking',
                  'Private document vault',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="h-5 w-5 shrink-0 text-primary-container" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-body-md text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-10 block w-full rounded-xl bg-primary-container px-6 py-4 text-center font-semibold text-on-primary-container transition-all duration-200 hover:bg-primary-container/90 hover:scale-[1.01] active:scale-[0.99]">
                Get Started
              </Link>
            </div>
          </div>

          {/* Installer Pro Plan */}
          <div className="rounded-2xl border border-surface-container-high bg-surface p-8 md:col-span-5 lg:p-12">
            <div className="flex items-center gap-3">
              <h3 className="font-jakarta text-headline-sm font-semibold text-on-surface">
                Installer Pro
              </h3>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-container uppercase tracking-wider">Coming Soon</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-jakarta text-display-sm font-bold text-on-surface">
                ₹12,499
              </span>
              <span className="text-body-lg text-on-surface-variant">/ month</span>
            </div>
            <p className="mt-4 text-body-md text-on-surface-variant">
              Advanced lead generation and management for verified solar installers.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'Verified lead matching',
                'Priority directory listing',
                'API access for CRM integration',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg className="h-5 w-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-body-md text-on-surface">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/register" className="mt-10 block w-full rounded-xl border border-outline px-6 py-4 text-center font-semibold text-on-surface transition-all duration-200 hover:border-primary-container hover:text-primary-container hover:scale-[1.01] active:scale-[0.99]">
              Get Notified
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
