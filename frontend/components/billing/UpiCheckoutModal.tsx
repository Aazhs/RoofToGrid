'use client';

import { useState } from 'react';
import { useSubscription, UPI_CONFIG, generateUpiUri, BillingCycle } from '@/lib/subscription';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Feedback';

interface UpiCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCycle?: BillingCycle;
}

export function UpiCheckoutModal({ isOpen, onClose, defaultCycle = 'MONTHLY' }: UpiCheckoutModalProps) {
  const { activate } = useSubscription();
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }, 600);
  };

  const handleInstantDemoPass = () => {
    setSubmitting(true);
    setTimeout(() => {
      activate({ utr: 'DEMO-UTR-' + Math.floor(100000000000 + Math.random() * 900000000000), billingCycle: cycle });
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {/* Clean Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="checkout-title" className="text-base font-semibold text-slate-900">
                Upgrade to RoofToGrid Pro
              </h2>
              <Badge tone="brand">Pro</Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Direct UPI payment · Instant activation · Cancel anytime
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        {success ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">RoofToGrid Pro Activated</h3>
            <p className="mt-1 text-sm text-slate-600">
              Your Pro features, PDF feasibility report export, and quote comparison tools are now unlocked.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* Plan Switcher */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCycle('MONTHLY')}
                className={`flex-1 rounded-md py-1.5 transition-all ${
                  cycle === 'MONTHLY'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly · ₹499/mo
              </button>
              <button
                type="button"
                onClick={() => setCycle('ANNUAL')}
                className={`flex-1 rounded-md py-1.5 transition-all ${
                  cycle === 'ANNUAL'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual · ₹4,999/yr <span className="text-emerald-700 font-semibold ml-1">(Save 17%)</span>
              </button>
            </div>

            {/* Features Included */}
            <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <li className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                PDF Feasibility Reports
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited Quote Comparisons
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Performance Monitoring
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority DISCOM Guidance
              </li>
            </ul>

            {/* QR Code and Payment Info */}
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="shrink-0 text-center">
                <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="Scan UPI QR Code"
                    width={140}
                    height={140}
                    className="rounded"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Scan via GPay / PhonePe / Paytm</p>
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <span className="text-xs text-slate-500">Amount Payable</span>
                  <div className="text-xl font-bold text-slate-900">
                    ₹{amount}
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      ({cycle === 'ANNUAL' ? '12 months access' : '1 month access'})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500">UPI ID (VPA)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-medium text-slate-800 flex-1 truncate">
                      {UPI_CONFIG.vpa}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="shrink-0 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <a
                  href={upiUri}
                  className="block w-full text-center rounded-lg bg-slate-800 py-2 text-xs font-medium text-white hover:bg-slate-900 transition-colors sm:hidden"
                >
                  Open in UPI App
                </a>
              </div>
            </div>

            {/* UTR Reference Input Form */}
            <form onSubmit={handleVerifyUtr} className="space-y-2">
              <label htmlFor="utr-modal-input" className="block text-xs font-semibold text-slate-700">
                Enter 12-Digit UPI Reference Number (UTR)
              </label>
              <div className="flex gap-2">
                <input
                  id="utr-modal-input"
                  type="text"
                  placeholder="e.g. 427819284712"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  maxLength={16}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
                <Button type="submit" variant="primary" size="sm" loading={submitting}>
                  Verify & Unlock
                </Button>
              </div>
              {error && <Alert tone="error">{error}</Alert>}
            </form>

            {/* Reviewer / Prototype Demo Pass */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-medium text-slate-800">Reviewer & Prototype Pass</p>
                <p className="text-slate-500">Test Pro unlock without transferring funds.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleInstantDemoPass}
                disabled={submitting}
              >
                Instant Pass
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
