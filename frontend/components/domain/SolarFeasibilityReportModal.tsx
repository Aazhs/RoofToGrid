'use client';

import { useState } from 'react';
import { useSubscription } from '@/lib/subscription';
import { UpiCheckoutModal } from '@/components/billing/UpiCheckoutModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatKwp, formatNumber, formatYears } from '@/lib/format';
import type { SizingRun, Scenario } from '@/lib/types';

interface SolarFeasibilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizingRun: SizingRun;
  scenario?: Scenario;
}

export function SolarFeasibilityReportModal({
  isOpen,
  onClose,
  sizingRun,
  scenario,
}: SolarFeasibilityReportModalProps) {
  const { isPro, activate } = useSubscription();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const activeScenario = scenario ?? sizingRun.scenarios.find((s) => s.key === 'OPTIMAL') ?? sizingRun.scenarios[0];

  const handlePrint = () => {
    window.print();
  };

  const handleFastPass = () => {
    activate({ utr: 'DEMO-PASS-' + Date.now() });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
        <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none">
          {/* Modal Toolbar (hidden when printing) */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">Solar Feasibility & Subsidy Report</h3>
                <Badge tone="brand">Official Report</Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Documentation for Bank Loan & Installer Review</p>
            </div>

            <div className="flex items-center gap-2">
              {isPro ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePrint}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print / Save as PDF</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Unlock with Pro (₹499)
                </Button>
              )}

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `☀️ Check out my solar feasibility report on RoofToGrid! Recommended ${formatKwp(activeScenario.systemSizeKwp)} system with ${formatCurrency(activeScenario.subsidyAmount)} PM Surya Ghar subsidy and ${formatYears(activeScenario.paybackYears)} payback: https://rooftogrid.in`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Share feasibility summary via WhatsApp"
              >
                <svg className="h-3.5 w-3.5 fill-emerald-600" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>Share</span>
              </a>

              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>

          {/* Printable Report Document Body */}
          <div className="relative p-6 sm:p-10 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
            {/* Pro Gate Overlay (if user is Free) */}
            {!isPro && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-6 text-center print:hidden">
                <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-card space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <Badge tone="brand">Pro Feature</Badge>
                    <h4 className="mt-2 text-lg font-semibold text-slate-900">
                      Download Feasibility & Subsidy Report
                    </h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Export this complete engineering report with PM Surya Ghar subsidy breakdown, 25-year cash-flow model, and DISCOM checklist for your installer or bank loan.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                    <Button
                      variant="primary"
                      onClick={() => setCheckoutOpen(true)}
                    >
                      Unlock with Pro (₹499/mo)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleFastPass}
                    >
                      Instant Demo Pass
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Document Header */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    Roof<span className="text-brand-700">To</span>Grid
                  </div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
                    Solar Planning & Feasibility Report
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
                  <p className="font-mono font-medium text-slate-800">DOC ID: RTG-FEAS-2026-9812</p>
                  <p>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-emerald-700 font-medium">PM Surya Ghar CFA Verified</p>
                </div>
              </div>
            </div>

            {/* Customer & Site Overview */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Applicant</span>
                <span className="font-semibold text-slate-900 text-sm">Arun Sharma</span>
                <span className="text-slate-500 block">Bengaluru, KA 560034</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Utility / DISCOM</span>
                <span className="font-semibold text-slate-900 text-sm">BESCOM</span>
                <span className="text-slate-500 block">LT-2 Residential</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Monthly Consumption</span>
                <span className="font-semibold text-slate-900 text-sm">{formatNumber(sizingRun.avgMonthlyUnits, 0)} units</span>
                <span className="text-slate-500 block">₹{sizingRun.tariffPerKwh}/unit tariff</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Roof Area Available</span>
                <span className="font-semibold text-slate-900 text-sm">{sizingRun.roofProfile?.usableAreaSqft ?? 500} sqft</span>
                <span className="text-emerald-700 font-medium block">100% Shade-Free (South)</span>
              </div>
            </div>

            {/* Core Recommendation Card */}
            <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50/40 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-200/60 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-brand-800 font-semibold">
                    Recommended System Design
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {formatKwp(activeScenario.systemSizeKwp)} Rooftop Solar System
                  </h3>
                </div>
                <div className="rounded-lg border border-brand-200 bg-white px-3.5 py-1.5 text-right">
                  <span className="text-xs text-slate-500 block">Estimated Annual Yield</span>
                  <span className="text-lg font-bold text-brand-800">
                    {formatNumber(activeScenario.annualGenerationKwh, 0)} kWh
                  </span>
                </div>
              </div>

              {/* Financial Metrics Row */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <span className="text-xs text-slate-500 font-medium">Total System Cost</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatCurrency(activeScenario.estimatedCost)}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                  <span className="text-xs text-emerald-800 font-medium">PM Surya Ghar Subsidy</span>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">
                    - {formatCurrency(activeScenario.subsidyAmount)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <span className="text-xs text-slate-500 font-medium">Net Customer Cost</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatCurrency(activeScenario.netCost)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <span className="text-xs text-slate-500 font-medium">Simple Payback</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatYears(activeScenario.paybackYears)}
                  </div>
                </div>
              </div>
            </div>

            {/* 25-Year Financial Return Breakdown */}
            <div className="mt-6">
              <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">
                25-Year Lifecycle Financial Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">Annual Electricity Savings</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {formatCurrency(activeScenario.annualSavings)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Offsets ~100% of daytime domestic power usage
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">25-Year Lifetime Savings</span>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    {formatCurrency(activeScenario.lifetimeSavings25y)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Assuming 4.5% annual DISCOM tariff escalation
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">Carbon Emissions Avoided</span>
                  <div className="text-xl font-bold text-teal-700 mt-1">
                    {activeScenario.co2OffsetTonnesPerYear} Tonnes/yr
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Equivalent to planting ~270 mature trees
                  </p>
                </div>
              </div>
            </div>

            {/* PM Surya Ghar Subsidy Milestones Guide */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-2">
                PM Surya Ghar: Muft Bijli Yojana Disbursal Steps
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                <li><strong className="text-slate-900">National Portal Registration:</strong> Apply online on pmsuryaghar.gov.in using BESCOM consumer number.</li>
                <li><strong className="text-slate-900">Technical Feasibility Approval:</strong> DISCOM inspects and sanctions 5 kWp load within 15 days.</li>
                <li><strong className="text-slate-900">Installation by Empaneled Vendor:</strong> Install ALMM-listed bifacial TOPCon/Mono PERC modules.</li>
                <li><strong className="text-slate-900">Bi-directional Meter Testing:</strong> DISCOM tests solar generation and installs net-meter.</li>
                <li><strong className="text-slate-900">Direct DBT Subsidy Credit:</strong> ₹78,000 transferred directly to your bank account within 30 days.</li>
              </ol>
            </div>

            {/* Disclaimer & Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-2">
              <p>RoofToGrid Technologies · India Solar Planning Engine v2.4 · pmsuryaghar.gov.in</p>
              <p>Verified against MNRE residential benchmarks · Generated on rooftogrid.in</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal for Unlocking Pro */}
      <UpiCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
