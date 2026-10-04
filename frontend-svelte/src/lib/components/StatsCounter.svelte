<script lang="ts">
  import { onMount } from 'svelte';

  let count1 = $state(0);
  let count2 = $state(0);
  let count3 = $state(0);
  let count4 = $state(0);

  onMount(() => {
    let startTime: number;
    const duration = 1800;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      // Smooth quintic ease-out for natural deceleration
      const easeOutQuint = 1 - Math.pow(1 - percentage, 5);

      count1 = Math.floor(easeOutQuint * 3);
      count2 = Math.floor(easeOutQuint * 17);
      count3 = Math.floor(easeOutQuint * 6);
      count4 = Math.floor(easeOutQuint * 9);

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  });

  const TECH_STACK = [
    {
      name: 'Svelte 5',
      desc: 'Native Runes · Zero VDOM',
      iconColor: 'text-orange-500 dark:text-orange-400',
      badgeBg: 'bg-orange-500/10 border-orange-500/20',
      tag: 'UI Engine',
    },
    {
      name: 'Go Engine',
      desc: '<400µs Sizing Binary',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/20',
      tag: 'Backend',
    },
    {
      name: 'Supabase',
      desc: 'PostgreSQL & Vault',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
      tag: 'Storage',
    },
    {
      name: 'Tailwind CSS',
      desc: 'Lumina Grid Tokens',
      iconColor: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/20',
      tag: 'Styles',
    },
    {
      name: 'PM Surya Ghar',
      desc: '₹78,000 DBT Verified',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20',
      tag: 'Compliance',
    },
  ];

  const JOURNEY_STEPS = [
    { num: '01', title: 'Plan & Size', desc: 'Rooftop & Balcony AI' },
    { num: '02', title: 'Quote Audit', desc: 'Normalized ₹/kWp Analysis' },
    { num: '03', title: '9 Milestones', desc: 'Liaison & Net-Metering' },
    { num: '04', title: 'Telemetry', desc: 'Generation vs Projection' },
  ];
</script>

<section class="py-5 md:py-8 border-y border-outline-variant/60 bg-surface-container-lowest/60 overflow-hidden">
  <div class="max-w-[1280px] mx-auto px-4 md:px-16">
    <!-- Top 4 Core Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
      <div class="py-2 px-3 rounded-xl transition-all duration-300 hover:bg-surface-container-low/50 card-hover">
        <div class="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-on-surface mb-0.5">
          {count1}
        </div>
        <div class="text-xs sm:text-[13px] font-semibold text-on-surface">
          Sizing Scenarios
        </div>
        <div class="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">
          Conservative · Optimal · Max Roof
        </div>
      </div>

      <div class="py-2 px-3 rounded-xl transition-all duration-300 hover:bg-surface-container-low/50 card-hover">
        <div class="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-on-surface mb-0.5">
          {count2}+
        </div>
        <div class="text-xs sm:text-[13px] font-semibold text-on-surface">
          Comparison Metrics
        </div>
        <div class="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">
          Normalized quote analysis
        </div>
      </div>

      <div class="py-2 px-3 rounded-xl transition-all duration-300 hover:bg-surface-container-low/50 card-hover">
        <div class="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-on-surface mb-0.5">
          {count3}
        </div>
        <div class="text-xs sm:text-[13px] font-semibold text-on-surface">
          Red Flag Checks
        </div>
        <div class="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">
          Automated quote screening
        </div>
      </div>

      <div class="py-2 px-3 rounded-xl transition-all duration-300 hover:bg-surface-container-low/50 card-hover">
        <div class="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-on-surface mb-0.5">
          {count4}
        </div>
        <div class="text-xs sm:text-[13px] font-semibold text-on-surface">
          Project Milestones
        </div>
        <div class="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">
          Inquiry to commissioning
        </div>
      </div>
    </div>

    <!-- Solar Journey Pipeline Boxes -->
    <div class="mt-5 border-t border-outline-variant/40 pt-4">
      <div class="flex items-center justify-between mb-2.5 px-1">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
          Integrated Solar Journey
        </span>
        <span class="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
          4 Coordinated Stages →
        </span>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {#each JOURNEY_STEPS as step}
          <div class="flex items-center gap-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/80 p-2.5 card-hover">
            <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 font-serif text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
              {step.num}
            </span>
            <div class="min-w-0">
              <div class="text-xs font-semibold text-on-surface truncate">
                {step.title}
              </div>
              <div class="text-[10px] text-on-surface-variant truncate">
                {step.desc}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Modern Architecture & Tech Stack Chip Boxes -->
    <div class="mt-5 border-t border-outline-variant/40 pt-4">
      <div class="flex items-center justify-between mb-3 px-1">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/80">
            Verified Foundations &amp; Stack
          </span>
        </div>
        <span class="text-[11px] text-on-surface-variant/70 font-mono">
          Go Binary + Svelte 5 + Supabase
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {#each TECH_STACK as tech}
          <div class="group relative flex flex-col justify-between rounded-xl border border-outline-variant/60 bg-surface-container-low/70 p-2.5 sm:p-3 card-hover hover:border-amber-500/40 hover:bg-surface-container-low transition-all duration-300 shadow-sm">
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${tech.badgeBg}`}>
                    {#if tech.name.includes('Svelte')}
                      <svg class={`h-3.5 w-3.5 ${tech.iconColor}`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    {:else if tech.name.includes('Go')}
                      <svg class={`h-3.5 w-3.5 ${tech.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    {:else if tech.name.includes('Supabase')}
                      <svg class={`h-3.5 w-3.5 ${tech.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      </svg>
                    {:else if tech.name.includes('Tailwind')}
                      <svg class={`h-3.5 w-3.5 ${tech.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                      </svg>
                    {:else}
                      <svg class={`h-3.5 w-3.5 ${tech.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    {/if}
                  </div>
                  <span class="text-xs font-bold text-on-surface">
                    {tech.name}
                  </span>
                </div>
                <span class={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider border ${tech.badgeBg} ${tech.iconColor}`}>
                  {tech.tag}
                </span>
              </div>
              <div class="text-[11px] text-on-surface-variant leading-snug">
                {tech.desc}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
