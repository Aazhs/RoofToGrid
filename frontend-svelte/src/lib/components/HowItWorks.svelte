<script lang="ts">
  import { i18n } from '#lib';
</script>

<section id="how-it-works" class="py-10 md:py-16 border-t border-outline-variant/60 bg-surface">
  <div class="mx-auto max-w-[1280px] px-4 md:px-16">
    <!-- Centered Symmetric Section Header -->
    <div class="mx-auto mb-10 max-w-2xl text-center">
      <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
        METHODOLOGY &amp; WORKFLOW
      </span>
      <h2 class="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-on-surface">
        How RoofToGrid <span class="font-serif italic text-amber-700 dark:text-amber-400">Works</span>
      </h2>
      <p class="mt-3 text-sm sm:text-base text-on-surface-variant leading-relaxed">
        A scientific, 4-phase approach to planning and tracking residential solar in India — eliminating guesswork, biased quotes, and subsidy confusion.
      </p>
    </div>

    <!-- Symmetrical 2x2 Grid of 4 Methodology Phases -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- PHASE 01: Analysis -->
      <div class="group flex flex-col justify-between rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/80 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-amber-600/40 hover:shadow-md">
        <div>
          <div class="flex items-center justify-between border-b border-outline-variant/40 pb-4">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/10 font-serif text-sm font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
              01
            </span>
            <span class="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
              CONSUMPTION &amp; ROOF
            </span>
          </div>
          <h3 class="mt-4 font-serif text-xl sm:text-2xl font-normal text-on-surface">
            Precise Baseline Analysis
          </h3>
          <p class="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            We process your historical electricity bills, rooftop dimensions, shading obstacles, and India IN_2026_07 solar irradiance data.
          </p>
        </div>

        <div class="mt-6 rounded-xl border border-outline-variant/50 bg-surface-container-low/70 p-3.5 text-xs">
          <div class="grid grid-cols-3 gap-2 border-b border-outline-variant/30 pb-2 font-semibold text-on-surface">
            <div>Input</div>
            <div>Source</div>
            <div>Computed</div>
          </div>
          <div class="grid grid-cols-3 gap-2 border-b border-outline-variant/20 py-2 text-on-surface-variant">
            <div>Bills</div>
            <div>DISCOM tariff</div>
            <div class="font-medium text-amber-700 dark:text-amber-400">12-mo average</div>
          </div>
          <div class="grid grid-cols-3 gap-2 border-b border-outline-variant/20 py-2 text-on-surface-variant">
            <div>Rooftop</div>
            <div>User / satellite</div>
            <div class="font-medium text-amber-700 dark:text-amber-400">Area &amp; shading</div>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-2 text-on-surface-variant">
            <div>Solar Irradiance</div>
            <div>National avg</div>
            <div class="font-medium text-amber-700 dark:text-amber-400">Daily kWh/kWp</div>
          </div>
        </div>
      </div>

      <!-- PHASE 02: Sizing -->
      <div class="group flex flex-col justify-between rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/80 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-amber-600/40 hover:shadow-md">
        <div>
          <div class="flex items-center justify-between border-b border-outline-variant/40 pb-4">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/10 font-serif text-sm font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
              02
            </span>
            <span class="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
              ALGORITHMIC ENGINE
            </span>
          </div>
          <h3 class="mt-4 font-serif text-xl sm:text-2xl font-normal text-on-surface">
            Optimal Sizing &amp; PM Surya Ghar Subsidy
          </h3>
          <p class="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Our engine determines system capacity balancing your budget, roof space, and PM Surya Ghar ₹78,000 DBT eligibility rules.
          </p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-outline-variant/50 bg-surface-container-low/70 p-4">
            <p class="font-serif text-2xl sm:text-3xl font-normal text-on-surface">3 – 10 kWp</p>
            <p class="mt-1 text-xs text-on-surface-variant">Optimal Capacity Range</p>
            <span class="mt-2 inline-block rounded bg-amber-600/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Max ₹78K Subsidy
            </span>
          </div>
          <div class="rounded-xl border border-outline-variant/50 bg-surface-container-low/70 p-4">
            <p class="font-serif text-2xl sm:text-3xl font-normal text-on-surface">25 Years</p>
            <p class="mt-1 text-xs text-on-surface-variant">Financial Horizon</p>
            <span class="mt-2 inline-block rounded bg-emerald-600/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              3.5–4.5 Yr Payback
            </span>
          </div>
        </div>
      </div>

      <!-- PHASE 03: Comparison -->
      <div class="group flex flex-col justify-between rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/80 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-amber-600/40 hover:shadow-md">
        <div>
          <div class="flex items-center justify-between border-b border-outline-variant/40 pb-4">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/10 font-serif text-sm font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
              03
            </span>
            <span class="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
              QUOTE AUDIT
            </span>
          </div>
          <h3 class="mt-4 font-serif text-xl sm:text-2xl font-normal text-on-surface">
            Neutral Vendor Quote Audit
          </h3>
          <p class="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Standardize multiple EPC quotes on an apples-to-apples basis: ₹/kWp pricing, TopCon panel tier, inverter efficiency, and 6 red flags.
          </p>
        </div>

        <div class="mt-6 rounded-xl border border-outline-variant/50 bg-surface-container-low/70 p-4">
          <div class="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span>Market Quote Spread</span>
            <span class="font-mono text-amber-700 dark:text-amber-400">₹52K – ₹78K / kWp</span>
          </div>
          <div class="flex h-20 items-end justify-around gap-2 rounded-lg bg-surface-container px-3 pb-2 pt-2">
            <div class="flex flex-col items-center gap-1">
              <div class="w-10 rounded-t bg-surface-container-highest transition-all duration-300" style="height: 38px;"></div>
              <span class="text-[10px] text-on-surface-variant">Quote A</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="w-10 rounded-t bg-amber-600/70 transition-all duration-300" style="height: 58px;"></div>
              <span class="text-[10px] font-semibold text-on-surface">Optimal</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="w-10 rounded-t bg-surface-container-highest transition-all duration-300" style="height: 48px;"></div>
              <span class="text-[10px] text-on-surface-variant">Quote B</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PHASE 04: Monitoring -->
      <div class="group flex flex-col justify-between rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/80 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-amber-600/40 hover:shadow-md">
        <div>
          <div class="flex items-center justify-between border-b border-outline-variant/40 pb-4">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/10 font-serif text-sm font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
              04
            </span>
            <span class="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
              POST-INSTALLATION
            </span>
          </div>
          <h3 class="mt-4 font-serif text-xl sm:text-2xl font-normal text-on-surface">
            Milestone Tracking &amp; Monitoring
          </h3>
          <p class="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Follow a 9-milestone checklist from net-metering liaison to commissioning, then log monthly output against seasonal models.
          </p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-lg border border-outline-variant/40 bg-surface-container-low/70 p-3">
            <p class="text-[11px] text-on-surface-variant">Monthly Tracking</p>
            <p class="mt-1 font-medium text-amber-700 dark:text-amber-400">Actual vs Projected</p>
          </div>
          <div class="rounded-lg border border-outline-variant/40 bg-surface-container-low/70 p-3">
            <p class="text-[11px] text-on-surface-variant">Health Alerts</p>
            <p class="mt-1 font-medium text-on-surface">Variance Detection</p>
          </div>
          <div class="rounded-lg border border-outline-variant/40 bg-surface-container-low/70 p-3">
            <p class="text-[11px] text-on-surface-variant">Warranty Status</p>
            <p class="mt-1 font-medium text-on-surface">Active · Expiring</p>
          </div>
          <div class="rounded-lg border border-outline-variant/40 bg-surface-container-low/70 p-3">
            <p class="text-[11px] text-on-surface-variant">Document Vault</p>
            <p class="mt-1 font-medium text-on-surface">Private Storage</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
