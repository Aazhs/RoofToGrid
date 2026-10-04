'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuoteForm, quoteFormToPayload, EMPTY_QUOTE, type QuoteFormValues } from '@/components/domain/QuoteForm';
import { AiQuoteParser } from '@/components/domain/AiQuoteParser';
import { useToast } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import { useSubmit } from '@/lib/hooks';

export default function NewQuotePage() {
  const router = useRouter();
  const { notify } = useToast();
  const { pending, error, fieldErrors, run } = useSubmit();
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [initialFormValues, setInitialFormValues] = useState<QuoteFormValues>(EMPTY_QUOTE);

  const submit = async (values: QuoteFormValues) => {
    const created = await run(() => api.quotes.create(quoteFormToPayload(values)));
    if (created) {
      notify(`Saved ${created.installerName} — score ${created.valueScore.toFixed(1)}`);
      router.push(`/quotes/${created.id}`);
    }
  };

  const handleAiPopulate = (extracted: Partial<QuoteFormValues>) => {
    setInitialFormValues((prev) => ({
      ...prev,
      ...extracted,
    }));
    setActiveTab('manual');
    notify('Quote data transferred! Review and click Save Quote below.');
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href="/quotes" className="text-sm font-medium text-brand-700 hover:underline">
          ← All quotes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Add a quote</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload an installer&apos;s proposal for AI parsing or copy the numbers into the manual form.
          Anything the quote does not state, leave blank — transparency is scored.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === 'ai'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          <span>🤖</span>
          <span>AI Quote Parser & Extractor</span>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
            Recommended
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === 'manual'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          <span>✍️</span>
          <span>Manual Entry Form</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'ai' ? (
        <AiQuoteParser onConfirmAndPopulate={handleAiPopulate} />
      ) : (
        <QuoteForm
          key={JSON.stringify(initialFormValues.installerName)}
          initial={initialFormValues}
          pending={pending}
          error={error}
          fieldErrors={fieldErrors}
          onSubmit={submit}
          onCancel={() => router.push('/quotes')}
        />
      )}
    </div>
  );
}
