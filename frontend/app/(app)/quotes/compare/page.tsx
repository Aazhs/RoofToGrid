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
