<script lang="ts">
  import { onMount } from 'svelte';

  let count1 = $state(0);
  let count2 = $state(0);
  let count3 = $state(0);
  let count4 = $state(0);

  onMount(() => {
    let startTime: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);

      count1 = Math.floor(easeOutQuart * 3);
      count2 = Math.floor(easeOutQuart * 17);
      count3 = Math.floor(easeOutQuart * 6);
      count4 = Math.floor(easeOutQuart * 9);

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  });
</script>

<section class="py-8 md:py-10 border-y border-outline-variant/60 bg-surface-container-lowest/60 overflow-hidden">
  <div class="max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div class="p-3">
        <div class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface mb-1">
          {count1}
        </div>
        <div class="text-xs sm:text-sm font-semibold text-on-surface">
          Sizing Scenarios
        </div>
        <div class="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
          Conservative · Optimal · Max Roof
        </div>
      </div>

      <div class="p-3">
        <div class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface mb-1">
          {count2}+
        </div>
        <div class="text-xs sm:text-sm font-semibold text-on-surface">
          Comparison Metrics
        </div>
        <div class="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
          Normalized quote analysis
        </div>
      </div>

      <div class="p-3">
        <div class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface mb-1">
          {count3}
        </div>
        <div class="text-xs sm:text-sm font-semibold text-on-surface">
          Red Flag Checks
        </div>
        <div class="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
          Automated quote screening
        </div>
      </div>

      <div class="p-3">
        <div class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface mb-1">
          {count4}
        </div>
        <div class="text-xs sm:text-sm font-semibold text-on-surface">
          Project Milestones
        </div>
        <div class="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
          Inquiry to commissioning
        </div>
      </div>
    </div>
  </div>

  <div class="mt-6 max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs text-on-surface-variant/70">
      <div class="flex items-center gap-2">
        <span>Plan</span>
        <span class="text-amber-600 dark:text-amber-400">→</span>
        <span>Compare</span>
        <span class="text-amber-600 dark:text-amber-400">→</span>
        <span>Track</span>
        <span class="text-amber-600 dark:text-amber-400">→</span>
        <span>Monitor</span>
      </div>
      <span class="hidden sm:inline text-outline-variant/40">·</span>
      <span class="font-medium text-on-surface">Complete Solar Journey</span>
    </div>
  </div>

  <!-- Tech credibility strip -->
  <div class="mt-4 max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-on-surface-variant/50 font-medium uppercase tracking-wider">
      <span>SvelteKit 5</span>
      <span class="text-outline-variant/30">·</span>
      <span>Go Engine (&lt;400µs)</span>
      <span class="text-outline-variant/30">·</span>
      <span>Supabase Storage</span>
      <span class="text-outline-variant/30">·</span>
      <span>Tailwind CSS</span>
      <span class="text-outline-variant/30">·</span>
      <span>PM Surya Ghar Verified</span>
    </div>
  </div>
</section>
