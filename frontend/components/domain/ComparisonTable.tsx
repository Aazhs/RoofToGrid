'use client';

/**
 * Quote comparison (AC-B5). Table on desktop, stacked cards below 768 px (NFR-U1).
 * Best cell per row is flagged from the server's `bestInColumn` map, so the UI never re-derives rankings.
 */
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { TIER_COPY } from '@/lib/constants';
import { formatCurrency, formatCurrencyShort, formatKwh, formatKwp, formatYears } from '@/lib/format';
import type { Comparison, ComparisonRow } from '@/lib/types';

interface MetricRow {
  field: string;
  label: string;
  render: (row: ComparisonRow) => React.ReactNode;
}

const METRICS: MetricRow[] = [
  { field: 'systemSizeKwp', label: 'System size', render: (r) => formatKwp(r.systemSizeKwp) },
  { field: 'totalPrice', label: 'Quoted price', render: (r) => formatCurrencyShort(r.totalPrice) },
  { field: 'pricePerKwp', label: 'Price per kWp', render: (r) => formatCurrency(r.pricePerKwp) },
  {
    field: 'financedTotalCost',
    label: 'Real cost incl. finance',
    render: (r) => formatCurrencyShort(r.financedTotalCost),
  },
  { field: 'equipmentTier', label: 'Equipment tier', render: (r) => TIER_COPY[r.equipmentTier] },
  { field: 'panelSummary', label: 'Panels', render: (r) => r.panelSummary },
  { field: 'inverterSummary', label: 'Inverter', render: (r) => r.inverterSummary },
  {
    field: 'panelProductWarrantyYears',
    label: 'Panel warranty',
    render: (r) => `${r.panelProductWarrantyYears} yrs`,
  },
  { field: 'inverterWarrantyYears', label: 'Inverter warranty', render: (r) => `${r.inverterWarrantyYears} yrs` },
  {
    field: 'workmanshipWarrantyYears',
    label: 'Workmanship warranty',
    render: (r) => `${r.workmanshipWarrantyYears} yrs`,
  },
  {
    field: 'includesNetMetering',
    label: 'Net metering included',
    render: (r) => (r.includesNetMetering ? 'Yes' : 'No'),
  },
  {
    field: 'includesStructure',
    label: 'Structure included',
    render: (r) => (r.includesStructure ? 'Yes' : 'No'),
  },
  {
    field: 'estimatedAnnualGenerationKwh',
    label: 'Generation a year',
    render: (r) => (
      <span>
        {formatKwh(r.estimatedAnnualGenerationKwh)}{' '}
        <Badge tone={r.generationSource === 'INSTALLER' ? 'info' : 'muted'}>
          {r.generationSource === 'INSTALLER' ? 'installer' : 'our estimate'}
        </Badge>
      </span>
    ),
  },
  {
    field: 'estimatedAnnualSavings',
    label: 'Savings a year',
    render: (r) => formatCurrency(r.estimatedAnnualSavings),
  },
  { field: 'paybackYears', label: 'Payback', render: (r) => formatYears(r.paybackYears) },
  {
    field: 'redFlagCount',
    label: 'Red flags',
    render: (r) =>
      r.redFlagCount === 0 ? (
        <Badge tone="good">None</Badge>
      ) : (
        <Badge tone="bad">
          {r.redFlagCount} to check
        </Badge>
      ),
  },
  {
    field: 'valueScore',
    label: 'Value score',
    render: (r) => <span className="font-semibold">{r.valueScore.toFixed(1)}</span>,
  },
];

function isBest(comparison: Comparison, field: string, quoteId: string): boolean {
  const winners = comparison.bestInColumn[field];
  return Array.isArray(winners) && winners.length > 0 && winners.length < comparison.rows.length && winners.includes(quoteId);
}

export function ComparisonTable({
  comparison,
  onSelect,
  onCreateProject,
  busyQuoteId,
}: {
  comparison: Comparison;
  onSelect?: (quoteId: string) => void;
  onCreateProject?: (quoteId: string) => void;
  busyQuoteId?: string | null;
}) {
  const { rows } = comparison;

  return (
    <>
      {/* Desktop: matrix */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption className="sr-only">
            Installer quotes compared on price per kWp, equipment, warranties, savings and payback
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Metric
              </th>
              {rows.map((row) => (
                <th key={row.quoteId} scope="col" className="px-4 py-3 text-left font-semibold text-slate-900">
                  <span className="flex flex-wrap items-center gap-2">
                    {row.installerName}
                    {row.quoteId === comparison.recommendedQuoteId && <Badge tone="brand">Best value</Badge>}
                    {row.isSelected && <Badge tone="good">Selected</Badge>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => (
              <tr key={metric.field} className="border-b border-slate-100 last:border-0">
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-600">
                  {metric.label}
                </th>
                {rows.map((row) => {
                  const best = isBest(comparison, metric.field, row.quoteId);
                  return (
                    <td
                      key={row.quoteId}
                      className={`px-4 py-2.5 ${best ? 'bg-emerald-50 font-medium text-emerald-900' : 'text-slate-800'}`}
                    >
                      {metric.render(row)}
                      {best && <span className="sr-only"> (best in this row)</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium text-slate-600">
                Actions
              </th>
              {rows.map((row) => (
                <td key={row.quoteId} className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/quotes/${row.quoteId}`}
                      className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
                    >
                      Details
                    </Link>
                    {onSelect && !row.isSelected && (
                      <Button size="sm" variant="secondary" onClick={() => onSelect(row.quoteId)}>
                        Mark chosen
                      </Button>
                    )}
                    {onCreateProject && (
                      <Button
                        size="sm"
                        loading={busyQuoteId === row.quoteId}
                        onClick={() => onCreateProject(row.quoteId)}
                      >
                        Start project
                      </Button>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards (NFR-U1) */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <Card as="li" key={row.quoteId}>
            <CardBody>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold">{row.installerName}</h3>
                <div className="flex gap-1">
                  {row.quoteId === comparison.recommendedQuoteId && <Badge tone="brand">Best value</Badge>}
                  {row.isSelected && <Badge tone="good">Selected</Badge>}
                </div>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                {METRICS.map((metric) => (
                  <div key={metric.field} className="flex items-baseline justify-between gap-3">
                    <dt className="text-slate-600">{metric.label}</dt>
                    <dd
                      className={
                        isBest(comparison, metric.field, row.quoteId)
                          ? 'text-right font-semibold text-emerald-800'
                          : 'text-right text-slate-900'
                      }
                    >
                      {metric.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/quotes/${row.quoteId}`}
                  className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
                >
                  Details
                </Link>
                {onSelect && !row.isSelected && (
                  <Button size="sm" variant="secondary" onClick={() => onSelect(row.quoteId)}>
                    Mark chosen
                  </Button>
                )}
                {onCreateProject && (
                  <Button size="sm" loading={busyQuoteId === row.quoteId} onClick={() => onCreateProject(row.quoteId)}>
                    Start project
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </ul>
    </>
  );
}
