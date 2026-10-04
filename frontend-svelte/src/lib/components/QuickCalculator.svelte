<script lang="ts">
  let bill = $state(4500);
  let selectedState = $state('ka');

  const stateTariffs: Record<string, { label: string; tariff: number }> = {
    ka: { label: 'Karnataka / BESCOM (₹7.5/kWh)', tariff: 7.5 },
    mh: { label: 'Maharashtra / MSEDCL (₹8.5/kWh)', tariff: 8.5 },
    gj: { label: 'Gujarat / UGVCL (₹6.0/kWh)', tariff: 6.0 },
    dl: { label: 'Delhi / BSES (₹6.5/kWh)', tariff: 6.5 },
    tn: { label: 'Tamil Nadu / TANGEDCO (₹7.0/kWh)', tariff: 7.0 },
    up: { label: 'Uttar Pradesh / UPPCL (₹7.0/kWh)', tariff: 7.0 },
  };

  let tariff = $derived(stateTariffs[selectedState]?.tariff ?? 7.5);
  let monthlyUnits = $derived(bill / tariff);
  let dailyUnits = $derived(monthlyUnits / 30);
  let rawSize = $derived(dailyUnits / (4.2 * 0.8));
  let systemSizeKw = $derived(Math.max(1, Math.min(15, Math.round(rawSize * 10) / 10)));
  let roofAreaSqFt = $derived(Math.round(systemSizeKw * 100));
  let monthlyGen = $derived(Math.round(systemSizeKw * 4.2 * 30 * 0.8));
  let monthlySavings = $derived(Math.min(bill, Math.round(monthlyGen * tariff)));
  let annualSavings = $derived(monthlySavings * 12);
  let subsidy = $derived(
    systemSizeKw <= 1
      ? 30000
      : systemSizeKw <= 2
        ? 30000 + Math.round((systemSizeKw - 1) * 30000)
        : systemSizeKw <= 3
          ? 60000 + Math.round((systemSizeKw - 2) * 18000)
          : 78000
  );
  let grossCost = $derived(Math.round(systemSizeKw * 65000));
  let netCost = $derived(Math.max(0, grossCost - subsidy));
  let paybackYears = $derived(annualSavings > 0 ? (netCost / annualSavings).toFixed(1) : '—');
</script>

<div class="card calculator-card">
  <div class="header">
    <div>
      <span class="badge badge-amber">⚡ Instant Svelte 5 Reactive Engine</span>
      <h3 class="title">Calculate your rooftop potential</h3>
      <p class="subtitle">
        Zero virtual DOM overhead — adjustments calculate instantaneously.
      </p>
    </div>
  </div>

  <div class="grid-layout">
    <!-- Sliders and Inputs -->
    <div class="controls-col">
      <div class="control-group">
        <div class="label-row">
          <label for="bill-slider">Monthly Electricity Bill</label>
          <span class="value-highlight">₹{bill.toLocaleString('en-IN')}</span>
        </div>
        <input
          id="bill-slider"
          type="range"
          min="1000"
          max="30000"
          step="500"
          bind:value={bill}
          class="slider"
        />
        <div class="slider-marks">
          <span>₹1k</span>
          <span>₹15k</span>
          <span>₹30k</span>
        </div>
      </div>

      <div class="control-group">
        <label for="state-select" class="block-label">State / DISCOM Region</label>
        <select id="state-select" bind:value={selectedState} class="select-input">
          {#each Object.entries(stateTariffs) as [key, data]}
            <option value={key}>{data.label}</option>
          {/each}
        </select>
      </div>

      <div class="info-pill">
        <span>💡 Tariff: <strong>₹{tariff.toFixed(1)}/unit</strong></span>
        <span>Consumption: <strong>{Math.round(monthlyUnits)} kWh/mo</strong></span>
      </div>
    </div>

    <!-- Live Results Display -->
    <div class="results-col">
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Recommended Capacity</span>
          <div class="metric-value">{systemSizeKw} <span class="unit">kWp</span></div>
          <span class="metric-hint">Requires ~{roofAreaSqFt} sq. ft. shade-free roof</span>
        </div>

        <div class="metric-card highlight-green">
          <span class="metric-label">PM Surya Ghar Subsidy</span>
          <div class="metric-value text-emerald">₹{subsidy.toLocaleString('en-IN')}</div>
          <span class="metric-hint">Direct Bank Transfer (DBT) to account</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Net Investment</span>
          <div class="metric-value">₹{netCost.toLocaleString('en-IN')}</div>
          <span class="metric-hint">Gross: ₹{grossCost.toLocaleString('en-IN')}</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Yearly Electricity Savings</span>
          <div class="metric-value text-emerald">₹{annualSavings.toLocaleString('en-IN')}</div>
          <span class="metric-hint">~{paybackYears} years estimated payback</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .calculator-card {
    border: 1px solid var(--border-outline);
    background: var(--bg-surface-card);
    margin: 2rem 0;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0.5rem 0 0.25rem;
    color: var(--text-main);
  }

  .subtitle {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 900px) {
    .grid-layout {
      grid-template-columns: 1fr 1.25fr;
      gap: 2rem;
    }
  }

  .controls-col {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .value-highlight {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .slider {
    width: 100%;
    accent-color: var(--brand-accent);
    cursor: pointer;
  }

  .slider-marks {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-subtle);
  }

  .block-label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .select-input {
    width: 100%;
    padding: 0.625rem;
    border-radius: 0.625rem;
    border: 1px solid var(--border-outline);
    background: var(--bg-surface);
    color: var(--text-main);
    font-size: 0.875rem;
  }

  .info-pill {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: var(--bg-surface-elevated);
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .metric-card {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-outline);
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .metric-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle);
    font-weight: 600;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
  }

  .unit {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .metric-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }

  .text-emerald {
    color: var(--brand-emerald);
  }
</style>
