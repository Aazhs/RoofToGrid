/**
 * Assumptions disclosure shown on every estimate screen (NFR-U4, AC-A14).
 * Collapsed by default so it does not crowd the numbers, but always present.
 */
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Assumptions } from '@/lib/types';

export function AssumptionsPanel({ assumptions }: { assumptions: Assumptions }) {
  const rows: Array<[string, string]> = [
    ['Assumption set', `${assumptions.label} (${assumptions.assumptionSetId})`],
    ['Specific yield', `${formatNumber(assumptions.specificYieldKwhPerKwp)} kWh per kWp per year`],
    [
      'Roof area per kWp',
      `Flat ${assumptions.areaPerKwpSqft.FLAT} sqft · Sloped ${assumptions.areaPerKwpSqft.SLOPED} sqft · Mixed ${assumptions.areaPerKwpSqft.MIXED} sqft`,
    ],
    [
      'Shading derate',
      `None ${assumptions.shadingDerate.NONE} · Light ${assumptions.shadingDerate.LIGHT} · Moderate ${assumptions.shadingDerate.MODERATE} · Heavy ${assumptions.shadingDerate.HEAVY}`,
    ],
    [
      'System cost bands',
      assumptions.costPerKwpBands
        .map((band) =>
          band.maxKwp
            ? `≤${band.maxKwp} kWp ${formatCurrency(band.costPerKwp)}/kWp`
            : `above that ${formatCurrency(band.costPerKwp)}/kWp`,
        )
        .join(' · '),
    ],
    [
      'Subsidy rules',
      `${formatCurrency(assumptions.subsidy.perKwFirst2Kw)}/kW for the first 2 kW, ${formatCurrency(
        assumptions.subsidy.thirdKwAmount,
      )} for the 3rd kW, capped at ${formatCurrency(assumptions.subsidy.capAmount)}`,
    ],
    ['Tariff escalation', `${assumptions.tariffEscalationPct}% a year`],
    ['Panel degradation', `${assumptions.degradationPctPerYear}% a year`],
    ['Self-consumption', `${Math.round(assumptions.selfConsumptionRatio * 100)}% of generation offsets your bill`],
    ['Analysis period', `${assumptions.analysisPeriodYears} years`],
    ['CO₂ factor', `${assumptions.co2KgPerKwh} kg per kWh of grid power`],
  ];

  if (assumptions.yieldEngine) {
    rows.push([
      'Yield model',
      assumptions.yieldEngine.siteSpecific
        ? `${assumptions.yieldEngine.name} (site-specific simulation)`
        : `${assumptions.yieldEngine.name} (published averages, not a site survey)`,
    ]);
  }

  return (
    <details className="rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-800">
        How we calculated this
      </summary>
      <div className="border-t border-slate-200 px-4 py-3">
        <dl className="grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="text-sm text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{assumptions.disclaimer}</p>
      </div>
    </details>
  );
}
