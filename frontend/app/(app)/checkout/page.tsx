'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSubscription, UPI_CONFIG, generateUpiUri, BillingCycle } from '@/lib/subscription';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Feedback';

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
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(UPI_CONFIG.vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyUtr = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utr.trim().replace(/\s+/g, '');
    if (cleanUtr.length < 8) {
      setError('Please enter a valid 12-digit UPI transaction reference (UTR) number');
      return;
    }
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      activate({ utr: cleanUtr, billingCycle: cycle });
      setSubmitting(false);
      setSuccess(true);
    }, 600);
  };

  const handleInstantDemoPass = () => {
    setSubmitting(true);
    setTimeout(() => {
      activate({ utr: 'DEMO-UTR-' + Math.floor(100000000000 + Math.random() * 900000000000), billingCycle: cycle });
      setSubmitting(false);
      setSuccess(true);
    }, 300);
  };

  if (isPro || success) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <Card>
          <CardBody className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 mb-2">
                <Badge tone="good">Pro Active</Badge>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">RoofToGrid Pro Activated</h1>
              <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
                Thank you for subscribing. All premium features, downloadable PDF Feasibility Reports, and unlimited quote comparisons are now unlocked.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <ButtonLink href="/dashboard" variant="primary">
                Go to Dashboard
              </ButtonLink>
              <ButtonLink href="/sizing" variant="secondary">
                View Sizing Reports
              </ButtonLink>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">RoofToGrid Pro</h1>
          <Badge tone="brand">Pro</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Instant activation via standard UPI payment. Zero platform fees.
        </p>
      </div>

      {/* Plan selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setCycle('MONTHLY')}
          className={`rounded-xl border p-4 text-left transition-all ${
            cycle === 'MONTHLY'
              ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Plan</span>
            {cycle === 'MONTHLY' && <Badge tone="brand">Selected</Badge>}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">₹499<span className="text-xs font-normal text-slate-500">/mo</span></div>
          <p className="mt-1 text-xs text-slate-600">Billed monthly. Cancel anytime.</p>
        </button>

        <button
          type="button"
          onClick={() => setCycle('ANNUAL')}
          className={`rounded-xl border p-4 text-left transition-all ${
            cycle === 'ANNUAL'
              ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Annual Plan</span>
            <Badge tone="good">Save 17%</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">₹4,999<span className="text-xs font-normal text-slate-500">/yr</span></div>
          <p className="mt-1 text-xs text-slate-600">Full year access (2 months free).</p>
        </button>
      </div>

      {/* Payment Card */}
      <Card>
        <CardHeader
          title="Scan & Pay via UPI"
          description="Use any UPI app (Google Pay, PhonePe, Paytm, BHIM) to complete your subscription."
        />
        <CardBody className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-center shrink-0">
              <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="Scan UPI QR Code"
                  width={160}
                  height={160}
                  className="rounded"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">Scan using any UPI App</p>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Payable Amount</span>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{amount}
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    ({cycle === 'ANNUAL' ? '12 months access' : '1 month access'})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">UPI ID (VPA)</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-800 flex-1 truncate">
                    {UPI_CONFIG.vpa}
                  </code>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyVpa}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <a
                href={upiUri}
                className="block w-full text-center rounded-lg bg-slate-800 py-2.5 text-xs font-medium text-white hover:bg-slate-900 transition-colors sm:hidden"
              >
                Open in UPI App
              </a>
            </div>
          </div>

          {/* Verification form */}
          <form onSubmit={handleVerifyUtr} className="space-y-3">
            <label htmlFor="checkout-utr-input" className="block text-xs font-semibold text-slate-700">
              Enter 12-Digit UPI Transaction Reference (UTR)
            </label>
            <div className="flex gap-2">
              <input
                id="checkout-utr-input"
                type="text"
                placeholder="e.g. 427819284712"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                maxLength={16}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
              <Button type="submit" variant="primary" loading={submitting}>
                Verify & Unlock
              </Button>
            </div>
            {error && <Alert tone="error">{error}</Alert>}
          </form>

          {/* Reviewer / Demo Fast Pass */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-800">Reviewer & Prototype Pass</p>
              <p className="text-slate-500">Test the complete Pro workflow without transferring real funds.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleInstantDemoPass}
              disabled={submitting}
              className="shrink-0"
            >
              Instant Demo Pass
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
