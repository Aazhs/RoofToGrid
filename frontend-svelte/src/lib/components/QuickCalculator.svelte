<script lang="ts">
  import { i18n } from '#lib';

  const STATE_TARIFFS: Record<string, { label: string; tariff: number }> = {
    national: { label: 'National Average (₹7.2/kWh)', tariff: 7.2 },
    ka: { label: 'Karnataka / BESCOM (₹7.5/kWh)', tariff: 7.5 },
    mh: { label: 'Maharashtra / MSEDCL (₹8.5/kWh)', tariff: 8.5 },
    dl: { label: 'Delhi / BSES (₹6.5/kWh)', tariff: 6.5 },
    gj: { label: 'Gujarat / UGVCL (₹6.0/kWh)', tariff: 6.0 },
    tn: { label: 'Tamil Nadu / TANGEDCO (₹7.0/kWh)', tariff: 7.0 },
    up: { label: 'Uttar Pradesh / UPPCL (₹7.0/kWh)', tariff: 7.0 },
  };

  let bill = $state(4500);
  let selectedState = $state('national');

  let tariff = $derived(STATE_TARIFFS[selectedState]?.tariff ?? 7.2);
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
  let netCost = $derived(Math.max(15000, grossCost - subsidy));
  let paybackYears = $derived(annualSavings > 0 ? (netCost / annualSavings).toFixed(1) : '—');
</script>

<section 
  id="quick-calculator" 
  class="py-10 md:py-16 bg-surface-container-low border-b border-outline-variant/60 relative overflow-hidden"
>
  <!-- Background ambient gradient -->
  <div class="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>

  <div class="max-w-[1280px] mx-auto px-4 md:px-16 relative z-10">
    
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto mb-10">
      <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3">
        {i18n.current !== 'en' ? i18n.t('hero_badge') : 'INSTANT ESTIMATOR · NO SIGNUP NEEDED'}
      </span>
      <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-3">
        {i18n.current !== 'en' ? i18n.t('calc_title') : "Calculate Your Roof's "}
        {#if i18n.current === 'en'}
          <span class="font-serif italic text-amber-700 dark:text-amber-400">True Potential</span>
        {/if}
      </h2>
      <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
        {i18n.current !== 'en'
          ? i18n.t('calc_subtitle')
          : 'Adjust your current monthly electricity bill to see your recommended solar capacity, central government subsidy, and estimated savings under PM Surya Ghar.'}
      </p>
    </div>

    <!-- Interactive Calculator Grid * -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Controls Card * -->
      <div class="lg:col-span-5 bg-surface-container border border-outline-variant/70 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 class="text-lg font-semibold text-on-surface mb-6 font-jakarta flex items-center justify-between">
          <span>{i18n.current !== 'en' ? i18n.t('calc_monthly_bill') : 'Your Energy Usage'}</span>
          <span class="text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
            Live Model
          </span>
        </h3>

        <!-- Bill Slider * -->
        <div class="mb-8">
          <div class="flex justify-between items-baseline mb-3">
            <label for="bill-slider" class="text-sm font-medium text-on-surface">
              {i18n.current !== 'en' ? i18n.t('calc_monthly_bill') : 'Average Monthly Electricity Bill'}
            </label>
            <span class="text-2xl font-bold text-on-surface font-jakarta">
              ₹{bill.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            id="bill-slider"
            type="range"
            min="1000"
            max="20000"
            step="500"
            bind:value={bill}
            class="w-full h-2.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-on-surface focus:outline-none"
          />
          <div class="flex justify-between text-xs text-on-surface-variant/60 mt-2 font-mono">
            <span>₹1,000</span>
            <span>₹10,000</span>
            <span>₹20,000+</span>
          </div>
        </div>

        <!-- State / DISCOM Selector * -->
        <div class="mb-6">
          <label for="state-select" class="block text-sm font-medium text-on-surface mb-2">
            Tariff Region
          </label>
          <select
            id="state-select"
            bind:value={selectedState}
            class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
          >
            {#each Object.entries(STATE_TARIFFS) as [key, item]}
              <option value={key}>
                {item.label}
              </option>
            {/each}
          </select>
        </div>

        <!-- Monthly units estimated * -->
        <div class="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 flex items-center justify-between text-sm">
          <span class="text-on-surface-variant">Estimated Monthly Consumption</span>
          <span class="font-semibold text-on-surface font-mono">
            {Math.round(monthlyUnits)} kWh (units)
          </span>
        </div>

        <p class="mt-6 text-xs text-on-surface-variant/60 leading-relaxed">
          Estimates adhere to MNRE standards (IN_2026_07) assuming standard crystalline PV panels (0.5%/yr degradation) with net-metering solar export.
        </p>
      </div>

      <!-- Results Display * -->
      <div class="lg:col-span-7 flex flex-col gap-6">
        
        <!-- Top 2 Key Metrics * -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <!-- Sizing & Area * -->
          <div class="bg-surface-container border border-outline-variant/70 rounded-2xl p-6 relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Recommended System</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium border border-emerald-500/20">
                Optimal Sizing
              </span>
            </div>
            <div class="text-3xl md:text-4xl font-bold text-on-surface font-jakarta mb-1">
              {systemSizeKw} <span class="text-xl font-normal text-on-surface-variant">kWp</span>
            </div>
            <div class="text-xs text-on-surface-variant mt-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor">
                <path d="M120-120v-720h720v720H120Zm80-80h560v-560H200v560Z"/>
              </svg>
              Requires ~{roofAreaSqFt} sq. ft. shade-free roof
            </div>
          </div>

          <!-- PM Surya Ghar Subsidy * -->
          <div class="bg-surface-container border border-outline-variant/70 rounded-2xl p-6 relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Govt Subsidy (DBT)</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20">
                PM Surya Ghar
              </span>
            </div>
            <div class="text-3xl md:text-4xl font-bold text-on-surface font-jakarta mb-1">
              ₹{subsidy.toLocaleString('en-IN')}
            </div>
            <div class="text-xs text-on-surface-variant mt-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor">
                <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Z"/>
              </svg>
              Direct credit into homeowner bank account
            </div>
          </div>

        </div>

        <!-- Bottom 3 Detailed Metrics * -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <!-- Annual Savings * -->
          <div class="bg-surface-container border border-outline-variant/70 rounded-xl p-5">
            <span class="text-xs text-on-surface-variant font-medium block mb-1">Annual Savings</span>
            <span class="text-2xl font-bold text-on-surface font-jakarta">
              ₹{annualSavings.toLocaleString('en-IN')}
            </span>
            <span class="text-xs text-on-surface-variant/70 block mt-1">
              ~₹{monthlySavings.toLocaleString('en-IN')}/mo bill cut
            </span>
          </div>

          <!-- Net Investment * -->
          <div class="bg-surface-container border border-outline-variant/70 rounded-xl p-5">
            <span class="text-xs text-on-surface-variant font-medium block mb-1">Est. Net Out-of-Pocket</span>
            <span class="text-2xl font-bold text-on-surface font-jakarta">
              ₹{netCost.toLocaleString('en-IN')}
            </span>
            <span class="text-xs text-on-surface-variant/70 block mt-1 line-through">
              ₹{grossCost.toLocaleString('en-IN')} gross
            </span>
          </div>

          <!-- Payback * -->
          <div class="bg-surface-container border border-outline-variant/70 rounded-xl p-5">
            <span class="text-xs text-on-surface-variant font-medium block mb-1">Payback Period</span>
            <span class="text-2xl font-bold text-on-surface font-jakarta">
              {paybackYears} <span class="text-base font-normal">Years</span>
            </span>
            <span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
              +21 yrs free power
            </span>
          </div>

        </div>

        <!-- Call to Action Banner * -->
        <div class="bg-surface-container-high/80 border border-outline-variant rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 class="text-base font-semibold text-on-surface font-jakarta">
              Want the full 25-year financial breakdown?
            </h4>
            <p class="text-xs text-on-surface-variant mt-1">
              Includes 3 sizing scenarios (Conservative, Optimal, Max Roof), loan amortization, and 3 quotes comparison.
            </p>
          </div>

          <a
            href="/dashboard"
            class="whitespace-nowrap rounded-xl bg-primary-container text-surface px-6 py-3.5 text-sm font-semibold hover:bg-surface-tint transition-all duration-200 inline-flex items-center gap-2 shadow-sm"
          >
            <span>{i18n.current !== 'en' ? i18n.t('calc_cta') : 'Generate Official Report →'}</span>
          </a>
        </div>

      </div>

    </div>

  </div>
</section>
