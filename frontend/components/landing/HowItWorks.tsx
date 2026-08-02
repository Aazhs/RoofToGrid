'use client';

import { useScrollReveal } from '@/components/landing/useScrollReveal';

export default function HowItWorks() {
  const reveal1 = useScrollReveal();
  const reveal2 = useScrollReveal();
  const reveal3 = useScrollReveal();
  const reveal4 = useScrollReveal();

  return (
    <section id="how-it-works" className="mx-auto max-w-[1280px] px-4 py-20 md:px-16 md:py-32">
      <div className="mb-20 max-w-3xl">
        <h2 className="font-jakarta text-headline-lg md:text-display-lg font-semibold text-on-surface">
          The Methodology.
        </h2>
        <p className="mt-6 text-body-lg text-on-surface-variant">
          A scientific, data-driven approach to planning your rooftop solar installation. We handle the complexity so you can focus on the savings, with built-in support for Indian market realities and PM Surya Ghar subsidies.
        </p>
      </div>

      {/* Phase 01 */}
      <div ref={reveal1.ref} style={reveal1.style} className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-label-sm uppercase tracking-widest text-primary">PHASE 01</p>
          <h3 className="mt-2 font-jakarta text-2xl font-semibold text-on-surface">Analysis</h3>
          <p className="mt-4 text-on-surface-variant">
            We process your rooftop dimensions and historical energy bills to establish a precise consumption baseline.
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container p-6 md:col-span-8 overflow-x-auto">
          <div className="grid grid-cols-3 gap-4 border-b border-outline-variant pb-4 text-sm font-semibold text-on-surface">
            <div>Input</div>
            <div>Source</div>
            <div>What We Compute</div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b border-outline-variant py-4 text-sm text-on-surface-variant">
            <div>Monthly Bills</div>
            <div>Your electricity bills</div>
            <div className="text-primary-container">12-month weighted average</div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b border-outline-variant py-4 text-sm text-on-surface-variant">
            <div>Roof Profile</div>
            <div>Your description</div>
            <div className="text-primary-container">Type · Area · Orientation · Shading</div>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4 text-sm text-on-surface-variant">
            <div>Solar Data</div>
            <div>Published averages</div>
            <div className="text-primary-container">India IN_2026_07 standards</div>
          </div>
        </div>
      </div>

      {/* Phase 02 */}
      <div ref={reveal2.ref} style={reveal2.style} className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-label-sm uppercase tracking-widest text-primary">PHASE 02</p>
          <h3 className="mt-2 font-jakarta text-2xl font-semibold text-on-surface">Sizing</h3>
          <p className="mt-4 text-on-surface-variant">
            Our algorithmic engine determines the optimal system capacity balancing your budget, roof space, and local grid policies.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:col-span-8">
          <div className="flex h-64 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-6">
            <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" className="text-primary-container">
               <path fill="currentColor" d="M160-160v-80h640v80H160Zm320-160L160-640l76-76 244 244 244-244 76 76-320 320Z"/>
            </svg>
            <div>
              <p className="text-4xl font-light text-on-surface">3-10 kW</p>
              <p className="mt-2 text-sm text-on-surface-variant">Optimal Capacity Range</p>
            </div>
          </div>
          <div className="flex h-64 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-6">
             <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" className="text-primary-container">
               <path fill="currentColor" d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
            </svg>
            <div>
              <p className="text-4xl font-light text-on-surface">25 yr</p>
              <p className="mt-2 text-sm text-on-surface-variant">Analysis Period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 03 */}
      <div ref={reveal3.ref} style={reveal3.style} className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-label-sm uppercase tracking-widest text-primary">PHASE 03</p>
          <h3 className="mt-2 font-jakarta text-2xl font-semibold text-on-surface">Comparison</h3>
          <p className="mt-4 text-on-surface-variant">
            Evaluate vendor quotes side-by-side. We standardize equipment specs and warranty terms for transparent decision making.
          </p>
        </div>
        <div className="flex h-64 items-end justify-around rounded-xl border border-outline-variant bg-surface-container p-6 md:col-span-8">
           {/* Stylized bar chart */}
           <div className="w-16 rounded-t-sm bg-surface-container-high transition-all duration-500 hover:bg-outline-variant" style={{ height: '40%' }}></div>
           <div className="w-16 rounded-t-sm bg-surface-container-high transition-all duration-500 hover:bg-outline-variant" style={{ height: '60%' }}></div>
           <div className="w-16 rounded-t-sm bg-primary-container transition-all duration-500" style={{ height: '90%' }}></div>
           <div className="w-16 rounded-t-sm bg-surface-container-high transition-all duration-500 hover:bg-outline-variant" style={{ height: '70%' }}></div>
        </div>
      </div>

      {/* Phase 04 */}
      <div ref={reveal4.ref} style={reveal4.style} className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-label-sm uppercase tracking-widest text-primary">PHASE 04</p>
          <h3 className="mt-2 font-jakarta text-2xl font-semibold text-on-surface">Monitoring</h3>
          <p className="mt-4 text-on-surface-variant">
            Post-installation, log your monthly generation and compare it against seasonal projections. Track warranty status and store project documents securely.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-8">
           <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <p className="text-sm text-on-surface-variant">Monthly Tracking</p>
              <p className="font-mono text-lg text-primary-container mt-2">Actual vs Projected</p>
           </div>
           <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <p className="text-sm text-on-surface-variant">Health Alerts</p>
              <p className="font-mono text-lg text-on-surface mt-2">Variance Detection</p>
           </div>
           <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <p className="text-sm text-on-surface-variant">Warranty Status</p>
              <p className="font-mono text-lg text-on-surface mt-2">Active · Expiring · Expired</p>
           </div>
           <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <p className="text-sm text-on-surface-variant">Document Vault</p>
              <p className="font-mono text-lg text-on-surface mt-2">Private Storage</p>
           </div>
        </div>
      </div>
    </section>
  );
}
