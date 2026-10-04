<script lang="ts">
  let isExtracting = $state(false);
  let extractedSuccess = $state(false);
  let selectedDiscom = $state('bescom');

  const SAMPLE_BILLS = [
    { month: 'Jan 2026', units: 360, amount: 2880, paid: true },
    { month: 'Feb 2026', units: 390, amount: 3120, paid: true },
    { month: 'Mar 2026', units: 480, amount: 3840, paid: true },
    { month: 'Apr 2026', units: 540, amount: 4320, paid: true },
    { month: 'May 2026', units: 580, amount: 4640, paid: true },
    { month: 'Jun 2026', units: 450, amount: 3600, paid: true },
    { month: 'Jul 2026', units: 410, amount: 3280, paid: true },
    { month: 'Aug 2026', units: 400, amount: 3200, paid: true },
    { month: 'Sep 2026', units: 420, amount: 3360, paid: true },
  ];

  function runExtraction() {
    isExtracting = true;
    extractedSuccess = false;
    setTimeout(() => {
      isExtracting = false;
      extractedSuccess = true;
    }, 700);
  }
</script>

<svelte:head>
  <title>Smart Bill OCR Extractor — RoofToGrid</title>
</svelte:head>

<div class="mx-auto max-w-[1280px] px-4 py-8 md:px-16">
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-2">
      <a href="/dashboard" class="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline">
        ← Back to Dashboard
      </a>
      <span class="text-outline-variant">/</span>
      <span class="text-xs text-on-surface-variant">Bill Intelligence</span>
    </div>
    <h1 class="font-serif text-3xl sm:text-4xl font-normal text-on-surface tracking-tight">
      Smart Bill <span class="font-serif italic text-amber-700 dark:text-amber-400">OCR Extractor</span>
    </h1>
    <p class="mt-1 text-sm text-on-surface-variant max-w-2xl">
      Upload an electricity bill PDF or photo. Our computer vision extracts tariff tiers, sanctioned load, and 12-month consumption to size your solar system accurately.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- LEFT: Upload & Extraction Controls (5 cols) -->
    <div class="lg:col-span-5 space-y-6">
      <div class="rounded-2xl border border-outline-variant/70 bg-surface-container-low p-6 card-hover">
        <h3 class="font-serif text-xl font-normal text-on-surface mb-3">Upload DISCOM Bill</h3>

        <div class="mb-4">
          <label for="discom-select" class="block text-xs font-semibold text-on-surface mb-1.5">Select DISCOM Provider:</label>
          <select
            id="discom-select"
            bind:value={selectedDiscom}
            class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none"
          >
            <option value="bescom">BESCOM (Bangalore, Karnataka)</option>
            <option value="msedcl">MSEDCL (Maharashtra State)</option>
            <option value="bses">BSES Rajdhani (Delhi NCR)</option>
            <option value="ugvcl">UGVCL / GUVNL (Gujarat)</option>
            <option value="tangedco">TANGEDCO (Tamil Nadu)</option>
            <option value="uppcl">UPPCL (Uttar Pradesh)</option>
          </select>
        </div>

        <!-- Dropzone Box -->
        <div class="rounded-xl border-2 border-dashed border-outline-variant/80 bg-surface-container-lowest/80 p-8 text-center transition-all hover:border-amber-600/50">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
              <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-semibold text-on-surface">Click to upload or drag &amp; drop</p>
          <p class="text-[11px] text-on-surface-variant mt-1">PDF, JPG, PNG (up to 10 MB)</p>
          <button
            type="button"
            onclick={runExtraction}
            disabled={isExtracting}
            class="mt-4 rounded-xl bg-on-surface px-5 py-2.5 text-xs font-semibold text-surface hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            {isExtracting ? 'Analyzing with CV...' : 'Run Demo OCR Extraction'}
          </button>
        </div>
      </div>

      {#if extractedSuccess}
        <!-- Extracted Data Card -->
        <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 animate-fade-in card-hover">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span>✓</span> OCR Extracted Successfully
            </span>
            <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
              98.4% Confidence
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-emerald-500/20">
              <span class="text-on-surface-variant">Consumer No:</span>
              <span class="font-mono font-semibold text-on-surface">BES-84920412-K</span>
            </div>
            <div class="flex justify-between py-1 border-b border-emerald-500/20">
              <span class="text-on-surface-variant">Sanctioned Load:</span>
              <span class="font-mono font-semibold text-on-surface">5.0 kW (Single Phase)</span>
            </div>
            <div class="flex justify-between py-1 border-b border-emerald-500/20">
              <span class="text-on-surface-variant">Latest Monthly Units:</span>
              <span class="font-mono font-semibold text-on-surface">420 kWh</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-on-surface-variant">Effective Tariff:</span>
              <span class="font-mono font-semibold text-on-surface">₹7.80 / kWh</span>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- RIGHT: 12-Month Baseline Table (7 cols) -->
    <div class="lg:col-span-7 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm card-hover">
      <div class="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-4">
        <div>
          <h3 class="font-serif text-xl font-normal text-on-surface">12-Month Consumption Baseline</h3>
          <p class="text-xs text-on-surface-variant">Average: 450 kWh/mo · ₹3,560 avg bill</p>
        </div>
        <span class="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Recommends 5 kWp
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-outline-variant/50 text-on-surface-variant uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-2.5">Billing Month</th>
              <th class="py-2.5">Units (kWh)</th>
              <th class="py-2.5">Amount (₹)</th>
              <th class="py-2.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/30">
            {#each SAMPLE_BILLS as b}
              <tr class="hover:bg-surface-container-low/60 transition-colors">
                <td class="py-2.5 font-medium text-on-surface">{b.month}</td>
                <td class="py-2.5 font-mono">{b.units}</td>
                <td class="py-2.5 font-mono font-semibold text-on-surface">₹{b.amount}</td>
                <td class="py-2.5">
                  <span class="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Verified
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
