'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

const STATE_TARIFFS: Record<string, { label: string; tariff: number }> = {
  national: { label: 'National Average (₹7.2/kWh)', tariff: 7.2 },
  ka: { label: 'Karnataka / BESCOM (₹7.5/kWh)', tariff: 7.5 },
  mh: { label: 'Maharashtra / MSEDCL (₹8.5/kWh)', tariff: 8.5 },
  dl: { label: 'Delhi / BSES (₹6.5/kWh)', tariff: 6.5 },
  gj: { label: 'Gujarat / UGVCL (₹6.0/kWh)', tariff: 6.0 },
  tn: { label: 'Tamil Nadu / TANGEDCO (₹7.0/kWh)', tariff: 7.0 },
  up: { label: 'Uttar Pradesh / UPPCL (₹7.0/kWh)', tariff: 7.0 },
};

export function QuickCalculator() {
  const { ref, isVisible } = useScrollReveal();
  const [bill, setBill] = useState<number>(4500);
  const [selectedState, setSelectedState] = useState<string>('national');
  const billInputId = useId();
  const stateSelectId = useId();

  const tariff = STATE_TARIFFS[selectedState]?.tariff ?? 7.2;

  // Monthly energy consumption (kWh)
  const monthlyUnits = bill / tariff;
  const dailyUnits = monthlyUnits / 30;

  // Sizing calculation (4.2 peak sun hours, 80% system performance ratio)
  const rawSize = dailyUnits / (4.2 * 0.8);
  const systemSizeKw = Math.max(1, Math.min(15, Math.round(rawSize * 10) / 10));

  // Required shade-free roof area (~100 sq ft per kWp)
  const roofAreaSqFt = Math.round(systemSizeKw * 100);

  // Monthly generation (kWh)
  const monthlyGen = Math.round(systemSizeKw * 4.2 * 30 * 0.8);

  // Monthly and annual savings (capped at current bill)
  const monthlySavings = Math.min(bill, Math.round(monthlyGen * tariff));
  const annualSavings = monthlySavings * 12;

  // PM Surya Ghar Muft Bijli Yojana Central Subsidy
  // Up to 1 kW: ₹30,000
  // Up to 2 kW: ₹60,000
  // 3 kW and above: ₹78,000 (flat max)
  let subsidy = 0;
  if (systemSizeKw <= 1) {
    subsidy = 30000;
  } else if (systemSizeKw <= 2) {
    subsidy = 30000 + Math.round((systemSizeKw - 1) * 30000);
  } else if (systemSizeKw <= 3) {
    subsidy = 60000 + Math.round((systemSizeKw - 2) * 18000);
  } else {
    subsidy = 78000;
  }

  // Cost estimates (~₹65,000 per kW benchmark)
  const grossCost = Math.round(systemSizeKw * 65000);
  const netCost = Math.max(15000, grossCost - subsidy);

  // Payback period in years
  const paybackYears = (netCost / annualSavings).toFixed(1);

  // 25-year lifetime net profit (accounting for savings minus net investment)
  const lifetimeSavings = Math.round((annualSavings * 25) - netCost);

  return (
    <section 
      id="quick-calculator" 
      className="py-20 md:py-28 bg-surface-container-low border-b border-outline-variant relative overflow-hidden"
    >
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary opacity-5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-16 relative z-10">
        
        {/* Header */}
        <div 
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center max-w-3xl mx-auto mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="text-label-sm text-outline uppercase tracking-widest mb-3 block font-jakarta">
            INSTANT ESTIMATOR · NO SIGNUP NEEDED
          </span>
          <h2 className="text-headline-lg md:text-display-lg font-semibold text-on-surface mb-4 font-jakarta">
            Calculate your roof&apos;s true potential.
          </h2>
          <p className="text-body-lg text-on-surface-variant font-jakarta">
            Adjust your current monthly electricity bill to see your recommended solar capacity, central government subsidy, and estimated savings under PM Surya Ghar.
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Card */}
          <div className="lg:col-span-5 bg-surface-container border border-outline-variant/70 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-on-surface mb-6 font-jakarta flex items-center justify-between">
              <span>Your Energy Usage</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
                Live Model
              </span>
            </h3>

            {/* Bill Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor={billInputId} className="text-sm font-medium text-on-surface">
                  Average Monthly Electricity Bill
                </label>
                <span className="text-2xl font-bold text-on-surface font-jakarta">
                  ₹{bill.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                id={billInputId}
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="w-full h-2.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-on-surface focus:outline-none"
              />
              <div className="flex justify-between text-xs text-on-surface-variant/60 mt-2 font-mono">
                <span>₹1,000</span>
                <span>₹10,000</span>
                <span>₹20,000+</span>
              </div>
            </div>

            {/* State / DISCOM Selector */}
            <div className="mb-6">
              <label htmlFor={stateSelectId} className="block text-sm font-medium text-on-surface mb-2">
                Tariff Region
              </label>
              <select
                id={stateSelectId}
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              >
                {Object.entries(STATE_TARIFFS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly units estimated */}
            <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Estimated Monthly Consumption</span>
              <span className="font-semibold text-on-surface font-mono">
                {Math.round(monthlyUnits)} kWh (units)
              </span>
            </div>

            <p className="mt-6 text-xs text-on-surface-variant/60 leading-relaxed">
              Estimates adhere to MNRE standards (IN_2026_07) assuming standard crystalline PV panels (0.5%/yr degradation) with net-metering solar export.
            </p>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Top 2 Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Sizing & Area */}
              <div className="bg-surface-container border border-outline-variant/70 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Recommended System</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium border border-emerald-500/20">
                    Optimal Sizing
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-on-surface font-jakarta mb-1">
                  {systemSizeKw} <span className="text-xl font-normal text-on-surface-variant">kWp</span>
                </div>
                <div className="text-xs text-on-surface-variant mt-2 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor">
                    <path d="M120-120v-720h720v720H120Zm80-80h560v-560H200v560Z"/>
                  </svg>
                  Requires ~{roofAreaSqFt} sq. ft. shade-free roof
                </div>
              </div>

              {/* PM Surya Ghar Subsidy */}
              <div className="bg-surface-container border border-outline-variant/70 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Govt Subsidy (DBT)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20">
                    PM Surya Ghar
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-on-surface font-jakarta mb-1">
                  ₹{subsidy.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-on-surface-variant mt-2 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor">
                    <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Z"/>
                  </svg>
                  Direct credit into homeowner bank account
                </div>
              </div>

            </div>

            {/* Bottom 3 Detailed Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Annual Savings */}
              <div className="bg-surface-container border border-outline-variant/70 rounded-xl p-5">
                <span className="text-xs text-on-surface-variant font-medium block mb-1">Annual Savings</span>
                <span className="text-2xl font-bold text-on-surface font-jakarta">
                  ₹{annualSavings.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-on-surface-variant/70 block mt-1">
                  ~₹{monthlySavings.toLocaleString('en-IN')}/mo bill cut
                </span>
              </div>

              {/* Net Investment */}
              <div className="bg-surface-container border border-outline-variant/70 rounded-xl p-5">
                <span className="text-xs text-on-surface-variant font-medium block mb-1">Est. Net Out-of-Pocket</span>
                <span className="text-2xl font-bold text-on-surface font-jakarta">
                  ₹{netCost.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-on-surface-variant/70 block mt-1 line-through">
                  ₹{grossCost.toLocaleString('en-IN')} gross
                </span>
              </div>

              {/* Payback */}
              <div className="bg-surface-container border border-outline-variant/70 rounded-xl p-5">
                <span className="text-xs text-on-surface-variant font-medium block mb-1">Payback Period</span>
                <span className="text-2xl font-bold text-on-surface font-jakarta">
                  {paybackYears} <span className="text-base font-normal">Years</span>
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                  +21 yrs free power
                </span>
              </div>

            </div>

            {/* Call to Action Banner */}
            <div className="bg-surface-container-high/80 border border-outline-variant rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-on-surface font-jakarta">
                  Want the full 25-year financial breakdown?
                </h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Includes 3 sizing scenarios (Conservative, Optimal, Max Roof), loan amortization, and 3 quotes comparison.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="whitespace-nowrap rounded-xl bg-primary-container text-surface px-6 py-3.5 text-sm font-semibold hover:bg-surface-tint transition-all duration-200 inline-flex items-center gap-2 shadow-sm"
              >
                <span>Generate Official Report</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
