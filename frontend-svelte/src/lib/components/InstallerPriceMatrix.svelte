<script lang="ts">
  interface InstallerBenchmark {
    id: string;
    name: string;
    tier: string;
    baseRatePerKwp: number;
    panelTech: string;
    panelBrand: string;
    inverterBrand: string;
    transparencyScore: number;
    bestForBadge: string;
    notes: string;
  }

  const REGIONS: Record<string, { label: string; multiplier: number }> = {
    ka: { label: 'Karnataka (BESCOM)', multiplier: 1.0 },
    mh: { label: 'Maharashtra (MSEDCL)', multiplier: 1.04 },
    gj: { label: 'Gujarat (UGVCL)', multiplier: 0.96 },
    dl: { label: 'Delhi NCR (BSES)', multiplier: 0.98 },
    tn: { label: 'Tamil Nadu (TANGEDCO)', multiplier: 1.01 },
    up: { label: 'Uttar Pradesh (UPPCL)', multiplier: 0.97 },
  };

  const INSTALLERS: InstallerBenchmark[] = [
    {
      id: 'tata-solar',
      name: 'Tata Power Solar Systems',
      tier: 'Tier 1 National Brand',
      baseRatePerKwp: 68000,
      panelTech: 'TopCon N-Type (22.8% Eff)',
      panelBrand: 'Tata Power Solar 545W',
      inverterBrand: 'Growatt / SolarEdge 10y Warranty',
      transparencyScore: 9.6,
      bestForBadge: 'Best Tech & National Reliability',
      notes: 'Includes full DISCOM net-metering liaisoning and bidirectional meter paperwork.',
    },
    {
      id: 'waaree-solar',
      name: 'Waaree Energies Direct Partner',
      tier: 'Tier 1 Module Manufacturer',
      baseRatePerKwp: 58000,
      panelTech: 'Mono PERC Bi-facial',
      panelBrand: 'Waaree 550W Panels',
      inverterBrand: 'Waaree / Solis 5y Warranty',
      transparencyScore: 9.0,
      bestForBadge: 'Best Value & Fastest Payback (3.6 yrs)',
      notes: 'Largest Indian panel manufacturer with direct distributor dispatch.',
    },
    {
      id: 'solarsquare',
      name: 'SolarSquare Energy',
      tier: 'Tech-Enabled D2C EPC',
      baseRatePerKwp: 64000,
      panelTech: 'Mono PERC Half-Cut',
      panelBrand: 'RenewSys / Waaree 540W',
      inverterBrand: 'Deye Cloud Hybrid-Ready',
      transparencyScore: 9.2,
      bestForBadge: 'Best Customer Service & App Tracking',
      notes: 'Proprietary wind-resilient HDG elevated structure with 5-year AMC.',
    },
    {
      id: 'loom-solar',
      name: 'Loom Solar Microinverter Package',
      tier: 'Premium Microinverter Specialist',
      baseRatePerKwp: 79000,
      panelTech: 'Shark Bi-facial TopCon',
      panelBrand: 'Loom Solar 575W',
      inverterBrand: 'Enphase / Hoymiles Microinverter',
      transparencyScore: 9.4,
      bestForBadge: 'Maximum Safety (Low Voltage AC Roof)',
      notes: 'Panel-level MPPT tracking; immune to partial shading from water tanks or chimneys.',
    },
  ];

  let selectedRegion = $state('ka');
  let selectedKw = $state(3);

  let subsidy = $derived(
    selectedKw <= 1
      ? 30000
      : selectedKw <= 2
        ? 30000 + (selectedKw - 1) * 30000
        : selectedKw <= 3
          ? 60000 + (selectedKw - 2) * 18000
          : 78000
  );

  let regionMultiplier = $derived(REGIONS[selectedRegion]?.multiplier ?? 1.0);
</script>

<section id="installers" class="py-10 md:py-16 bg-surface-container-low border-b border-outline-variant/60">
  <div class="max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="text-center max-w-2xl mx-auto mb-10">
      <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3">
        NATIONWIDE PRICE BENCHMARKS
      </span>
      <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-3">
        Transparent Indian Solar <span class="font-serif italic text-amber-700 dark:text-amber-400">EPC Comparison</span>
      </h2>
      <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
        Indian solar EPC rates vary between ₹52,000/kWp and ₹82,000/kWp. Compare actual market quotes,
        equipment warranties, and net costs after PM Surya Ghar ₹78,000 DBT subsidy.
      </p>
    </div>

    <!-- Controls Bar * -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-outline-variant bg-surface-container mb-10 shadow-sm">
      <div class="flex items-center gap-3">
        <label for="state-epc-select" class="text-sm font-semibold text-on-surface">State / DISCOM:</label>
        <select
          id="state-epc-select"
          bind:value={selectedRegion}
          class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none"
        >
          {#each Object.entries(REGIONS) as [key, reg]}
            <option value={key}>{reg.label}</option>
          {/each}
        </select>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-on-surface">System Capacity:</span>
        <div class="flex gap-1.5">
          {#each [1, 2, 3, 5, 8, 10] as kw}
            <button
              type="button"
              class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedKw === kw
                  ? 'bg-primary-container text-surface'
                  : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface'
              }`}
              onclick={() => selectedKw = kw}
            >
              {kw} kWp
            </button>
          {/each}
        </div>
      </div>

      <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
        <span>PM Surya Ghar Subsidy:</span>
        <strong class="font-mono text-sm">₹{subsidy.toLocaleString('en-IN')}</strong>
      </div>
    </div>

    <!-- Installers Cards Grid * -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each INSTALLERS as item}
        {@const rate = Math.round(item.baseRatePerKwp * regionMultiplier)}
        {@const gross = rate * selectedKw}
        {@const net = Math.max(0, gross - subsidy)}
        <div class="flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm hover:border-primary-container transition-all duration-200">
          <div>
            <div class="flex justify-between items-start gap-2 mb-3">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary-container uppercase tracking-wider">
                {item.bestForBadge}
              </span>
              <span class="text-xs font-mono font-bold text-amber-500">
                ★ {item.transparencyScore}/10
              </span>
            </div>

            <h3 class="text-lg font-bold font-jakarta text-on-surface leading-snug">
              {item.name}
            </h3>
            <span class="text-xs text-on-surface-variant block mt-0.5 mb-4">{item.tier}</span>

            <div class="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low mb-4">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-xs text-on-surface-variant font-medium">Net Out-of-Pocket:</span>
                <span class="text-xl font-bold font-jakarta text-emerald-600 dark:text-emerald-400">
                  ₹{net.toLocaleString('en-IN')}
                </span>
              </div>
              <div class="flex gap-2 text-[11px] text-on-surface-variant/70 font-mono">
                <span>Gross: ₹{gross.toLocaleString('en-IN')}</span>
                <span>·</span>
                <span>₹{rate.toLocaleString('en-IN')}/kWp</span>
              </div>
            </div>

            <div class="space-y-2 text-xs text-on-surface-variant mb-6">
              <div>
                <span class="font-semibold text-on-surface block">Panels:</span>
                <span>{item.panelBrand} ({item.panelTech})</span>
              </div>
              <div>
                <span class="font-semibold text-on-surface block">Inverter:</span>
                <span>{item.inverterBrand}</span>
              </div>
              <div>
                <span class="font-semibold text-on-surface block">Notes:</span>
                <span class="text-[11px] leading-relaxed">{item.notes}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="w-full py-2.5 rounded-xl border border-outline text-xs font-semibold text-on-surface hover:bg-primary-container hover:text-surface hover:border-primary-container transition-all"
            onclick={() => alert(`Selected benchmark quote for ${item.name} (${selectedKw} kWp)!`)}
          >
            Audit Similar Quote
          </button>
        </div>
      {/each}
    </div>
  </div>
</section>
