'use client';

/** Sizing runs: start a new one from saved bills + roof, or revisit a saved run (US-A10, AC-A15). */
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SelectField, TextField } from '@/components/ui/Field';
import { Alert, EmptyState, Spinner, useToast } from '@/components/ui/Feedback';
import { SUITABILITY_COPY } from '@/lib/constants';
import { formatCurrency, formatDate, formatKwp, formatNumber, formatYears } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi, useSubmit } from '@/lib/hooks';

export default function SizingPage() {
  const { notify } = useToast();
  const runs = useApi(() => api.sizing.listRuns());
  const roofs = useApi(() => api.roof.list());
  const stats = useApi(() => api.bills.stats());
  const { pending, error, run: submit } = useSubmit();

  const [roofProfileId, setRoofProfileId] = useState('');
  const [overrides, setOverrides] = useState({ avgMonthlyUnits: '', tariffPerKwh: '' });

  const ready = (stats.data?.monthsCounted ?? 0) > 0 && (roofs.data?.length ?? 0) > 0;
  const selectedRoof = roofs.data?.find((r) => r.id === roofProfileId) ?? roofs.data?.[0];

  const startRun = async () => {
    if (!selectedRoof || !stats.data) return;
    const created = await submit(() =>
      api.sizing.createRun({
        avgMonthlyUnits: Number(overrides.avgMonthlyUnits || stats.data!.avgMonthlyUnits),
        tariffPerKwh: Number(overrides.tariffPerKwh || stats.data!.weightedTariffPerKwh),
        roofProfileId: selectedRoof.id,
      }),
    );
    if (created) {
      notify('Sizing run saved');
      await runs.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sizing and savings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Estimates use your saved bills and roof. Every run keeps a snapshot of the assumptions behind it.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Run a new estimate"
          description={
            ready
              ? 'Pre-filled from your last 12 months of bills. Override if this year looks different.'
              : 'Add at least one bill and one roof first.'
          }
        />
        <CardBody className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          {!ready ? (
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/bills" variant="secondary">
                Add bills
              </ButtonLink>
              <ButtonLink href="/roof" variant="secondary">
                Describe your roof
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                id="roofProfileId"
                label="Roof"
                options={(roofs.data ?? []).map((roof) => ({
                  value: roof.id,
                  label: `${roof.label} — ${formatKwp(roof.estimatedCapacityKwp)} capacity`,
                }))}
                value={selectedRoof?.id ?? ''}
                onChange={(e) => setRoofProfileId(e.target.value)}
              />
              <TextField
                id="avgMonthlyUnits"
                label="Average monthly units"
                type="number"
                min={1}
                value={overrides.avgMonthlyUnits}
                placeholder={String(formatNumber(stats.data?.avgMonthlyUnits ?? 0, 0))}
                hint={`From your bills: ${formatNumber(stats.data?.avgMonthlyUnits ?? 0, 0)} kWh`}
                onChange={(e) => setOverrides({ ...overrides, avgMonthlyUnits: e.target.value })}
              />
              <TextField
                id="tariffPerKwh"
                label="Tariff (₹/unit)"
                type="number"
                min={0.5}
                step={0.1}
                value={overrides.tariffPerKwh}
                placeholder={String(stats.data?.weightedTariffPerKwh ?? '')}
                hint={`From your bills: ₹${stats.data?.weightedTariffPerKwh ?? '—'}/unit`}
                onChange={(e) => setOverrides({ ...overrides, tariffPerKwh: e.target.value })}
              />
              <div className="sm:col-span-3">
                <Button loading={pending} onClick={() => void startRun()}>
                  Run and save
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Saved runs" />
        <CardBody>
          {runs.loading ? (
            <Spinner />
          ) : runs.data && runs.data.length > 0 ? (
            <ul className="space-y-3">
              {runs.data.map((item) => {
                const optimal = item.scenarios.find((s) => s.key === 'OPTIMAL') ?? item.scenarios.at(-1);
                const copy = SUITABILITY_COPY[item.suitability];
                return (
                  <li key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link href={`/sizing/${item.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {formatDate(item.createdAt)} · {formatNumber(item.avgMonthlyUnits, 0)} units at ₹
                        {item.tariffPerKwh}/unit
                      </Link>
                      <Badge tone={copy.tone === 'good' ? 'good' : copy.tone === 'warn' ? 'warn' : 'bad'}>
                        {copy.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.scenarios.length} option{item.scenarios.length === 1 ? '' : 's'}
                      {optimal
                        ? ` · recommended ${formatKwp(optimal.systemSizeKwp)} saving ${formatCurrency(
                            optimal.annualSavings,
                          )} a year, payback ${formatYears(optimal.paybackYears)}`
                        : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No runs saved yet"
              description="Run an estimate above and we will keep it here with the assumptions used."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
