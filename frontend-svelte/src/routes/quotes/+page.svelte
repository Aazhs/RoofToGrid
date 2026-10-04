<script lang="ts">
  const QUOTES = [
    {
      id: 'waaree',
      installer: 'Waaree Energies Direct Partner',
      capacityKw: 5.0,
      totalCost: 290000,
      ratePerKwp: 58000,
      panels: 'Waaree 550W Mono PERC',
      inverter: 'Waaree Dual MPPT 5kW',
      warranty: '25y panel / 5y inverter',
      score: 9.4,
      badge: 'Best Value Pick',
      badgeColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/25',
      redFlags: [],
    },
    {
      id: 'tata',
      installer: 'Tata Power Solar Systems',
      capacityKw: 5.0,
      totalCost: 340000,
      ratePerKwp: 68000,
      panels: 'Tata Power Solar 545W TopCon',
      inverter: 'Growatt 10y Warranty Inverter',
      warranty: '25y linear / 10y inverter',
      score: 9.6,
      badge: 'Premium Equipment',
      badgeColor: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/25',
      redFlags: [],
    },
    {
      id: 'unbranded',
      installer: 'City Solar EPC (Local)',
      capacityKw: 5.0,
      totalCost: 240000,
      ratePerKwp: 48000,
      panels: 'Generic Tier-2 Polycrystalline 330W',
      inverter: 'Unspecified Local String Inverter',
      warranty: '10y verbal / 1y inverter',
      score: 4.8,
      badge: 'High Risk Flagged',
      badgeColor: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/25',
      redFlags: [
        'Outdated Polycrystalline panels (inferior low-light yield)',
        'Unspecified inverter brand lacking 10-year BIS compliance',
        'Suspiciously low rate (<₹50k/kWp) omitting DISCOM net-metering liaison fees',
      ],
    },
  ];
</script>

<svelte:head>
  <title>Quote Intelligence &amp; Audit — RoofToGrid</title>
</svelte:head>

<div class="mx-auto max-w-[1280px] px-4 py-8 md:px-16">
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-2">
      <a href="/dashboard" class="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline">
        ← Back to Dashboard
      </a>
      <span class="text-outline-variant">/</span>
      <span class="text-xs text-on-surface-variant">Quote Audit</span>
    </div>
    <h1 class="font-serif text-3xl sm:text-4xl font-normal text-on-surface tracking-tight">
      Quote Intelligence &amp; <span class="font-serif italic text-amber-700 dark:text-amber-400">Red Flag Detection</span>
    </h1>
    <p class="mt-1 text-sm text-on-surface-variant max-w-2xl">
      Standardize vendor proposals on normalized ₹/kWp rates. Our algorithm checks panel tech, inverter warranty terms, and screens for hidden DISCOM liaison charges.
    </p>
  </div>

  <!-- Comparison Matrix Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each QUOTES as q}
      <div class={`rounded-2xl border p-6 flex flex-col justify-between card-hover ${
        q.score >= 9.0
          ? 'border-outline-variant/80 bg-surface-container-lowest shadow-sm'
          : 'border-rose-500/40 bg-rose-500/5'
      }`}>
        <div>
          <!-- Header Tag -->
          <div class="flex items-center justify-between mb-3">
            <span class={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${q.badgeColor}`}>
              {q.badge}
            </span>
            <div class="font-serif text-2xl font-bold text-on-surface">
              {q.score} <span class="text-xs font-normal text-on-surface-variant">/ 10</span>
            </div>
          </div>

          <h3 class="font-serif text-xl font-normal text-on-surface mb-2">{q.installer}</h3>
          
          <div class="mt-4 p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/40 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Total Quote:</span>
              <span class="font-mono font-semibold text-on-surface">₹{(q.totalCost).toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Normalized Rate:</span>
              <span class="font-mono font-bold text-amber-700 dark:text-amber-400">₹{q.ratePerKwp.toLocaleString('en-IN')} / kWp</span>
            </div>
            <div class="flex justify-between border-t border-outline-variant/30 pt-1.5">
              <span class="text-emerald-700 dark:text-emerald-400 font-medium">Net (After ₹78K PM Surya Ghar):</span>
              <span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">₹{(q.totalCost - 78000).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <!-- Specs List -->
          <div class="mt-4 space-y-2 text-xs">
            <div class="flex items-start gap-2">
              <span class="text-on-surface-variant shrink-0">Panels:</span>
              <span class="font-medium text-on-surface">{q.panels}</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-on-surface-variant shrink-0">Inverter:</span>
              <span class="font-medium text-on-surface">{q.inverter}</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-on-surface-variant shrink-0">Warranty:</span>
              <span class="font-medium text-on-surface">{q.warranty}</span>
            </div>
          </div>

          <!-- Red Flags Alert Box if any -->
          {#if q.redFlags.length > 0}
            <div class="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs">
              <span class="font-bold text-rose-800 dark:text-rose-300 block mb-1">
                ⚠️ 3 Red Flags Detected:
              </span>
              <ul class="space-y-1 text-rose-900 dark:text-rose-200 list-disc pl-4 text-[11px]">
                {#each q.redFlags as rf}
                  <li>{rf}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>

        <button class={`mt-6 w-full rounded-xl py-3 text-xs font-semibold transition-all cursor-pointer ${
          q.score >= 9.0
            ? 'bg-on-surface text-surface hover:opacity-90 shadow-sm'
            : 'border border-outline-variant text-on-surface-variant hover:text-on-surface'
        }`}>
          {q.score >= 9.0 ? 'Select This Quote' : 'Inspect Risk Report'}
        </button>
      </div>
    {/each}
  </div>
</div>
