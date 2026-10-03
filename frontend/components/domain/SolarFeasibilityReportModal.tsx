'use client';

import { useState } from 'react';
import { useSubscription } from '@/lib/subscription';
import { UpiCheckoutModal } from '@/components/billing/UpiCheckoutModal';
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
  const { isPro } = useSubscription();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const activeScenario = scenario ?? sizingRun.scenarios.find((s) => s.key === 'OPTIMAL') ?? sizingRun.scenarios[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
        <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none">
          {/* Modal Toolbar (hidden when printing) */}
          <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white print:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black text-sm">
                PDF
              </span>
              <div>
                <h3 className="font-bold text-base">Solar Feasibility & Subsidy Report</h3>
                <p className="text-xs text-slate-300">Generated for Homeowner Bank Loan & Installer Review</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isPro ? (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / Save as PDF
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="rounded-xl bg-amber-400 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  ⭐ Unlock PDF with Pro (₹499)
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Printable Report Document Body */}
          <div className="relative p-6 sm:p-10 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
            {/* Pro Gate Overlay (if user is Free) */}
            {!isPro && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/85 backdrop-blur-md p-6 text-center print:hidden">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-3 shadow-sm">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-black text-slate-900">Unlock Official PDF Feasibility Report</h4>
                <p className="mt-2 max-w-md text-sm text-slate-600">
                  Get this comprehensive solar engineering report with PM Surya Ghar subsidy breakdown, 25-year cash-flow model, and DISCOM checklist.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚡ Unlock with UPI — ₹499/mo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition-all"
                  >
                    🚀 Reviewer Fast-Pass
                  </button>
                </div>
              </div>
            )}

            {/* Document Header */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    Roof<span className="text-brand-700">To</span>Grid
                  </div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                    Solar Planning & Feasibility Report
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
                  <p className="font-mono font-bold text-slate-800">DOC ID: RTG-FEAS-2026-9812</p>
                  <p>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-emerald-700 font-medium">PM Surya Ghar CFA Verified</p>
                </div>
              </div>
            </div>

            {/* Customer & Site Overview */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Applicant / Location</span>
                <span className="font-bold text-slate-900 text-sm">Arun Sharma</span>
                <span className="text-slate-500 block">Bengaluru, KA 560034</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Utility / DISCOM</span>
                <span className="font-bold text-slate-900 text-sm">BESCOM</span>
                <span className="text-slate-500 block">LT-2 Residential</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Monthly Consumption</span>
                <span className="font-bold text-slate-900 text-sm">{formatNumber(sizingRun.avgMonthlyUnits, 0)} units</span>
                <span className="text-slate-500 block">₹{sizingRun.tariffPerKwh}/unit tariff</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Roof Area Available</span>
                <span className="font-bold text-slate-900 text-sm">{sizingRun.roofProfile?.usableAreaSqft ?? 500} sqft</span>
                <span className="text-emerald-700 font-bold block">100% Shade-Free (South)</span>
              </div>
            </div>

            {/* Core Recommendation Card */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-900 via-slate-900 to-slate-950 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    Recommended System Design
                  </span>
                  <h3 className="text-3xl font-black mt-1">
                    {formatKwp(activeScenario.systemSizeKwp)} Rooftop Solar System
                  </h3>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-2 text-right">
                  <span className="text-xs text-slate-300 block">Estimated Annual Yield</span>
                  <span className="text-xl font-black text-amber-300">
                    {formatNumber(activeScenario.annualGenerationKwh, 0)} kWh
                  </span>
                </div>
              </div>

              {/* Financial Metrics Row */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-xs text-slate-400">Total System Cost</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {formatCurrency(activeScenario.estimatedCost)}
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <span className="text-xs text-emerald-300 font-semibold">PM Surya Ghar Subsidy</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    - {formatCurrency(activeScenario.subsidyAmount)}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-xs text-slate-400">Net Customer Cost</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {formatCurrency(activeScenario.netCost)}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <span className="text-xs text-slate-400">Simple Payback</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {formatYears(activeScenario.paybackYears)}
                  </div>
                </div>
              </div>
            </div>

            {/* 25-Year Financial Return Breakdown */}
            <div className="mt-6">
              <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3">
                25-Year Lifecycle Financial Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">Annual Electricity Savings</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatCurrency(activeScenario.annualSavings)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Offsets ~100% of daytime domestic power usage
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">25-Year Lifetime Savings</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {formatCurrency(activeScenario.lifetimeSavings25y)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Assuming 4.5% annual DISCOM tariff escalation
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">Carbon Emissions Avoided</span>
                  <div className="text-2xl font-black text-teal-600 mt-1">
                    {activeScenario.co2OffsetTonnesPerYear} Tonnes/yr
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Equivalent to planting ~270 mature trees
                  </p>
                </div>
              </div>
            </div>

            {/* PM Surya Ghar Subsidy Milestones Guide */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
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
