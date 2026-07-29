'use client';

/** Quote list (US-B1, US-B8) with score, red flags and the link into the comparison view. */
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Alert, EmptyState, Spinner, useToast } from '@/components/ui/Feedback';
import { TIER_COPY } from '@/lib/constants';
import { formatCurrency, formatCurrencyShort, formatKwp, formatYears } from '@/lib/format';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';

export default function QuotesPage() {
  const { notify } = useToast();
  const quotes = useApi(() => api.quotes.list());

  const select = async (id: string) => {
    await api.quotes.select(id);
    notify('Marked as your chosen quote');
    await quotes.reload();
  };

  const remove = async (id: string) => {
    await api.quotes.remove(id);
    notify('Quote deleted. Any project created from it is untouched.');
    await quotes.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Installer quotes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter what each installer quoted. We normalise them so a bigger system does not look automatically
            worse.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(quotes.data?.length ?? 0) > 1 && (
            <ButtonLink href="/quotes/compare" variant="secondary">
              Compare side by side
            </ButtonLink>
          )}
          <ButtonLink href="/quotes/new">Add a quote</ButtonLink>
        </div>
      </div>

      {quotes.error && <Alert tone="error">{quotes.error}</Alert>}

      {quotes.loading ? (
        <Spinner />
      ) : quotes.data && quotes.data.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {quotes.data.map((quote) => (
            <Card as="li" key={quote.id}>
              <CardHeader
                level={3}
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {quote.installerName}
                    {quote.isSelected && <Badge tone="good">Chosen</Badge>}
                  </span>
                }
                description={`${formatKwp(quote.systemSizeKwp)} · ${formatCurrencyShort(quote.totalPrice)}`}
                actions={<Badge tone="brand">Score {quote.valueScore.toFixed(1)}</Badge>}
              />
              <CardBody className="space-y-3">
                <dl className="space-y-1.5 text-sm">
                  <Row label="Price per kWp" value={formatCurrency(quote.pricePerKwp)} />
                  <Row label="Equipment" value={TIER_COPY[quote.equipmentTier]} />
                  <Row label="Savings a year" value={formatCurrency(quote.estimatedAnnualSavings)} />
                  <Row label="Payback" value={formatYears(quote.paybackYears)} />
                  {quote.financingType !== 'CASH' && (
                    <Row
                      label="Real cost with finance"
                      value={formatCurrencyShort(quote.financedTotalCost)}
                    />
                  )}
                </dl>

                {quote.redFlags.length > 0 ? (
                  <Alert tone="warning" title={`${quote.redFlags.length} thing${quote.redFlags.length === 1 ? '' : 's'} to ask about`}>
                    <ul className="list-disc space-y-1 pl-4 text-xs">
                      {quote.redFlags.slice(0, 3).map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <Alert tone="success">No red flags on the numbers you entered.</Alert>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
                  >
                    View or edit
                  </Link>
                  {!quote.isSelected && (
                    <Button size="sm" variant="secondary" onClick={() => void select(quote.id)}>
                      Mark chosen
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => void remove(quote.id)}>
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No quotes yet"
          description="Add the first quote you received. Two or three makes the comparison genuinely useful."
          action={<ButtonLink href="/quotes/new">Add a quote</ButtonLink>}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
