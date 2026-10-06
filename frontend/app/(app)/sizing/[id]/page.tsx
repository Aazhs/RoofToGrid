'use client';

/** One saved sizing run: scenarios, assumptions snapshot, and the jump into quote comparison. */
import { use } from 'react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert, Spinner } from '@/components/ui/Feedback';
import { SizingResultView } from '@/components/domain/SizingResultView';
import { SolarFinancingCalculator } from '@/components/domain/SolarFinancingCalculator';
import { formatDate, formatKwp, formatNumber } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';

export default function SizingRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading } = useApi(() => api.sizing.getRun(id), [id]);

  if (loading) return <Spinner label="Loading your estimate" />;
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return null;

  return (
    <div className="space-y-5">
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

      <SizingResultView
        suitability={data.suitability}
        suitabilityReasons={data.suitabilityReasons}
        roofCapacityKwp={data.roofCapacityKwp}
        scenarios={data.scenarios}
        assumptions={data.assumptions}
      />

      <SolarFinancingCalculator scenarios={data.scenarios} />

      <Card className="border-brand-200 bg-brand-50">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-900">
            Ask two or three installers to quote for the size you like, then add each quote here. We will
            normalise price per kWp, equipment tier, warranties and financing.
          </p>
          <ButtonLink href="/quotes/new">Add a quote</ButtonLink>
        </CardBody>
      </Card>
    </div>
  );
}
