<script lang="ts">
  const comparisons = [
    {
      feature: 'Finding installers',
      without: 'Google and hope for the best',
      with: 'Structured quote entry for any installer',
    },
    {
      feature: 'Comparing quotes',
      without: 'Spreadsheets and confusion',
      with: 'Auto-normalized ₹/kWp comparison',
    },
    {
      feature: 'Subsidy calculation',
      without: 'Visit 5 government websites',
      with: 'PM Surya Ghar auto-calculated',
    },
    {
      feature: 'Project tracking',
      without: 'WhatsApp message chaos',
      with: '9-milestone visual tracker',
    },
    {
      feature: 'Performance monitoring',
      without: 'Trust the installer blindly',
      with: 'Monthly generation vs projection tracking',
    },
  ];
</script>

<section class="py-10 md:py-16 max-w-[1280px] mx-auto px-4 md:px-16 border-t border-outline-variant/60">
  <div class="mb-8 max-w-2xl">
    <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3">
      TRANSPARENCY AUDIT
    </span>
    <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-3">
      Why RoofToGrid <span class="font-serif italic text-amber-700 dark:text-amber-400">Exists</span>
    </h2>
    <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
      The traditional way to go solar in India is broken — opaque pricing, confusing subsidy math, and no standardized comparison. We built RoofToGrid to put homeowners back in control.
    </p>
  </div>

  <div class="w-full rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/80 p-4 sm:p-6 shadow-sm overflow-hidden">
    <!-- Header Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b border-outline-variant/40 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
      <div class="hidden md:block">Feature</div>
      <div class="hidden md:block">Without RoofToGrid</div>
      <div class="hidden md:block">With RoofToGrid</div>
    </div>

    <!-- Rows -->
    {#each comparisons as row, index}
      <div 
        style={`transition-delay: ${index * 80}ms;`}
        class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 py-4 border-b border-outline-variant/30 last:border-b-0 text-sm transition-all duration-300"
      >
        <div class="font-medium text-on-surface flex items-center">
          {row.feature}
        </div>
        <div class="text-on-surface-variant/70 flex items-center gap-2">
          <span class="text-rose-500 font-bold text-base">✕</span> {row.without}
        </div>
        <div class="text-on-surface flex items-center gap-2 font-medium">
          <span class="text-emerald-600 font-bold text-base">✓</span> {row.with}
        </div>
      </div>
    {/each}
  </div>
</section>
