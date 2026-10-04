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

<section class="py-20 md:py-32">
  <div class="max-w-[1280px] mx-auto px-4 md:px-16">
    <div>
      <!-- Header * -->
      <span class="text-label-sm text-outline uppercase tracking-widest mb-4 block font-jakarta">
        PRODUCT WALKTHROUGH
      </span>
      <h2 class="text-headline-lg md:text-display-lg font-semibold text-on-surface mb-4 font-jakarta">
        See the live product.
      </h2>
      <p class="text-body-lg text-on-surface-variant mb-10 max-w-2xl font-jakarta">
        Real screens from the deployed platform. Every feature is functional — try the prototype pass on the Pricing section to explore Pro features yourself.
      </p>

      <!-- Tab Switcher * -->
      <div class="flex flex-wrap gap-2 mb-10">
        {#each SHOWCASE_ITEMS as item, idx}
          <button
            type="button"
            onclick={() => activeTab = idx}
            class={`px-5 py-2.5 rounded-full text-sm font-semibold font-jakarta transition-all duration-200 ${
              activeTab === idx
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary-container'
            }`}
          >
            {item.tab}
          </button>
        {/each}
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

        <!-- Details * -->
        <div class="lg:col-span-5 flex flex-col justify-center">
          <h3 class="text-headline-sm md:text-headline-lg font-semibold text-on-surface mb-4 font-jakarta">
            {active.title}
          </h3>
          <p class="text-body-md text-on-surface-variant font-jakarta mb-8">
            {active.description}
          </p>

          <!-- Stats Row * -->
          <div class="grid grid-cols-3 gap-4">
            {#each active.stats as stat}
              <div class="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-center">
                <p class="font-mono text-lg font-bold text-primary-container">
                  {stat.value}
                </p>
                <p class="text-xs text-on-surface-variant mt-1">
                  {stat.label}
                </p>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
