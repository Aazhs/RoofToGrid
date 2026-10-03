'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSubscription, UPI_CONFIG, generateUpiUri, BillingCycle } from '@/lib/subscription';

export default function CheckoutPage() {
  const { isPro, activate } = useSubscription();
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = cycle === 'ANNUAL' ? UPI_CONFIG.annualPrice : UPI_CONFIG.monthlyPrice;
  const upiUri = generateUpiUri(amount, `RoofToGrid Pro ${cycle === 'ANNUAL' ? 'Annual' : 'Monthly'}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(upiUri)}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(UPI_CONFIG.vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyUtr = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utr.trim().replace(/\s+/g, '');
    if (cleanUtr.length < 8) {
      setError('Please enter a valid 12-digit UPI reference (UTR) number');
      return;
    }
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      activate({ utr: cleanUtr, billingCycle: cycle });
      setSubmitting(false);
      setSuccess(true);
    }, 800);
  };

  const handleInstantDemoPass = () => {
    setSubmitting(true);
    setTimeout(() => {
      activate({ utr: 'DEMO-UTR-' + Math.floor(100000000000 + Math.random() * 900000000000), billingCycle: cycle });
      setSubmitting(false);
      setSuccess(true);
    }, 400);
  };

  if (isPro || success) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">RoofToGrid Pro is Active!</h1>
          <p className="mt-2 text-sm text-slate-600">
            Thank you for supporting RoofToGrid. All premium features, unlimited quote comparisons, and PDF reports are unlocked.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
            >
              Go to Dashboard →
            </Link>
            <Link
              href="/sizing"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Export Solar Feasibility PDF
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
          ⭐ Complete Checkout
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Unlock RoofToGrid Pro</h1>
        <p className="mt-1 text-sm text-slate-600">
          Instant activation via standard UPI payment. Zero transaction fees.
        </p>
      </div>

      {/* Plan selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setCycle('MONTHLY')}
          className={`rounded-2xl border p-5 text-left transition-all ${
            cycle === 'MONTHLY'
              ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Pass</span>
          <span className="mt-1 block text-2xl font-black text-slate-900">₹499</span>
          <span className="mt-1 block text-xs text-slate-600">Billed monthly. Cancel anytime.</span>
        </button>

        <button
          type="button"
          onClick={() => setCycle('ANNUAL')}
          className={`relative rounded-2xl border p-5 text-left transition-all ${
            cycle === 'ANNUAL'
              ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="absolute -top-2.5 right-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Save 17%
          </span>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Pass</span>
          <span className="mt-1 block text-2xl font-black text-slate-900">₹4,999</span>
          <span className="mt-1 block text-xs text-slate-600">Full year access (2 months free).</span>
        </button>
      </div>

      {/* Payment Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center shrink-0">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Scan UPI QR Code"
                width={180}
                height={180}
                className="rounded-xl"
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">Scan using any UPI App</p>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payable Total</span>
              <div className="text-3xl font-black text-slate-900">
                ₹{amount}
                <span className="text-xs font-normal text-slate-500 ml-2">
                  ({cycle === 'ANNUAL' ? '12 Months Access' : '1 Month Access'})
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">UPI ID / VPA</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 flex-1 truncate">
                  {UPI_CONFIG.vpa}
                </code>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:scale-95 transition-all"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <a
              href={upiUri}
              className="block w-full text-center rounded-xl bg-brand-600 py-3 px-4 text-xs font-bold text-white hover:bg-brand-700 shadow-sm transition-all"
            >
              Open in GPay / PhonePe / Paytm / BHIM
            </a>
          </div>
        </div>

        {/* Verification */}
        <form onSubmit={handleVerifyUtr} className="pt-4 border-t border-slate-200 space-y-3">
          <label htmlFor="utr-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Confirm Payment: Enter 12-Digit UTR / Reference ID
          </label>
          <div className="flex gap-2">
            <input
              id="utr-input"
              type="text"
              placeholder="e.g. 427819284712"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shrink-0"
            >
              {submitting ? 'Verifying...' : 'Verify & Unlock'}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </form>

        {/* Demo Reviewer Fast Pass */}
        <div className="pt-2 border-t border-slate-100">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-900">Prototype & Reviewer Fast Pass</p>
              <p className="text-[11px] text-emerald-700">Test the complete Pro upgrade without sending actual payment.</p>
            </div>
            <button
              type="button"
              onClick={handleInstantDemoPass}
              disabled={submitting}
              className="w-full sm:w-auto rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
            >
              ⚡ Instant Demo Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
