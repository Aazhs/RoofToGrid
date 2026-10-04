<script lang="ts">
  const SHOWCASE_ITEMS = [
    {
      id: 'sizing',
      tab: 'Sizing Calculator',
      title: 'Three scenarios, one clear decision',
      description: 'Input your electricity bills and roof details. Get Conservative, Optimal, and Max Roof scenarios — each with cost, subsidy, payback period, and 25-year savings calculated instantly.',
      image: '/showcase/sizing-scenarios.jpg',
      stats: [
        { label: 'Scenarios', value: '3' },
        { label: 'Analysis Period', value: '25 yr' },
        { label: 'Subsidy Cap', value: '₹78K' },
      ],
    },
    {
      id: 'comparison',
      tab: 'Quote Comparison',
      title: 'See through every quote',
      description: 'Enter quotes from any installer. Our engine normalizes them to ₹/kWp, scores equipment quality, checks warranties, and flags suspicious pricing — across 17+ metrics.',
      image: '/showcase/quote-comparison.jpg',
      stats: [
        { label: 'Metrics', value: '17+' },
        { label: 'Red Flags', value: '6 checks' },
        { label: 'Scoring', value: 'Weighted' },
      ],
    },
    {
      id: 'milestones',
      tab: 'Project Tracker',
      title: 'Every milestone, tracked',
      description: 'From initial inquiry to subsidy received — track your solar installation across 9 milestones. Log dates, attach documents, and always know what comes next.',
      image: '/showcase/milestone-tracker.jpg',
      stats: [
        { label: 'Milestones', value: '9' },
        { label: 'Doc Vault', value: 'Private' },
        { label: 'Monitoring', value: 'Monthly' },
      ],
    },
  ];

  let activeTab = $state(0);
  let active = $derived(SHOWCASE_ITEMS[activeTab]);
</script>

<section class="py-10 md:py-16 border-t border-outline-variant/60">
  <div class="max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="mb-8 max-w-2xl">
      <!-- Header -->
      <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3">
        PRODUCT WALKTHROUGH
      </span>
      <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-3">
        See the <span class="font-serif italic text-amber-700 dark:text-amber-400">Live Product</span>
      </h2>
      <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
        Real screens from the deployed platform. Every feature is functional — explore the interactive calculators and quote auditing tools below.
      </p>

      <!-- Tab Switcher -->
      <div class="flex flex-wrap gap-2 mt-6">
        {#each SHOWCASE_ITEMS as item, idx}
          <button
            type="button"
            onclick={() => activeTab = idx}
            class={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === idx
                ? 'bg-on-surface text-surface shadow-sm'
                : 'bg-surface-container border border-outline-variant/70 text-on-surface-variant hover:border-outline hover:text-on-surface'
            }`}
          >
            {item.tab}
          </button>
        {/each}
      </div>
    </div>

      <!-- Content Grid * -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Screenshot * -->
        <div class="lg:col-span-7 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low shadow-sm">
          <div class="relative aspect-[16/10]">
            <img
              src={active.image}
              alt={active.title}
              class="w-full h-full object-cover object-top transition-opacity duration-500"
            />
          </div>
        </div>

        <!-- Details -->
        <div class="lg:col-span-5 flex flex-col justify-center">
          <h3 class="font-serif text-2xl sm:text-3xl font-normal text-on-surface mb-3">
            {active.title}
          </h3>
          <p class="text-sm sm:text-base text-on-surface-variant mb-6 leading-relaxed">
            {active.description}
          </p>

          <!-- Stats Row -->
          <div class="grid grid-cols-3 gap-3">
            {#each active.stats as stat}
              <div class="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5 text-center">
                <p class="font-serif text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {stat.value}
                </p>
                <p class="text-[11px] text-on-surface-variant mt-0.5">
                  {stat.label}
                </p>
              </div>
            {/each}
          </div>
        </div>
      </div>
  </div>
</section>
