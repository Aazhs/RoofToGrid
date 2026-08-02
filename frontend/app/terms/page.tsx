'use client';

import LandingNav from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <LandingNav />
      <main className="flex-1 max-w-[900px] mx-auto px-4 md:px-8 py-16 font-sans">
        <h1 className="font-jakarta text-headline-lg md:text-display-lg font-bold mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Last updated: August 2, 2026
        </p>

        <div className="space-y-8 text-body-md text-on-surface-variant leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the RoofToGrid platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">2. Nature of Platform & Estimates</h2>
            <p>
              RoofToGrid provides software tools to assist Indian homeowners in estimating rooftop solar requirements, comparing installer quotes, and tracking project milestones. All calculations (savings, payback periods, yields) are rule-based estimates using standard published averages and do not constitute a binding technical or financial guarantee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">3. User Responsibilities</h2>
            <p>
              You are responsible for ensuring the accuracy of data entered into the platform (e.g. monthly bill units, roof dimensions). You remain solely responsible for verifying any final contract or agreement made with third-party solar installers or DISCOM authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">4. Intellectual Property</h2>
            <p>
              All content, code, logos, algorithms, and interface designs on RoofToGrid are the property of RoofToGrid Technologies and are protected by applicable copyright and trademark laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">5. Limitation of Liability</h2>
            <p>
              RoofToGrid Technologies shall not be liable for any indirect, incidental, or consequential damages resulting from your reliance on solar estimations, installer workmanship, or DISCOM approval delays.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
