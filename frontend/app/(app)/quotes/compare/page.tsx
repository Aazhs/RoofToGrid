'use client';

/** Side-by-side comparison (US-B2 … US-B7, AC-B5) with Pro PDF export. */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert, EmptyState, Spinner, useToast } from '@/components/ui/Feedback';
import { ComparisonTable } from '@/components/domain/ComparisonTable';
import { UpiCheckoutModal } from '@/components/billing/UpiCheckoutModal';
import { useSubscription } from '@/lib/subscription';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';

export default function ComparePage() {
  const router = useRouter();
  const { notify } = useToast();
  const { isPro } = useSubscription();
  const comparison = useApi(() => api.quotes.comparison());
  const [busyQuoteId, setBusyQuoteId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const select = async (quoteId: string) => {
    await api.quotes.select(quoteId);
    notify('Marked as your chosen quote');
    await comparison.reload();
  };

  const createProject = async (quoteId: string) => {
    setBusyQuoteId(quoteId);
    try {
      const project = await api.projects.fromQuote(quoteId);
      notify('Project created with milestones');
      router.push(`/projects/${project.id}`);
    } catch {
      notify('Could not create the project. Please try again.', 'error');
    } finally {
      setBusyQuoteId(null);
    }
  };

  const handleExportPdf = () => {
    if (!isPro) {
      setCheckoutOpen(true);
      return;
    }
    window.print();
  };

  if (comparison.loading) return <Spinner label="Normalising your quotes" />;
  if (comparison.error) return <Alert tone="error">{comparison.error}</Alert>;
  if (!comparison.data) return null;

  const data = comparison.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/quotes" className="text-sm font-medium text-brand-700 hover:underline">
            ← All quotes
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Compare quotes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Every metric is per kWp or per year, so quotes for different system sizes stay comparable. Green
            cells are the best value in that row.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.rows.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPdf}
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Comparison PDF</span>
              {!isPro && <Badge tone="brand">Pro</Badge>}
            </Button>
          )}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              '⚡ Check out my rooftop solar quote comparison on RoofToGrid! We normalized all quotes to ₹/kWp and screened warranties: https://rooftogrid.in/quotes/compare'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <svg className="h-3.5 w-3.5 fill-emerald-600" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>WhatsApp</span>
          </a>
          <ButtonLink href="/quotes/new" variant="secondary" size="sm">
            Add another quote
          </ButtonLink>
        </div>
      </div>

      {data.rows.length === 0 ? (
        <EmptyState
          title="Nothing to compare yet"
          description="Add at least two quotes and this page will line them up metric by metric."
          action={<ButtonLink href="/quotes/new">Add a quote</ButtonLink>}
        />
      ) : (
        <>
          <Alert tone={data.context.source === 'BILLS' ? 'info' : 'warning'}>{data.context.note}</Alert>

          <ComparisonTable
            comparison={data}
            onSelect={(quoteId) => void select(quoteId)}
            onCreateProject={(quoteId) => void createProject(quoteId)}
            busyQuoteId={busyQuoteId}
          />

          <Card>
            <CardBody className="space-y-2">
              <h2 className="text-base font-semibold">How the value score works</h2>
              <p className="text-sm text-slate-700">{data.scoring.explanation}</p>
              <p className="text-xs text-slate-500">
                Savings assume ₹{data.context.tariffPerKwh}/unit and{' '}
                {data.context.annualConsumptionKwh.toLocaleString('en-IN')} units a year of consumption.
              </p>
              <div>
                <Button variant="ghost" size="sm" className="px-0" onClick={() => void comparison.reload()}>
                  Refresh with my latest bills
                </Button>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      <UpiCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
