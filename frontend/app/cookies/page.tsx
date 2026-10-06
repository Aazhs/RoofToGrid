'use client';

import LandingNav from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <LandingNav />
      <main className="flex-1 max-w-[900px] mx-auto px-4 md:px-8 py-16 font-sans">
        <h1 className="font-jakarta text-headline-lg md:text-display-lg font-bold mb-4">
          Cookie Policy
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Last updated: August 2, 2026
        </p>

        <div className="space-y-8 text-body-md text-on-surface-variant leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us recognize your session, keep you logged in, and remember your preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">2. How We Use Cookies</h2>
            <p>
              RoofToGrid uses essential cookies for session management and authentication tokens. We do not use intrusive third-party tracking cookies to build advertising profiles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-sm font-semibold text-on-surface font-jakarta">3. Managing Cookies</h2>
            <p>
              You can control or disable cookies through your browser settings. However, disabling essential cookies may impact your ability to log in and access your account dashboard.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
