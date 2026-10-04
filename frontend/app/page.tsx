import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { QuickCalculator } from '@/components/landing/QuickCalculator';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTABanner } from '@/components/landing/CTABanner';
import { LandingFooter } from '@/components/landing/LandingFooter';

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
