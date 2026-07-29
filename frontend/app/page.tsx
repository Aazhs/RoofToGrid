'use client';

/**
 * Landing page with an inline public calculator (US-A1, AC-A1).
 * No account needed: the estimate is computed server-side and nothing is stored.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { Term } from '@/components/domain/Term';
import { SizingForm, type SizingFormValues } from '@/components/domain/SizingForm';
import { SizingResultView } from '@/components/domain/SizingResultView';
import { api } from '@/lib/api';
import { useSubmit } from '@/lib/hooks';
import type { SizingResult } from '@/lib/types';

const STEPS = [
  {
    title: 'Tell us what you spend',
    body: 'Your monthly units and tariff from any recent bill. No login, no sales call.',
  },
  {
    title: 'See honest options',
    body: 'Two or three system sizes with generation, subsidy, savings and payback — plus every assumption we used.',
  },
  {
    title: 'Compare real quotes',
    body: 'Enter what installers quoted. We normalise price per kWp, equipment tier, warranties and financing.',
  },
  {
    title: 'Track it to the grid',
    body: 'Survey, DISCOM approval, installation, net metering, subsidy — with documents attached to each step.',
  },
];

export default function LandingPage() {
  const [result, setResult] = useState<SizingResult | null>(null);
  const { pending, error, fieldErrors, run } = useSubmit();

  const estimate = async (values: SizingFormValues) => {
    const data = await run(() => api.sizing.estimate(values));
    if (data) {
      setResult(data);
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Roof<span className="text-brand-700">To</span>Grid
          </Link>
          <nav aria-label="Account" className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-700">
              Sign in
            </Link>
            <ButtonLink href="/register" size="sm">
              Create free account
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                India pilot · PM Surya Ghar subsidy included
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                Find out if rooftop solar actually pays off for your home.
              </h1>
              <p className="mt-3 text-base text-slate-700">
                RoofToGrid takes your electricity bill and roof details, then shows two or three system sizes with{' '}
                <Term term="kWh">units</Term> generated, <Term term="subsidy">subsidy</Term>, yearly savings and{' '}
                <Term term="payback">payback</Term>. Then it helps you compare installer quotes on equal terms and
                track the project all the way to <Term term="net metering">net metering</Term>.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✅ Conservative estimates, with every assumption on screen</li>
                <li>✅ Quote comparison that flags what a cheap price is leaving out</li>
                <li>✅ Milestone tracker and a private document vault</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/register" size="lg">
                  Start free
                </ButtonLink>
                <Button variant="secondary" size="lg" onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>
                  Try the calculator
                </Button>
              </div>
            </div>

            <Card id="calculator">
              <CardBody>
                <h2 className="text-lg font-semibold">Rough numbers in 30 seconds</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Nothing is saved and no account is needed. Create one later if you want to keep the results.
                </p>
                <div className="mt-4">
                  {error && (
                    <Alert tone="error" className="mb-3">
                      {error}
                    </Alert>
                  )}
                  <SizingForm pending={pending} fieldErrors={fieldErrors} onSubmit={estimate} />
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {result && (
          <section id="results" className="mx-auto max-w-6xl px-4 pb-12">
            <h2 className="mb-4 text-2xl font-semibold">What your roof could do</h2>
            <SizingResultView
              suitability={result.suitability}
              suitabilityReasons={result.suitabilityReasons}
              roofCapacityKwp={result.roofCapacityKwp}
              scenarios={result.scenarios}
              assumptions={result.assumptions}
            />
            <Card className="mt-4 border-brand-200 bg-brand-50">
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-brand-900">
                  Create a free account to save this, add your bills for accuracy, and compare installer quotes.
                </p>
                <ButtonLink href="/register">Save my results</ButtonLink>
              </CardBody>
            </Card>
          </section>
        )}

        <section className="border-y border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="rounded-xl border border-slate-200 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold">Built for people, not for a sales funnel</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'We show the maths',
                body: 'Specific yield, area per kWp, shading derate, cost bands, subsidy rules and escalation are all disclosed on every estimate screen.',
              },
              {
                title: 'Cheapest does not win by default',
                body: 'A price below the realistic floor is capped in scoring and flagged, because it usually means something is missing from the scope.',
              },
              {
                title: 'Your documents stay yours',
                body: 'Bills, quotes, contracts and approvals live in a private vault. Downloads are checked against your account every time.',
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardBody>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} RoofToGrid. Estimates are indicative, not a site survey.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-brand-700">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-brand-700">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
