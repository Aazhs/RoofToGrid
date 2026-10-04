import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

interface ArticleData {
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  content: React.ReactNode;
}

const ARTICLE_CONTENT: Record<string, ArticleData> = {
  'pm-surya-ghar-subsidy-guide-2026': {
    title: 'PM Surya Ghar Muft Bijli Yojana: 2026 Complete Subsidy Guide & Step-by-Step Calculation',
    category: 'Subsidies & Policy',
    date: 'Oct 2, 2026',
    readTime: '6 min read',
    author: 'Aarsh Joshi',
    content: (
      <>
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          Launched by the Government of India, the <strong>PM Surya Ghar: Muft Bijli Yojana</strong> provides direct financial assistance to residential households transitioning to rooftop solar power. With an outlay of ₹75,021 crore, the scheme aims to light up 1 crore households across the nation.
        </p>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          1. Central Financial Assistance (CFA) Slab Structure
        </h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          Under the national portal guidelines, central financial assistance is distributed via Direct Benefit Transfer (DBT) directly into the homeowner&apos;s verified bank account upon system commissioning and meter inspection:
        </p>

        <div className="overflow-x-auto my-6">
          <table className="w-full text-left border-collapse border border-outline-variant text-sm">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="p-3 border border-outline-variant font-semibold">Rooftop Solar Capacity</th>
                <th className="p-3 border border-outline-variant font-semibold">Subsidy Calculation</th>
                <th className="p-3 border border-outline-variant font-semibold">Maximum Cap</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-outline-variant">Up to 1 kWp</td>
                <td className="p-3 border border-outline-variant">₹30,000 per kW</td>
                <td className="p-3 border border-outline-variant font-semibold text-emerald-600">₹30,000</td>
              </tr>
              <tr className="bg-surface-container-low">
                <td className="p-3 border border-outline-variant">2 kWp</td>
                <td className="p-3 border border-outline-variant">₹30,000 per kW for first 2 kW</td>
                <td className="p-3 border border-outline-variant font-semibold text-emerald-600">₹60,000</td>
              </tr>
              <tr>
                <td className="p-3 border border-outline-variant">3 kWp and above</td>
                <td className="p-3 border border-outline-variant">₹60,000 + ₹18,000 for the 3rd kW</td>
                <td className="p-3 border border-outline-variant font-semibold text-emerald-600">₹78,000 (Maximum Cap)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          2. Required Documentation Checklist
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant mb-6">
          <li>Recent electricity bill with clear Consumer Account Number (CA Number) matching your DISCOM portal.</li>
          <li>Aadhaar card of the electricity connection holder.</li>
          <li>Cancelled bank cheque or bank passbook copy for Direct Benefit Transfer (DBT).</li>
          <li>Proof of roof ownership or legal residence.</li>
          <li>Site photograph and installer geo-tagged installation selfie after completion.</li>
        </ul>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          3. Sizing Your System for Zero Electric Bills
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          For an average urban home with a monthly bill between ₹3,500 and ₹5,000, an <strong>optimal 3.3 kWp to 4 kWp system</strong> typically offsets 95% of grid consumption, generating approximately 400 to 480 units per month. With the full ₹78,000 subsidy applied, the typical net capital recovery occurs within 3.2 to 3.8 years.
        </p>
      </>
    ),
  },
  'how-to-compare-solar-quotes-red-flags': {
    title: 'How to Compare Rooftop Solar Quotes: 5 Red Flags Installers Won’t Tell You',
    category: 'Consumer Guides',
    date: 'Sep 28, 2026',
    readTime: '8 min read',
    author: 'RoofToGrid Research Team',
    content: (
      <>
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          When going solar in India, getting 3 installer quotes is the smart first step. But comparing them on total price alone often leads to expensive mistakes. Here are the 5 critical red flags our engineers screen for:
        </p>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          Red Flag #1: Unbranded or Tier-3 Inverter Quoted
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          While solar panels often come with 25-year performance warranties, the inverter is the electrical heart of the system that experiences the highest thermal stress. Installers frequently cut costs by quoting lesser-known inverters with high harmonic distortion and poor Indian grid surge protection.
        </p>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          Red Flag #2: Missing AC/DC Distribution Box &amp; SPD Protection
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          A compliant installation must include Class-II Surge Protection Devices (SPDs) and dual earthing pits (chemical earthing with copper-bonded rods). Low-cost vendor quotes often exclude these mandatory safety items, creating dangerous fire and lightning hazards.
        </p>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          Red Flag #3: Omission of DISCOM Net-Metering Fees
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          Some installers quote only hardware, omitting the bi-directional meter fee, DISCOM inspection charges, and liaison costs — hitting you with unexpected ₹15,000 to ₹25,000 bills right before grid commissioning.
        </p>
      </>
    ),
  },
  'topcon-vs-mono-perc-solar-panels-india': {
    title: 'TOPCon vs Mono PERC Solar Panels: Which Is Better for Indian Weather Conditions?',
    category: 'Equipment & Tech',
    date: 'Sep 20, 2026',
    readTime: '5 min read',
    author: 'Technical Review Team',
    content: (
      <>
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          Tunnel Oxide Passivated Contact (TOPCon) technology has rapidly become the new benchmark in Indian residential solar, replacing traditional p-type Mono PERC modules. Here is why temperature coefficient matters so heavily in our climate.
        </p>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          Superior Temperature Coefficient in High Heat
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          When ambient temperatures reach 42°C in Indian summers, rooftop panel temperatures can easily climb above 65°C. TOPCon cells have a temperature coefficient of -0.30%/°C compared to -0.35%/°C for Mono PERC, delivering up to 3-5% more daily energy during peak summer heatwaves.
        </p>

        <h2 className="text-2xl font-bold font-jakarta text-on-surface mt-8 mb-4">
          Bifacial Factor and Diffuse Light Yield
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          TOPCon modules feature a higher bifaciality factor (up to 80-85% vs 70% for PERC), capturing more reflected irradiance from light-colored roof tiles and generating significantly more power during monsoon cloud cover.
        </p>
      </>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(ARTICLE_CONTENT).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Metadata {
  // Synchronous resolution in static export
  return {
    title: 'Solar Guide — RoofToGrid',
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLE_CONTENT[slug];

  if (!article) {
    notFound();
  }

  return (
    <>
      <LandingNav />
      <main className="min-h-screen bg-surface pt-28 pb-20 px-4 md:px-16 text-on-surface">
        <article className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6 font-medium">
            <Link href="/" className="hover:text-on-surface">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-on-surface">Guides</Link>
            <span>/</span>
            <span className="text-on-surface truncate">{article.category}</span>
          </div>

          {/* Title Header */}
          <span className="text-xs px-3 py-1 rounded-full bg-surface-container-high font-medium text-on-surface inline-block mb-4">
            {article.category}
          </span>
          <h1 className="text-headline-lg md:text-display-md font-bold tracking-tight text-on-surface font-jakarta mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-on-surface-variant border-b border-outline-variant pb-6 mb-8">
            <span className="font-semibold text-on-surface">{article.author}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>

          {/* Article Body */}
          <div className="space-y-6 text-on-surface font-sans text-base">
            {article.content}
          </div>

          {/* Next Steps CTA */}
          <div className="mt-12 rounded-2xl bg-surface-container border border-outline-variant p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-on-surface font-jakarta">
                Calculate your exact PM Surya Ghar savings
              </h4>
              <p className="text-xs text-on-surface-variant mt-1">
                Enter your monthly electricity bill for an instant, data-backed feasibility report.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary-container text-surface px-6 py-3 text-xs font-semibold hover:bg-surface-tint whitespace-nowrap transition-colors"
            >
              Start Free Plan &rarr;
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant/60 flex justify-between items-center text-xs">
            <Link href="/blog" className="font-semibold text-on-surface hover:text-primary-container">
              &larr; Back to all guides
            </Link>
            <Link href="/quotes/compare" className="text-on-surface-variant hover:text-on-surface">
              Compare quotes prototype &rarr;
            </Link>
          </div>
        </article>
      </main>
      <LandingFooter />
    </>
  );
}
