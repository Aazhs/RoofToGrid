'use client';

import LandingNav from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <LandingNav />
      <main className="flex-1 max-w-[900px] mx-auto px-4 md:px-8 py-16 font-sans">
        <h1 className="font-jakarta text-headline-lg md:text-display-lg font-bold mb-4">
          Solar Estimation Disclaimer
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Last updated: August 2, 2026
        </p>

        <div className="space-y-8 text-body-md text-on-surface-variant leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">1. Rule-Based Calculations</h2>
            <p>
              Estimates provided by RoofToGrid (system sizing in kWp, monthly generation kWh, 25-year ROI, and payback period) are generated using published national solar irradiance averages for India (standard IN_2026_07 modeling) and standard panel degradation rates (0.5%/year). They do not replace a physical on-site survey by a certified solar engineer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">2. Subsidies & Tariffs</h2>
            <p>
              PM Surya Ghar Muft Bijli Yojana subsidy values (up to ₹78,000) and DISCOM electricity tariffs are subject to government policy updates, regional grid regulations, and DISCOM approval timelines. RoofToGrid does not guarantee subsidy approval or specific grid connection speed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">3. Installer Quotes</h2>
            <p>
              Quote scoring and red-flag analysis are automated evaluation tools designed to highlight pricing anomalies and warranty coverage gaps. Homeowners are advised to perform due diligence before making payments or signing contracts with solar installers.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
