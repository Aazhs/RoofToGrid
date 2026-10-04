import dynamic from 'next/dynamic';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { QuickCalculator } from '@/components/landing/QuickCalculator';

// Lazy load below-the-fold sections for performance optimization (Lighthouse 100/100 target)
const FeatureGrid = dynamic(() => import('@/components/landing/FeatureGrid').then((m) => m.FeatureGrid));
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'));
const ComparisonSection = dynamic(() => import('@/components/landing/ComparisonSection').then((m) => m.ComparisonSection));
const PricingSection = dynamic(() => import('@/components/landing/PricingSection').then((m) => m.PricingSection));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then((m) => m.Testimonials));
const FAQ = dynamic(() => import('@/components/landing/FAQ').then((m) => m.FAQ));
const CTABanner = dynamic(() => import('@/components/landing/CTABanner').then((m) => m.CTABanner));
const LandingFooter = dynamic(() => import('@/components/landing/LandingFooter').then((m) => m.LandingFooter));

/**
 * Landing page — uses global theme from ThemeProvider (in providers.tsx).
 * No scoped wrapper needed; CSS variables on :root / html.dark handle everything.
 */
export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main id="main">
        <HeroSection />
        <StatsCounter />
        <QuickCalculator />
        <FeatureGrid />
        <HowItWorks />
        <ComparisonSection />
        <PricingSection />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>
      <LandingFooter />
    </>
  );
}
