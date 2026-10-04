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

<section class="py-20 md:py-24 border-y border-outline-variant bg-surface-container-lowest overflow-hidden">
  <div class="max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="text-center font-jakarta">
        <div class="text-[40px] md:text-[48px] font-bold text-on-surface mb-2">
          {count1}
        </div>
        <div class="text-sm font-semibold text-on-surface mb-1">
          Sizing Scenarios
        </div>
        <div class="text-xs text-on-surface-variant">
          Conservative · Optimal · Max Roof
        </div>
      </div>

      <div class="text-center font-jakarta">
        <div class="text-[40px] md:text-[48px] font-bold text-on-surface mb-2">
          {count2}+
        </div>
        <div class="text-sm font-semibold text-on-surface mb-1">
          Comparison Metrics
        </div>
        <div class="text-xs text-on-surface-variant">
          Normalized quote analysis
        </div>
      </div>

      <div class="text-center font-jakarta">
        <div class="text-[40px] md:text-[48px] font-bold text-on-surface mb-2">
          {count3}
        </div>
        <div class="text-sm font-semibold text-on-surface mb-1">
          Red Flag Checks
        </div>
        <div class="text-xs text-on-surface-variant">
          Automated quote screening
        </div>
      </div>

      <div class="text-center font-jakarta">
        <div class="text-[40px] md:text-[48px] font-bold text-on-surface mb-2">
          {count4}
        </div>
        <div class="text-sm font-semibold text-on-surface mb-1">
          Project Milestones
        </div>
        <div class="text-xs text-on-surface-variant">
          Inquiry to commissioning
        </div>
      </div>
    </div>
  </div>

  <div class="mt-12 max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
      <div class="flex items-center gap-3 text-sm text-on-surface-variant/60">
        <span>Plan</span>
        <span class="text-primary-container">→</span>
        <span>Compare</span>
        <span class="text-primary-container">→</span>
        <span>Track</span>
        <span class="text-primary-container">→</span>
        <span>Monitor</span>
      </div>
      <span class="hidden sm:block mx-3 text-outline-variant">|</span>
      <span class="text-sm text-primary-container/80">Your complete solar journey</span>
    </div>
  </div>

  <!-- Technology & credibility strip * -->
  <div class="mt-10 max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-on-surface-variant/50 font-medium uppercase tracking-wider">
      <span>SvelteKit 5</span>
      <span class="text-outline-variant/30">·</span>
      <span>Go Binary (&lt;400µs)</span>
      <span class="text-outline-variant/30">·</span>
      <span>Supabase</span>
      <span class="text-outline-variant/30">·</span>
      <span>Tailwind CSS</span>
      <span class="text-outline-variant/30">·</span>
      <span>Vercel</span>
      <span class="text-outline-variant/30">·</span>
      <span>Render</span>
    </div>
  </div>
</section>
