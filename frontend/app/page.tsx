import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import { QuickCalculator } from '@/components/landing/QuickCalculator';
import { ProductJourney } from '@/components/landing/ProductJourney';
import { FAQ } from '@/components/landing/FAQ';
import { LandingFooter } from '@/components/landing/LandingFooter';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rooftogrid.in';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How accurate are RoofToGrid solar savings estimates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RoofToGrid provides rule-based planning estimates using disclosed India averages and homeowner inputs. Results are not a site survey or guaranteed generation figure.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the PM Surya Ghar rooftop solar subsidy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The planning rule provides ₹30,000 per kW for the first 2 kW and ₹18,000 for the third kW, capped at ₹78,000 for eligible residential systems. Final eligibility must be confirmed through the official programme.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does RoofToGrid compare solar installer quotes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RoofToGrid normalizes user-entered quotes by price per kWp, equipment tier, warranty coverage, financing and written scope, then identifies explicit red flags.',
      },
    },
  ],
  mainEntityOfPage: BASE_URL,
};

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <LandingNav />
      <main id="main" className="landing-page">
        <HeroSection />
        <QuickCalculator />
        <ProductJourney />
        <FAQ />
      </main>
      <LandingFooter />
    </>
  );
}
