/**
 * Actual vs projected generation (AC-D2, AC-D3).
 * Plain SVG bars keep the bundle small; the same data is exposed as a table for screen readers (NFR-U5).
 */
import { HEALTH_COPY } from '@/lib/constants';
import { formatCurrency, formatKwh, formatPercent } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import type { PerformanceMonth } from '@/lib/types';

export function PerformanceChart({ months }: { months: PerformanceMonth[] }) {
  if (months.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        Log a month of generation to see how the system is doing against its projection.
      </p>
    );
  }

  const max = Math.max(...months.flatMap((m) => [m.generatedKwh, m.projectedKwh]), 1);

  return (
    <div>
      <div className="flex items-end gap-4 overflow-x-auto pb-2" aria-hidden="true">
        {months.map((month) => (
          <div key={month.month} className="flex min-w-[3.5rem] flex-col items-center gap-1">
            <div className="flex h-40 items-end gap-1">
              <div
                className="w-5 rounded-t bg-brand-600"
                style={{ height: `${Math.max(2, (month.generatedKwh / max) * 100)}%` }}
                title={`Actual ${month.generatedKwh} kWh`}
              />
              <div
                className="w-5 rounded-t bg-slate-300"
                style={{ height: `${Math.max(2, (month.projectedKwh / max) * 100)}%` }}
                title={`Projected ${month.projectedKwh} kWh`}
              />
            </div>
            <span className="text-[11px] text-slate-600">{month.monthLabel}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-4 text-xs text-slate-600" aria-hidden="true">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-brand-600" /> Actual
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-slate-300" /> Projected
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <caption className="sr-only">Monthly generation, projection, variance and savings</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-600">
              <th scope="col" className="py-2 pr-3 font-medium">
                Month
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Generated
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Projected
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Variance
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Savings
              </th>
              <th scope="col" className="py-2 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => {
              const health = HEALTH_COPY[month.health];
              return (
                <tr key={month.month} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-800">
                    {month.monthLabel}
                  </th>
                  <td className="py-2 pr-3">{formatKwh(month.generatedKwh)}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatKwh(month.projectedKwh)}</td>
                  <td className="py-2 pr-3">{formatPercent(month.variancePercent)}</td>
                  <td className="py-2 pr-3">{formatCurrency(month.savings)}</td>
                  <td className="py-2">
                    <Badge tone={health.tone === 'muted' ? 'muted' : health.tone}>{health.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
