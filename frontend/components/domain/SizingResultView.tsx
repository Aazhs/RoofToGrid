/** Suitability verdict + scenario cards + assumptions (AC-A8 … AC-A14). Reused by landing, wizard, sizing. */
import { AssumptionsPanel } from '@/components/domain/AssumptionsPanel';
import { Term } from '@/components/domain/Term';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { SUITABILITY_COPY } from '@/lib/constants';
import {
  formatCurrency,
  formatCurrencyShort,
  formatKwh,
  formatKwp,
  formatNumber,
  formatYears,
} from '@/lib/format';
import type { Assumptions, Scenario, Suitability } from '@/lib/types';

export function ScenarioCard({
  scenario,
  highlight = false,
  action,
}: {
  scenario: Scenario;
  highlight?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <Card
      as="li"
      className={highlight ? 'border-brand-300 ring-1 ring-brand-200' : ''}
    >
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {scenario.key === 'MAX_ROOF' ? 'Max roof' : scenario.key === 'OPTIMAL' ? 'Optimal' : 'Conservative'}
            </p>
            <p className="mt-0.5 text-2xl font-semibold text-slate-900">{formatKwp(scenario.systemSizeKwp)}</p>
          </div>
          {highlight && <Badge tone="brand">Recommended</Badge>}
        </div>

        <p className="mt-2 text-sm text-slate-600">{scenario.notes}</p>

        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Yearly generation" value={formatKwh(scenario.annualGenerationKwh)} />
          <Row label="Covers your usage" value={`${formatNumber(scenario.offsetPercent)}%`} />
          <Row label="System cost" value={formatCurrencyShort(scenario.estimatedCost)} />
          <Row label="Subsidy" value={scenario.subsidyAmount > 0 ? `− ${formatCurrencyShort(scenario.subsidyAmount)}` : 'Not eligible'} />
          <Row label="You pay" value={formatCurrencyShort(scenario.netCost)} strong />
          <Row label="Yearly savings" value={formatCurrency(scenario.annualSavings)} />
          <Row label="Payback" value={formatYears(scenario.paybackYears)} />
          <Row label="25-year savings" value={formatCurrencyShort(scenario.lifetimeSavings25y)} />
          <Row label="Roof needed" value={`${formatNumber(scenario.roofAreaRequiredSqft)} sqft`} />
          <Row label="CO₂ avoided" value={`${scenario.co2OffsetTonnesPerYear} t a year`} />
        </dl>

        {action && <div className="mt-4">{action}</div>}
      </CardBody>
    </Card>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-600">{label}</dt>
      <dd className={strong ? 'font-semibold text-slate-900' : 'text-slate-900'}>{value}</dd>
    </div>
  );
}

export function SuitabilityVerdict({
  suitability,
  reasons,
  roofCapacityKwp,
}: {
  suitability: Suitability;
  reasons: string[];
  roofCapacityKwp: number;
}) {
  const copy = SUITABILITY_COPY[suitability];
  const tone = copy.tone === 'good' ? 'good' : copy.tone === 'warn' ? 'warn' : 'bad';

  return (
    <Card>
      <CardBody>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={tone}>{copy.label}</Badge>
          <p className="text-sm text-slate-600">
            Roof can hold about <strong className="text-slate-900">{formatKwp(roofCapacityKwp)}</strong> of{' '}
            <Term term="kWp">panels</Term>.
          </p>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span aria-hidden="true" className="mt-1 text-brand-600">
                •
              </span>
              {reason}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function SizingResultView({
  suitability,
  suitabilityReasons,
  roofCapacityKwp,
  scenarios,
  assumptions,
  scenarioAction,
}: {
  suitability: Suitability;
  suitabilityReasons: string[];
  roofCapacityKwp: number;
  scenarios: Scenario[];
  assumptions: Assumptions;
  scenarioAction?: (scenario: Scenario) => React.ReactNode;
}) {
  const recommended = scenarios.find((s) => s.key === 'OPTIMAL') ?? scenarios[0];

  return (
    <div className="space-y-4">
      <SuitabilityVerdict
        suitability={suitability}
        reasons={suitabilityReasons}
        roofCapacityKwp={roofCapacityKwp}
      />

      {scenarios.length === 0 ? (
        <Alert tone="warning" title="We are not going to recommend a system for this roof">
          Fix the blocker above and run the numbers again. Heavy shade or a very small usable area means the
          savings will not justify the spend, and we would rather say so than sell you something.
        </Alert>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.key}
              scenario={scenario}
              highlight={scenario.key === recommended?.key}
              action={scenarioAction?.(scenario)}
            />
          ))}
        </ul>
      )}

      <AssumptionsPanel assumptions={assumptions} />
    </div>
  );
}
