'use client';

/** Quote detail: score breakdown, red flags, edit form, attached documents, start-a-project action. */
import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/Card';
import { Alert, Spinner, useToast } from '@/components/ui/Feedback';
import { DocumentUploader, DocumentList } from '@/components/domain/DocumentPanel';
import { QuoteForm, quoteFormToPayload, quoteToFormValues, type QuoteFormValues } from '@/components/domain/QuoteForm';
import { TIER_COPY } from '@/lib/constants';
import { formatCurrency, formatCurrencyShort, formatKwh, formatKwp, formatYears } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi, useSubmit } from '@/lib/hooks';

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { notify } = useToast();
  const quote = useApi(() => api.quotes.get(id), [id]);
  const documents = useApi(() => api.documents.list({ quoteId: id }), [id]);
  const { pending, error, fieldErrors, run } = useSubmit();
  const [editing, setEditing] = useState(false);

  if (quote.loading) return <Spinner label="Loading quote" />;
  if (quote.error) return <Alert tone="error">{quote.error}</Alert>;
  if (!quote.data) return null;

  const data = quote.data;
  const breakdown = data.scoreBreakdown;

  const save = async (values: QuoteFormValues) => {
    const updated = await run(() => api.quotes.update(id, quoteFormToPayload(values)));
    if (updated) {
      notify('Quote updated and rescored');
      setEditing(false);
      await quote.reload();
    }
  };

  const startProject = async () => {
    const project = await run(() => api.projects.fromQuote(id));
    if (project) {
      notify('Project created with milestones');
      router.push(`/projects/${project.id}`);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href="/quotes" className="text-sm font-medium text-brand-700 hover:underline">
          ← All quotes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{data.installerName}</h1>
          {data.isSelected && <Badge tone="good">Chosen</Badge>}
          <Badge tone="brand">Value score {data.valueScore.toFixed(1)}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {formatKwp(data.systemSizeKwp)} for {formatCurrencyShort(data.totalPrice)} ·{' '}
          {formatCurrency(data.pricePerKwp)} per kWp · {TIER_COPY[data.equipmentTier]} equipment
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {editing ? (
        <QuoteForm
          initial={quoteToFormValues(data)}
          pending={pending}
          fieldErrors={fieldErrors}
          submitLabel="Save changes"
          onSubmit={save}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Savings a year" value={formatCurrency(data.estimatedAnnualSavings)} />
            <Stat label="Payback" value={formatYears(data.paybackYears)} />
            <Stat
              label="Generation a year"
              value={formatKwh(data.expectedAnnualGenerationKwh)}
              hint={data.generationSource === 'INSTALLER' ? 'Installer figure' : 'Our estimate'}
            />
            <Stat
              label={data.financingType === 'CASH' ? 'Total cost' : 'Real cost with finance'}
              value={formatCurrencyShort(data.financedTotalCost)}
              hint={data.monthlyPayment ? `${formatCurrency(data.monthlyPayment)} a month` : undefined}
            />
          </dl>

          <Card>
            <CardHeader
              title="How this score was built"
              description="Weights: price 40, equipment 25, warranty 25, transparency 10."
            />
            <CardBody className="space-y-3">
              {(
                [
                  ['Price per kWp', breakdown.price, breakdown.weights.price],
                  ['Equipment tier', breakdown.equipment, breakdown.weights.equipment],
                  ['Warranty cover', breakdown.warranty, breakdown.weights.warranty],
                  ['Scope & financing transparency', breakdown.transparency, breakdown.weights.transparency],
                ] as Array<[string, number, number]>
              ).map(([label, value, weight]) => (
                <div key={label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-slate-700">
                      {label} <span className="text-slate-400">({Math.round(weight * 100)}%)</span>
                    </span>
                    <span className="font-medium text-slate-900">{value.toFixed(1)} / 100</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-brand-600" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-500">
                A price below the realistic floor is capped rather than rewarded, so the cheapest quote never
                wins automatically.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Questions to ask this installer" />
            <CardBody>
              {data.redFlags.length === 0 ? (
                <Alert tone="success">Nothing stands out on the numbers you entered.</Alert>
              ) : (
                <ul className="space-y-2 text-sm text-slate-700">
                  {data.redFlags.map((flag) => (
                    <li key={flag} className="flex gap-2">
                      <span aria-hidden="true" className="text-amber-600">
                        ▲
                      </span>
                      {flag}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {data.notes && (
            <Card>
              <CardHeader title="Your notes" level={3} />
              <CardBody>
                <p className="whitespace-pre-line text-sm text-slate-700">{data.notes}</p>
              </CardBody>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setEditing(true)} variant="secondary">
              Edit quote
            </Button>
            <Button loading={pending} onClick={() => void startProject()}>
              Choose this and start a project
            </Button>
          </div>
        </>
      )}

      <Card>
        <CardHeader title="Quote document" description="Attach the PDF or photo of this quote." level={3} />
        <CardBody className="space-y-4">
          <DocumentUploader
            defaultCategory="QUOTE"
            quoteId={id}
            compact
            onUploaded={() => {
              notify('Document attached to this quote');
              void documents.reload();
            }}
          />
          <DocumentList
            documents={documents.data ?? []}
            emptyMessage="No document attached yet."
            onDeleted={() => void documents.reload()}
          />
        </CardBody>
      </Card>
    </div>
  );
}
