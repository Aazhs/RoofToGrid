'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuoteForm, quoteFormToPayload, type QuoteFormValues } from '@/components/domain/QuoteForm';
import { useToast } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import { useSubmit } from '@/lib/hooks';

export default function NewQuotePage() {
  const router = useRouter();
  const { notify } = useToast();
  const { pending, error, fieldErrors, run } = useSubmit();

  const submit = async (values: QuoteFormValues) => {
    const created = await run(() => api.quotes.create(quoteFormToPayload(values)));
    if (created) {
      notify(`Saved ${created.installerName} — score ${created.valueScore.toFixed(1)}`);
      router.push(`/quotes/${created.id}`);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href="/quotes" className="text-sm font-medium text-brand-700 hover:underline">
          ← All quotes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Add a quote</h1>
        <p className="mt-1 text-sm text-slate-600">
          Copy the numbers from the installer&apos;s document. Anything the quote does not state, leave blank —
          a blank is information too, and we score transparency.
        </p>
      </div>

      <QuoteForm pending={pending} error={error} fieldErrors={fieldErrors} onSubmit={submit} onCancel={() => router.push('/quotes')} />
    </div>
  );
}
