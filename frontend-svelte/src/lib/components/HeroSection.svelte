<script lang="ts">
  import { i18n } from '#lib';
</script>

<section class="relative mx-auto max-w-[1280px] px-4 pt-6 md:pt-10 pb-10 md:pb-14 overflow-hidden">
  <!-- Subtle aetheric ambient solar glow centered behind the hero -->
  <div
    class="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-72 w-full max-w-4xl bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl rounded-full"
    aria-hidden="true"
  ></div>

  <div class="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
    <!-- LEFT column: 7 cols for balanced editorial breathing room -->
    <div class="lg:col-span-7 animate-fade-in" style="animation-delay: 50ms;">
      <!-- Live product badge with gentle pulse -->
      <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-600/20 bg-amber-500/5 px-3.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        {i18n.current !== 'en' ? i18n.t('hero_badge') : 'Live Product · Free to Start · PM Surya Ghar Muft Bijli'}
      </div>

      <!-- Anthropic-style editorial headline -->
      <h1 class="font-serif text-4xl sm:text-5xl lg:text-[56px] leading-[1.12] tracking-tight font-normal text-on-surface">
        Your Roof. <span class="font-sans font-semibold">Your Power.</span><br />
        <span class="font-serif italic text-amber-700 dark:text-amber-400">Your Savings.</span>
      </h1>

      <p class="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-on-surface-variant">
        {i18n.current !== 'en'
          ? i18n.t('hero_subhead')
          : "India's independent rooftop solar planning platform. Size your system, compare installer quotes fairly, and track your installation end-to-end — with PM Surya Ghar subsidies calculated automatically."}
      </p>

      <!-- Action buttons with micro-interaction hover -->
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="/dashboard"
          class="rounded-xl bg-on-surface px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-surface shadow-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] card-hover"
        >
          {i18n.current !== 'en' ? i18n.t('hero_cta_primary') : "Start Planning — It's Free →"}
        </a>
        <a
          href="#how-it-works"
          class="rounded-xl border border-outline-variant/80 bg-surface/60 backdrop-blur-sm px-6 py-3.5 text-center text-sm font-semibold text-on-surface transition-all duration-200 hover:bg-surface-container hover:border-outline card-hover"
        >
          How It Works
        </a>
      </div>

      <!-- Live social proof ticker -->
      <div class="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
        <span>
          <strong class="font-semibold text-on-surface">1,480+ homeowners</strong> modeled their roof this month · ₹2.1 Cr subsidies unlocked
        </span>
      </div>

      <!-- Symmetrical trust pills -->
      <div class="mt-6 flex flex-wrap items-center gap-2.5 border-t border-outline-variant/40 pt-5">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant card-hover">
          <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor" class="text-amber-600 dark:text-amber-400"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-43-61v-82q-35 0-59.5-24.5T353-307v-43L151-552q-6 20-8.5 41.5T140-480q0 134 85 231.5T437-141Zm294-108q25-29 43.5-63t29-70.5q10.5-36.5 13.5-75T820-480q0-98-46-180t-126-140v6q0 35-24.5 59.5T564-710h-84v84q0 18-12 30t-30 12h-84v84h252q18 0 30 12t12 30v126h42q26 0 46.5 14t29.5 36Z"/></svg>
          Built for India
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant card-hover">
          <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor" class="text-amber-600 dark:text-amber-400"><path d="M440-40v-400H280L600-920v400h160L440-40Z"/></svg>
          PM Surya Ghar ₹78K Direct
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant card-hover">
          <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor" class="text-amber-600 dark:text-amber-400"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
          Independent &amp; 100% Unbiased
        </span>
      </div>
    </div>

    <!-- RIGHT column: Solar roof visual with crystal-clear telemetry badge -->
    <div
      class="lg:col-span-5 relative h-[380px] sm:h-[440px] overflow-hidden rounded-2xl border border-outline-variant/80 bg-surface-container-low shadow-xl group card-hover animate-fade-in"
      style="animation-delay: 150ms;"
    >
      <img
        src="/house.jpg"
        alt="Rooftop solar installation on Indian home"
        class="h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
      />
      <!-- Natural dark gradient vignette overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20"></div>

      <!-- Top-right live yield status pill -->
      <div class="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 backdrop-blur-md text-[11px] font-medium text-emerald-300 shadow-lg">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        Live Yield Model
      </div>

      <!-- Floating Stats Card with rich glassmorphism and clear metrics -->
      <div class="absolute bottom-4 left-4 right-4 z-20 rounded-xl border border-white/20 bg-slate-950/85 p-4 backdrop-blur-xl text-white shadow-2xl transition-all duration-300 group-hover:border-amber-400/40">
        <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-white/70">
            5 kWp System Projection
          </span>
          <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
            ₹78K Subsidy Cap
          </span>
        </div>
        <div class="mt-3 flex items-end justify-between">
          <div>
            <div class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-none">
              12.4 <span class="font-sans text-sm font-normal text-white/70">kWh / day</span>
            </div>
            <p class="mt-1 text-[11px] text-white/60">~372 units monthly solar yield</p>
          </div>
          <div class="text-right">
            <div class="font-serif text-xl sm:text-2xl font-bold text-amber-400 leading-none">
              ₹2,850
            </div>
            <p class="mt-1 text-[11px] text-white/60">Est. monthly savings</p>
          </div>
        </div>

        <!-- Diurnal solar power curve sparkline -->
        <div class="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-[10px] text-white/70">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Peak 12:30 PM (4.8 kW)</span>
          </div>
          <div class="flex items-end gap-1 h-3.5 px-1">
            <span class="w-1 bg-amber-400/40 rounded-full h-[30%]"></span>
            <span class="w-1 bg-amber-400/60 rounded-full h-[60%]"></span>
            <span class="w-1 bg-amber-400/85 rounded-full h-[85%]"></span>
            <span class="w-1 bg-amber-400 rounded-full h-[100%] shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>
            <span class="w-1 bg-amber-400/80 rounded-full h-[75%]"></span>
            <span class="w-1 bg-amber-400/50 rounded-full h-[40%]"></span>
            <span class="w-1 bg-amber-400/30 rounded-full h-[20%]"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
