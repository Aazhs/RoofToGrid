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
    {
      id: 'local-empaneled',
      name: 'DISCOM Empaneled Local Vendor',
      tier: 'State Portal Empaneled EPC',
      baseRatePerKwp: 52000,
      panelTech: 'Polycrystalline / Mono PERC',
      panelBrand: 'Vikram / Goldi Solar 450W',
      inverterBrand: 'Microtek / Usha Shriram',
      transparencyScore: 7.2,
      bestForBadge: 'Lowest Upfront Capital Outlay',
      notes: 'Verify itemized breakdown before paying token advance; check net-metering timeline.',
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

<section id="installers" class="installer-section">
  <div class="container">
    <div class="section-header">
      <div class="badge-pill">
        <span>📊 Nationwide EPC Price Intelligence</span>
      </div>
      <h2 class="section-title">Transparent Indian Solar Rate Comparison</h2>
      <p class="section-subtitle">
        Indian solar EPC rates vary wildly between ₹52,000/kWp and ₹82,000/kWp. Compare actual market quotes,
        equipment warranties, and net costs after PM Surya Ghar ₹78,000 DBT subsidy.
      </p>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <div class="control-item">
        <label for="installer-region-select">Select State / DISCOM:</label>
        <select id="installer-region-select" bind:value={selectedRegion} class="select-box">
          {#each Object.entries(REGIONS) as [key, reg]}
            <option value={key}>{reg.label}</option>
          {/each}
        </select>
      </div>

      <div class="control-item">
        <label for="installer-capacity-select">System Capacity:</label>
        <div class="btn-group">
          {#each [1, 2, 3, 5, 8, 10] as kw}
            <button
              type="button"
              class="kw-btn {selectedKw === kw ? 'active' : ''}"
              onclick={() => selectedKw = kw}
            >
              {kw} kWp
            </button>
          {/each}
        </div>
      </div>

      <div class="subsidy-pill">
        <span class="sub-label">Central DBT Subsidy:</span>
        <span class="sub-amount">₹{subsidy.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <!-- Installer Comparison Cards -->
    <div class="installers-grid">
      {#each INSTALLERS as item}
        {@const rate = Math.round(item.baseRatePerKwp * regionMultiplier)}
        {@const gross = rate * selectedKw}
        {@const net = Math.max(0, gross - subsidy)}
        <div class="card installer-card">
          <div class="card-head">
            <span class="badge-best">{item.bestForBadge}</span>
            <div class="transparency-score">
              <span>★ {item.transparencyScore}/10 Transparency</span>
            </div>
          </div>

          <h3 class="installer-name">{item.name}</h3>
          <span class="installer-tier">{item.tier}</span>

          <div class="price-box">
            <div class="price-row">
              <span class="price-label">Net Cost (Post-Subsidy):</span>
              <span class="price-val text-emerald">₹{net.toLocaleString('en-IN')}</span>
            </div>
            <div class="price-breakdown">
              <span>Gross: ₹{gross.toLocaleString('en-IN')}</span>
              <span>·</span>
              <span>₹{rate.toLocaleString('en-IN')}/kWp</span>
            </div>
          </div>

          <div class="specs-list">
            <div class="spec-row">
              <span class="spec-name">Panels:</span>
              <span class="spec-val">{item.panelBrand} ({item.panelTech})</span>
            </div>
            <div class="spec-row">
              <span class="spec-name">Inverter:</span>
              <span class="spec-val">{item.inverterBrand}</span>
            </div>
            <div class="spec-row">
              <span class="spec-name">Notes:</span>
              <span class="spec-val">{item.notes}</span>
            </div>
          </div>

          <button
            class="btn-select"
            onclick={() => alert(`Selected benchmark quote for ${item.name} (${selectedKw} kWp)!`)}
          >
            Audit Similar Quote
          </button>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .installer-section {
    padding: 4.5rem 0;
  }

  .section-header {
    text-align: center;
    max-width: 760px;
    margin: 0 auto 2.5rem;
  }

  .badge-pill {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    background: rgba(217, 119, 6, 0.1);
    color: var(--brand-amber);
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-main);
    margin-bottom: 0.75rem;
  }

  .section-subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .controls-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    padding: 1.25rem 1.5rem;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-outline);
    border-radius: 1rem;
    margin-bottom: 2rem;
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .select-box {
    padding: 0.45rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-outline);
    background: var(--bg-surface);
    color: var(--text-main);
    font-size: 0.875rem;
  }

  .btn-group {
    display: flex;
    gap: 0.25rem;
  }

  .kw-btn {
    padding: 0.4rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-outline);
    background: var(--bg-surface);
    color: var(--text-muted);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .kw-btn.active {
    background: var(--brand-primary);
    color: var(--bg-surface);
    border-color: var(--brand-primary);
  }

  .subsidy-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.9rem;
    border-radius: 9999px;
    background: rgba(5, 150, 105, 0.1);
    color: var(--brand-emerald);
    font-size: 0.875rem;
  }

  .sub-label {
    font-weight: 500;
  }

  .sub-amount {
    font-weight: 800;
  }

  .installers-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .installers-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1100px) {
    .installers-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .installer-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .badge-best {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 0.375rem;
    background: rgba(2, 132, 199, 0.1);
    color: var(--brand-accent);
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .transparency-score {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--brand-amber);
    white-space: nowrap;
  }

  .installer-name {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1.25;
  }

  .installer-tier {
    font-size: 0.75rem;
    color: var(--text-subtle);
    margin-top: -0.5rem;
  }

  .price-box {
    padding: 0.85rem;
    border-radius: 0.75rem;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-outline);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .price-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .price-val {
    font-size: 1.375rem;
    font-weight: 800;
  }

  .price-breakdown {
    display: flex;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-subtle);
  }

  .specs-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.8125rem;
  }

  .spec-row {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .spec-name {
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .spec-val {
    color: var(--text-main);
  }

  .btn-select {
    margin-top: auto;
    width: 100%;
    padding: 0.625rem;
    border-radius: 0.625rem;
    border: 1px solid var(--border-outline);
    background: var(--bg-surface);
    color: var(--text-main);
    font-weight: 600;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-select:hover {
    background: var(--brand-primary);
    color: var(--bg-surface);
    border-color: var(--brand-primary);
  }

  .text-emerald {
    color: var(--brand-emerald);
  }
</style>
