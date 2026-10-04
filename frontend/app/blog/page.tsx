import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Solar Knowledge Base & Guides — RoofToGrid',
  description:
    'Unbiased guides, subsidy breakdowns, and insider tips to help Indian homeowners navigate rooftop solar installation with total confidence.',
  alternates: {
    canonical: '/blog',
  },
};

export const ARTICLES = [
  {
    slug: 'pm-surya-ghar-subsidy-guide-2026',
    title: 'PM Surya Ghar Muft Bijli Yojana: 2026 Complete Subsidy Guide & Step-by-Step Calculation',
    summary:
      'Learn how the central government provides up to ₹78,000 directly into your bank account under the PM Surya Ghar scheme. Detailed breakdown for 1 kW, 2 kW, and 3+ kW systems.',
    category: 'Subsidies & Policy',
    readTime: '6 min read',
    date: 'Oct 2, 2026',
    author: 'Aarsh Joshi',
  },
  {
    slug: 'how-to-compare-solar-quotes-red-flags',
    title: 'How to Compare Rooftop Solar Quotes: 5 Red Flags Installers Won’t Tell You',
    summary:
      'From bait-and-switch inverter brands to omitted structure costs and inflated generation estimates — here is how to read between the lines of vendor proposals.',
    category: 'Consumer Guides',
    readTime: '8 min read',
    date: 'Sep 28, 2026',
    author: 'RoofToGrid Research Team',
  },
  {
    slug: 'topcon-vs-mono-perc-solar-panels-india',
    title: 'TOPCon vs Mono PERC Solar Panels: Which Is Better for Indian Weather Conditions?',
    summary:
      'Comparing temperature coefficients, bifacial gain, degradation rates, and payback periods across modern crystalline silicon PV technologies in India.',
    category: 'Equipment & Tech',
    readTime: '5 min read',
    date: 'Sep 20, 2026',
    author: 'Technical Review Team',
  },
];

export default function BlogIndexPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen bg-surface pt-28 pb-20 px-4 md:px-16 text-on-surface">
        <div className="max-w-[1280px] mx-auto">
          
          {/* Header */}
          <div className="max-w-3xl mb-14">
            <span className="text-label-sm text-outline uppercase tracking-widest mb-3 block font-jakarta">
              SOLAR EDUCATION &amp; INSIGHTS
            </span>
            <h1 className="text-display-sm md:text-display-md font-bold tracking-tight text-on-surface font-jakarta mb-4">
              Clear answers for your solar transition.
            </h1>
            <p className="text-body-lg text-on-surface-variant font-jakarta leading-relaxed">
              We break down complicated solar regulations, equipment specs, and subsidy rules into actionable, transparent guides for homeowners.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ARTICLES.map((article) => (
              <article
                key={article.slug}
                className="rounded-2xl border border-outline-variant bg-surface-container p-6 flex flex-col justify-between hover:border-primary-container hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high font-medium text-on-surface">
                      {article.category}
                    </span>
                    <span>{article.readTime}</span>
                  </div>

                  <h2 className="text-xl font-bold font-jakarta text-on-surface mb-3 leading-snug hover:text-primary-container transition-colors">
                    <Link href={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{article.date}</span>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="font-semibold text-on-surface hover:text-primary-container inline-flex items-center gap-1"
                  >
                    Read guide &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Quick CTA box */}
          <div className="mt-16 rounded-2xl bg-surface-container-high border border-outline-variant p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold font-jakarta text-on-surface mb-3">
              Ready to see what your roof can produce?
            </h3>
            <p className="text-sm text-on-surface-variant max-w-xl mx-auto mb-6">
              Our automated solar modeling engine calculates your optimal system size, PM Surya Ghar subsidy, and 25-year financial returns in 30 seconds.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-container text-surface px-8 py-3.5 text-sm font-semibold hover:bg-surface-tint transition-all"
            >
              <span>Launch Free Prototype</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

        </div>
      </main>
      <LandingFooter />
    </>
  );
}
