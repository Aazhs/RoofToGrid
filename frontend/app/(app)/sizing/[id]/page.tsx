'use client';

/** One saved sizing run: scenarios, assumptions snapshot, and the jump into quote comparison. */
import { use, useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert, Spinner } from '@/components/ui/Feedback';
import { SizingResultView } from '@/components/domain/SizingResultView';
import { SolarFeasibilityReportModal } from '@/components/domain/SolarFeasibilityReportModal';
import { formatDate, formatKwp, formatNumber } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { useSubscription } from '@/lib/subscription';

export default function SizingRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading } = useApi(() => api.sizing.getRun(id), [id]);
  const { isPro } = useSubscription();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  if (loading) return <Spinner label="Loading your estimate" />;
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/sizing" className="text-sm font-medium text-brand-700 hover:underline">
            ← All sizing runs
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Your solar options</h1>
          <p className="mt-1 text-sm text-slate-600">
            Run on {formatDate(data.createdAt)} using {formatNumber(data.avgMonthlyUnits, 0)} units a month at ₹
            {data.tariffPerKwh}/unit
            {data.roofProfile ? ` on "${data.roofProfile.label}"` : ''}. Roof capacity{' '}
            {formatKwp(data.roofCapacityKwp)}.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setReportModalOpen(true)}
          className="shrink-0"
        >
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Feasibility Report (PDF)</span>
          {!isPro && <Badge tone="brand">Pro</Badge>}
        </Button>
      </div>

      <SizingResultView
        suitability={data.suitability}
        suitabilityReasons={data.suitabilityReasons}
        roofCapacityKwp={data.roofCapacityKwp}
        scenarios={data.scenarios}
        assumptions={data.assumptions}
      />

      <Card className="border-brand-200 bg-brand-50">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-900">
            Ask two or three installers to quote for the size you like, then add each quote here. We will
            normalise price per kWp, equipment tier, warranties and financing.
          </p>
          <ButtonLink href="/quotes/new">Add a quote</ButtonLink>
        </CardBody>
      </Card>

      {/* PDF Modal */}
      <SolarFeasibilityReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        sizingRun={data}
      />
    </div>
  );
}
