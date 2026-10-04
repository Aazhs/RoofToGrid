'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import type { Scenario } from '@/lib/types';

interface SolarFinancingCalculatorProps {
  scenarios: Scenario[];
}

interface LoanProduct {
  name: string;
  rate: number;
  maxTenureYears: number;
  badge: string;
  description: string;
}

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    name: 'PM Surya Ghar Bank Loan (SBI / Canara / PNB)',
    rate: 7.0,
    maxTenureYears: 10,
    badge: 'Govt Concessional',
    description: 'Collateral-free subsidized credit directly tied to PM Surya Ghar portal.',
  },
  {
    name: 'Standard Clean Energy Loan',
    rate: 9.5,
    maxTenureYears: 7,
    badge: 'Private Bank',
    description: 'Fast digital sanction through private commercial banks.',
  },
  {
    name: 'Zero Down-Payment NBFC',
    rate: 11.0,
    maxTenureYears: 5,
    badge: 'Instant NBFC',
    description: '100% financing with minimal documentation.',
  },
];

export function SolarFinancingCalculator({ scenarios }: SolarFinancingCalculatorProps) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(
    Math.max(0, scenarios.findIndex((s) => s.key === 'OPTIMAL'))
  );
  const [productIndex, setProductIndex] = useState(0);
  const [downpaymentPct, setDownpaymentPct] = useState(10);
  const [tenureYears, setTenureYears] = useState(7);

  const scenario = scenarios[selectedScenarioIndex] ?? scenarios[0];
  const product = LOAN_PRODUCTS[productIndex];

  if (!scenario) return null;

  const netCost = scenario.netCost;
  const downpayment = Math.round((netCost * downpaymentPct) / 100);
  const principal = Math.max(0, netCost - downpayment);

  // EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyRate = product.rate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let emi = 0;
  if (principal > 0 && monthlyRate > 0) {
    emi = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  }

  const monthlySavings = scenario.monthlySavings;
  const netMonthlyCashflow = monthlySavings - emi;
  const totalInterest = Math.max(0, emi * totalMonths - principal);

  return (
    <Card>
      <CardHeader
        title="Solar Loan & Financing EMI Calculator"
        description="Under PM Surya Ghar, Indian public sector banks offer low-interest (7% p.a.) collateral-free loans for rooftop solar."
      />
      <CardBody className="space-y-6">
        
        {/* Scenario Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">System Size:</span>
          {scenarios.map((sc, i) => (
            <button
              key={sc.key}
              type="button"
              onClick={() => setSelectedScenarioIndex(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedScenarioIndex === i
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sc.label} ({sc.systemSizeKwp} kWp)
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Controls */}
          <div className="md:col-span-6 space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
            {/* Loan Product Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Financing Scheme
              </label>
              <select
                value={productIndex}
                onChange={(e) => setProductIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
              >
                {LOAN_PRODUCTS.map((prod, idx) => (
                  <option key={prod.name} value={idx}>
                    {prod.name} ({prod.rate}% p.a.)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">{product.description}</p>
            </div>

            {/* Downpayment Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Down Payment ({downpaymentPct}%)</span>
                <span className="font-mono text-slate-900">{formatCurrency(downpayment)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={downpaymentPct}
                onChange={(e) => setDownpaymentPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Zero Down)</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Loan Tenure</span>
                <span className="font-mono text-slate-900">{tenureYears} Years ({totalMonths} months)</span>
              </div>
              <input
                type="range"
                min="1"
                max={product.maxTenureYears}
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Year</span>
                <span>{product.maxTenureYears} Years Max</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Net System Cost: {formatCurrency(netCost)}</span>
              <span>Loan Amount: {formatCurrency(principal)}</span>
            </div>
          </div>

          {/* Cashflow Results Card */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Primary Net Cashflow Metric */}
            <div className={`rounded-xl p-5 border ${
              netMonthlyCashflow >= 0
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Net Monthly Cashflow
                </span>
                <Badge tone={netMonthlyCashflow >= 0 ? 'good' : 'warn'}>
                  {netMonthlyCashflow >= 0 ? 'Day 1 Positive' : 'Minor Outflow'}
                </Badge>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold font-jakarta ${
                  netMonthlyCashflow >= 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {netMonthlyCashflow >= 0 ? '+' : ''}{formatCurrency(netMonthlyCashflow)}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {netMonthlyCashflow >= 0 ? (
                  <>
                    Your estimated monthly electricity bill savings (<strong>{formatCurrency(monthlySavings)}/mo</strong>) are larger than your loan EMI (<strong>{formatCurrency(emi)}/mo</strong>). You pocket free cash every month while the loan pays for itself.
                  </>
                ) : (
                  <>
                    Your monthly solar bill savings offset most of your EMI. Net monthly commitment is only {formatCurrency(Math.abs(netMonthlyCashflow))}.
                  </>
                )}
              </p>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <span className="text-[11px] text-slate-500 font-medium">Monthly Loan EMI</span>
                <p className="text-lg font-bold text-slate-900 font-jakarta mt-0.5">
                  {formatCurrency(emi)}
                </p>
                <span className="text-[10px] text-slate-400">@ {product.rate}% interest</span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <span className="text-[11px] text-slate-500 font-medium">Monthly Solar Savings</span>
                <p className="text-lg font-bold text-brand-700 font-jakarta mt-0.5">
                  {formatCurrency(monthlySavings)}
                </p>
                <span className="text-[10px] text-slate-400">Avoided grid tariff</span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <span className="text-[11px] text-slate-500 font-medium">Total Interest Paid</span>
                <p className="text-base font-semibold text-slate-800 font-jakarta mt-0.5">
                  {formatCurrency(totalInterest)}
                </p>
                <span className="text-[10px] text-slate-400">Over {tenureYears} years</span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <span className="text-[11px] text-slate-500 font-medium">Subsidy Credited (DBT)</span>
                <p className="text-base font-semibold text-emerald-700 font-jakarta mt-0.5">
                  {formatCurrency(scenario.subsidyAmount)}
                </p>
                <span className="text-[10px] text-emerald-600">Central CFA subsidy</span>
              </div>
            </div>

          </div>

        </div>
      </CardBody>
    </Card>
  );
}
