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

<section class="py-20 md:py-32 max-w-[1280px] mx-auto px-4 md:px-16">
  <div>
    <h2 class="text-headline-lg md:text-display-lg font-semibold mb-4 font-jakarta">Why RoofToGrid Exists</h2>
    <p class="text-body-lg text-on-surface-variant mb-12 max-w-2xl">
      The traditional way to go solar in India is broken — opaque pricing, confusing subsidy math, and no standardized comparison. We built RoofToGrid to put homeowners back in control.
    </p>
  </div>

  <div class="w-full">
    <!-- Header Row * -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-surface-container-high text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
      <div class="hidden md:block">Feature</div>
      <div class="hidden md:block">Without RoofToGrid</div>
      <div class="hidden md:block">With RoofToGrid</div>
    </div>

    <!-- Rows * -->
    {#each comparisons as row, index}
      <div 
        style={`transition-delay: ${index * 100}ms;`}
        class="grid grid-cols-1 md:grid-cols-3 gap-4 py-5 border-b border-surface-container-high transition-all duration-700"
      >
        <div class="font-semibold text-on-surface md:text-body-lg mb-2 md:mb-0 flex items-center">
          {row.feature}
        </div>
        <div class="text-on-surface-variant/60 flex items-center gap-2">
          <span class="text-error font-bold text-lg">✗</span> {row.without}
        </div>
        <div class="text-on-surface flex items-center gap-2">
          <span class="text-primary-container font-bold text-lg">✓</span> {row.with}
        </div>
      </div>
    {/each}
  </div>
</section>
