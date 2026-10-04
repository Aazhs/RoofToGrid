<script lang="ts">
  import { onMount } from 'svelte';

  let selectedScenario = $state<'optimal' | 'conservative' | 'max'>('optimal');
  let inverterStatus = $state<'normal' | 'alert'>('normal');

  const SCENARIOS = {
    conservative: { sizeKw: 3.2, cost: 208000, subsidy: 78000, net: 130000, monthlyGen: 384, payback: '3.4 yrs' },
    optimal: { sizeKw: 5.0, cost: 325000, subsidy: 78000, net: 247000, monthlyGen: 600, payback: '3.6 yrs' },
    max: { sizeKw: 7.5, cost: 487500, subsidy: 78000, net: 409500, monthlyGen: 900, payback: '4.1 yrs' },
  };

  const MILESTONES = [
    { id: 1, title: 'Initial Roof Assessment', status: 'completed', date: '12 Sep 2026' },
    { id: 2, title: 'DISCOM Feasibility Approval', status: 'completed', date: '19 Sep 2026' },
    { id: 3, title: 'Vendor Quote Finalized', status: 'completed', date: '25 Sep 2026' },
    { id: 4, title: 'MNRE National Portal Registration', status: 'completed', date: '28 Sep 2026' },
    { id: 5, title: 'Structure & Panel Mounting', status: 'in_progress', date: 'Target: 08 Oct 2026' },
    { id: 6, title: 'Inverter Wiring & Earthing', status: 'pending', date: 'Target: 14 Oct 2026' },
    { id: 7, title: 'DISCOM Inspection & Net-Meter', status: 'pending', date: 'Target: 22 Oct 2026' },
    { id: 8, title: 'System Commissioning', status: 'pending', date: 'Target: 26 Oct 2026' },
    { id: 9, title: 'PM Surya Ghar ₹78K DBT Credited', status: 'pending', date: 'Target: 15 Nov 2026' },
  ];

  let current = $derived(SCENARIOS[selectedScenario]);
</script>

<svelte:head>
  <title>Dashboard — RoofToGrid Solar Planning</title>
</svelte:head>

<div class="mx-auto max-w-[1280px] px-4 py-8 md:px-16">
  <!-- Top Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-6 mb-8">
    <div>
      <div class="flex items-center gap-2.5">
        <h1 class="font-serif text-3xl sm:text-4xl font-normal text-on-surface tracking-tight">
          Solar Project <span class="font-serif italic text-amber-700 dark:text-amber-400">Dashboard</span>
        </h1>
        <span class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          Live Model
        </span>
      </div>
      <p class="mt-1 text-xs sm:text-sm text-on-surface-variant">
        Bangalore Residence · BESCOM Tariff Tier 2 · 5.0 kWp TopCon Dual-Glass Setup
      </p>
    </div>

    <!-- Quick Navigation Links -->
    <div class="flex flex-wrap items-center gap-2">
      <a href="/bills" class="rounded-xl border border-outline-variant/70 bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container card-hover">
        📄 Bill OCR
      </a>
      <a href="/quotes" class="rounded-xl border border-outline-variant/70 bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container card-hover">
        ⚖️ Quote Audit
      </a>
      <a href="/roof" class="rounded-xl border border-outline-variant/70 bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container card-hover">
        🏠 Balcony AI
      </a>
    </div>
  </div>

  <!-- Sizing Scenario Switcher -->
  <div class="mb-8 rounded-2xl border border-outline-variant/70 bg-surface-container-low/80 p-5 card-hover">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <span class="text-xs uppercase tracking-wider text-on-surface-variant/80 font-semibold">
          Financial Sizing Scenarios
        </span>
        <p class="text-xs text-on-surface-variant">Switch between conservative and maximum rooftop yield models</p>
      </div>
      <div class="inline-flex rounded-xl bg-surface-container p-1 border border-outline-variant/50">
        <button
          type="button"
          onclick={() => selectedScenario = 'conservative'}
          class={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            selectedScenario === 'conservative'
              ? 'bg-on-surface text-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Conservative (3.2 kWp)
        </button>
        <button
          type="button"
          onclick={() => selectedScenario = 'optimal'}
          class={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            selectedScenario === 'optimal'
              ? 'bg-on-surface text-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Optimal (5.0 kWp)
        </button>
        <button
          type="button"
          onclick={() => selectedScenario = 'max'}
          class={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            selectedScenario === 'max'
              ? 'bg-on-surface text-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Max Roof (7.5 kWp)
        </button>
      </div>
    </div>

    <!-- Active Scenario Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-outline-variant/40">
      <div class="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/70 p-3">
        <span class="text-[11px] text-on-surface-variant">System Capacity</span>
        <div class="font-serif text-2xl font-bold text-on-surface">{current.sizeKw} kWp</div>
      </div>
      <div class="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/70 p-3">
        <span class="text-[11px] text-on-surface-variant">Gross Cost</span>
        <div class="font-serif text-2xl font-bold text-on-surface">₹{(current.cost / 1000).toFixed(0)}k</div>
      </div>
      <div class="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/70 p-3">
        <span class="text-[11px] text-amber-700 dark:text-amber-400 font-medium">PM Surya Ghar Subsidy</span>
        <div class="font-serif text-2xl font-bold text-amber-700 dark:text-amber-400">₹{(current.subsidy / 1000).toFixed(0)}k</div>
      </div>
      <div class="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/70 p-3">
        <span class="text-[11px] text-on-surface-variant">Net Investment</span>
        <div class="font-serif text-2xl font-bold text-on-surface">₹{(current.net / 1000).toFixed(0)}k</div>
      </div>
      <div class="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/70 p-3">
        <span class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Payback Period</span>
        <div class="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400">{current.payback}</div>
      </div>
    </div>
  </div>

  <!-- Main Grid: Inverter Telemetry + 9-Milestone Tracker -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- LEFT: Inverter Telemetry & Health (5 cols) -->
    <div class="lg:col-span-5 space-y-6">
      <div class="rounded-2xl border border-outline-variant/70 bg-surface-container-low p-6 card-hover">
        <div class="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-4">
          <div>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Live Cloud Inverter Telemetry
            </span>
            <h3 class="font-serif text-xl font-normal text-on-surface">Growatt MIN 5000TL-X</h3>
          </div>
          <span class="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            Online
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-center mb-4">
          <div class="rounded-xl border border-outline-variant/40 bg-surface-container p-3">
            <span class="text-[11px] text-on-surface-variant">Today's Generation</span>
            <div class="font-serif text-2xl font-bold text-on-surface">18.6 kWh</div>
          </div>
          <div class="rounded-xl border border-outline-variant/40 bg-surface-container p-3">
            <span class="text-[11px] text-on-surface-variant">Performance Ratio</span>
            <div class="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400">84.2%</div>
          </div>
        </div>

        <div class="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/80 p-3.5 space-y-2 text-xs">
          <div class="flex justify-between text-on-surface-variant">
            <span>Peak Power Today</span>
            <span class="font-mono font-semibold text-on-surface">4.82 kW (1:15 PM)</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span>Grid Voltage / Frequency</span>
            <span class="font-mono font-semibold text-on-surface">234.2 V · 50.04 Hz</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span>Inverter Internal Temp</span>
            <span class="font-mono font-semibold text-on-surface">39.4°C (Normal)</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span>Lifetime CO2 Offset</span>
            <span class="font-mono font-semibold text-emerald-700 dark:text-emerald-400">14.8 Tonnes</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/90 p-5 card-hover">
        <h4 class="font-serif text-lg font-normal text-on-surface mb-3">Project Documents &amp; Vault</h4>
        <div class="space-y-2 text-xs">
          <button class="w-full flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container transition-all cursor-pointer">
            <span>📄 Official Feasibility Report (PDF)</span>
            <span class="text-amber-700 dark:text-amber-400 font-semibold">Download</span>
          </button>
          <button class="w-full flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container transition-all cursor-pointer">
            <span>📑 PM Surya Ghar Subsidy Sanction Form</span>
            <span class="text-amber-700 dark:text-amber-400 font-semibold">View</span>
          </button>
          <button class="w-full flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container transition-all cursor-pointer">
            <span>📜 25-Year Panel Linear Warranty</span>
            <span class="text-amber-700 dark:text-amber-400 font-semibold">View</span>
          </button>
        </div>
      </div>
    </div>

    <!-- RIGHT: 9-Milestone Project Tracker (7 cols) -->
    <div class="lg:col-span-7 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm card-hover">
      <div class="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-6">
        <div>
          <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Installation Governance
          </span>
          <h3 class="font-serif text-2xl font-normal text-on-surface">9-Milestone Project Tracker</h3>
        </div>
        <span class="text-xs font-semibold text-amber-700 dark:text-amber-400">
          4 of 9 Completed (44%)
        </span>
      </div>

      <div class="space-y-4">
        {#each MILESTONES as m}
          <div class="flex items-start gap-4 p-3 rounded-xl border border-outline-variant/40 transition-all hover:bg-surface-container-low">
            <span class={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              m.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : m.status === 'in_progress'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 animate-pulse'
                  : 'bg-surface-container text-on-surface-variant/60'
            }`}>
              {m.status === 'completed' ? '✓' : m.id}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-on-surface truncate">{m.title}</span>
                <span class={`text-[11px] font-medium capitalize ${
                  m.status === 'completed'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : m.status === 'in_progress'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-on-surface-variant/60'
                }`}>
                  {m.status.replace('_', ' ')}
                </span>
              </div>
              <p class="text-[11px] text-on-surface-variant mt-0.5">{m.date}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
