'use client';

import LandingNav from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <LandingNav />
      <main className="flex-1 max-w-[900px] mx-auto px-4 md:px-8 py-16 font-sans">
        <h1 className="font-jakarta text-headline-lg md:text-display-lg font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Last updated: August 2, 2026
        </p>

        <div className="space-y-8 text-body-md text-on-surface-variant leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">1. Information We Collect</h2>
            <p>
              At RoofToGrid, we collect minimal personal information necessary to calculate solar potential and manage your rooftop projects. This includes your name, email address, electricity bill usage metrics, and general location details for irradiance and DISCOM rate estimates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">2. How We Use Your Data</h2>
            <p>
              Your data is used strictly to provide personalized rooftop solar estimates, compare quotes, track project milestones, and log generation performance. We do not sell your personal information to third-party advertisers or telemarketers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">3. Data Storage and Protection</h2>
            <p>
              We employ industry-standard encryption and security measures to protect your documents and usage logs. Your uploaded invoices, DISCOM permits, and contracts are kept in a private vault accessible only by you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">4. Third-Party Services</h2>
            <p>
              Our platform integrates with official subsidy portals (such as PM Surya Ghar) and authentication providers. Data shared with these services is governed by their respective privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">5. Your Rights & Contact</h2>
            <p>
              You may request a copy of your stored data or request deletion of your account at any time. For privacy inquiries, please contact us at <a href="mailto:privacy@rooftogrid.in" className="text-primary-container font-semibold underline">privacy@rooftogrid.in</a>.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
