<script lang="ts">
  interface BalconyEstimate {
    title: string;
    subtitle: string;
    railingLengthM: number;
    usableAreaSqft: number;
    railingType: string;
    orientation: string;
    recommendedKitCapacityWp: number;
    recommendedKitDescription: string;
    dailyGenerationKwh: number;
    monthlySavingsInr: number;
    confidence: number;
    keyInsights: string[];
  }

  const SAMPLE_BALCONIES: BalconyEstimate[] = [
    {
      title: 'Bangalore Apartment (East-Facing)',
      subtitle: '3.4m Railing · MS Grill · 2x400W Kit',
      railingLengthM: 3.4,
      usableAreaSqft: 55,
      railingType: 'Mild Steel (MS) Grill Railing',
      orientation: 'East-Facing (Morning Sun 7 AM – 1 PM)',
      recommendedKitCapacityWp: 800,
      recommendedKitDescription: '2x 400Wp Flexible N-Type TopCon Panels + 800W Microinverter',
      dailyGenerationKwh: 3.2,
      monthlySavingsInr: 720,
      confidence: 96.4,
      keyInsights: [
        'Standard door frame (2.1m) and floor tiles (600mm) used for spatial scale calibration.',
        'Sufficient structural load-bearing capacity on MS railing for hook-on mounting brackets.',
        'Plug-and-play AC cord connects directly into 16A balcony power socket.',
      ],
    },
    {
      title: 'Mumbai High-Rise (South-Facing)',
      subtitle: '4.2m Railing · Glass Facade · 1000W Setup',
      railingLengthM: 4.2,
      usableAreaSqft: 82,
      railingType: 'Toughened Glass with SS Handrail',
      orientation: 'South-Facing (Prime Solar Exposure 9 AM – 4 PM)',
      recommendedKitCapacityWp: 1000,
      recommendedKitDescription: '2x 500Wp Rigid Dual-Glass Bifacial Panels + 1 kW Microinverter',
      dailyGenerationKwh: 4.5,
      monthlySavingsInr: 1150,
      confidence: 98.2,
      keyInsights: [
        'Standard split AC outdoor unit (0.8m) used as depth calibration anchor.',
        'Glass facade requires clamp-on non-drilling structural mounting brackets to preserve glass warranty.',
        'Zero shading obstructions from adjacent towers; exceptional generation potential.',
      ],
    },
    {
      title: 'Delhi NCR Terrace Balcony (SW-Facing)',
      subtitle: '5.0m Parapet · Concrete Wall · 1200W Setup',
      railingLengthM: 5.0,
      usableAreaSqft: 110,
      railingType: 'Solid RCC Parapet Wall',
      orientation: 'South-West (Peak Afternoon Sun 11 AM – 5 PM)',
      recommendedKitCapacityWp: 1200,
      recommendedKitDescription: '3x 400Wp Monocrystalline Panels + Parapet Tilt Brackets',
      dailyGenerationKwh: 5.4,
      monthlySavingsInr: 1380,
      confidence: 97.1,
      keyInsights: [
        'Solid concrete wall enables adjustable tilt angle (25°–30°) for 18% higher winter yield.',
        'Ample wall length accommodates up to 3 panels side-by-side with zero railing obstruction.',
        'Complies with Delhi solar policy for residential plug-in microinverter systems.',
      ],
    },
  ];

  let selectedIndex = $state(0);
  let isAnalyzing = $state(false);
  let analysisSuccess = $state(false);

  let currentEstimate = $derived(SAMPLE_BALCONIES[selectedIndex]);

  function selectPreset(idx: number) {
    selectedIndex = idx;
    analysisSuccess = false;
  }

  function simulateAnalysis() {
    isAnalyzing = true;
    analysisSuccess = false;
    setTimeout(() => {
      isAnalyzing = false;
      analysisSuccess = true;
    }, 850);
  }
</script>

<section id="balcony" class="py-20 md:py-28 bg-surface border-b border-outline-variant">
  <div class="max-w-[1280px] mx-auto px-4 md:px-16">
    <div class="text-center max-w-3xl mx-auto mb-14">
      <span class="text-label-sm text-outline uppercase tracking-widest mb-3 block font-jakarta">
        AI MULTIMODAL VISION · SPATIAL CV
      </span>
      <h2 class="text-headline-lg md:text-display-lg font-semibold text-on-surface mb-4 font-jakarta">
        Apartment Balcony Solar Estimator
      </h2>
      <p class="text-body-lg text-on-surface-variant font-jakarta">
        Live in an apartment without private roof access? Upload balcony photos to auto-calibrate railing length,
        orientation, and calculate plug-and-play balcony solar kit generation.
      </p>
    </div>

    <!-- Preset Selector Tabs * -->
    <div class="flex flex-wrap gap-3 justify-center mb-10">
      {#each SAMPLE_BALCONIES as preset, idx}
        <button
          type="button"
          class={`flex flex-col items-start px-5 py-3 rounded-xl border text-left transition-all duration-200 ${
            selectedIndex === idx
              ? 'border-primary-container bg-surface-container shadow-sm'
              : 'border-outline-variant bg-surface-container-low hover:border-outline'
          }`}
          onclick={() => selectPreset(idx)}
        >
          <span class="text-sm font-bold font-jakarta text-on-surface">{preset.title}</span>
          <span class="text-xs text-on-surface-variant mt-0.5">{preset.subtitle}</span>
        </button>
      {/each}
    </div>

    <!-- Interactive Workspace Grid * -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Upload / Calibration Simulator Card * -->
      <div class="lg:col-span-5 rounded-2xl border border-outline-variant bg-surface-container p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        <div class="flex justify-between items-center">
          <span class="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Camera & Spatial Calibration</span>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            AI Confidence {currentEstimate.confidence}%
          </span>
        </div>

        <button
          type="button"
          class="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant hover:border-primary-container rounded-xl bg-surface-container-low cursor-pointer overflow-hidden transition-all duration-200 text-center"
          onclick={simulateAnalysis}
        >
          {#if isAnalyzing}
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent animate-pulse"></div>
          {/if}

          <div class="text-primary-container mb-3">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h4 class="text-base font-bold font-jakarta text-on-surface mb-1">
            {#if isAnalyzing}
              Detecting spatial anchors (door frame, railing height)...
            {:else if analysisSuccess}
              ✓ Spatial calibration complete!
            {:else}
              Click to Run AI Vision Analysis
            {/if}
          </h4>
          <p class="text-xs text-on-surface-variant max-w-xs">Simulates Google Gemini 1.5 Pro Multimodal Vision with metric calibration anchors</p>
        </button>

        <div class="flex flex-col gap-2.5 text-xs text-on-surface-variant">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span>Anchor 1: Railing Height ~1.05m standard</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span>Anchor 2: Balcony Door Frame ~2.10m</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span>Anchor 3: Floor Tiles ~600x600mm grid</span>
          </div>
        </div>
      </div>

      <!-- Sizing & Economics Result Card * -->
      <div class="lg:col-span-7 rounded-2xl border border-outline-variant bg-surface-container p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        <div>
          <span class="inline-block px-3 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 border border-amber-500/20">
            {currentEstimate.recommendedKitCapacityWp}W Plug-and-Play Kit
          </span>
          <h3 class="text-xl md:text-2xl font-bold font-jakarta text-on-surface">
            {currentEstimate.recommendedKitDescription}
          </h3>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">Railing Length</span>
            <span class="text-xl font-bold font-jakarta text-on-surface">{currentEstimate.railingLengthM} m</span>
          </div>
          <div class="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">Usable Area</span>
            <span class="text-xl font-bold font-jakarta text-on-surface">{currentEstimate.usableAreaSqft} sq.ft</span>
          </div>
          <div class="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">Daily Yield</span>
            <span class="text-xl font-bold font-jakarta text-emerald-600 dark:text-emerald-400">{currentEstimate.dailyGenerationKwh} kWh</span>
          </div>
          <div class="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">Monthly Cut</span>
            <span class="text-xl font-bold font-jakarta text-emerald-600 dark:text-emerald-400">₹{currentEstimate.monthlySavingsInr}</span>
          </div>
        </div>

        <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low">
          <h5 class="text-xs font-bold uppercase tracking-wider text-on-surface mb-2 font-jakarta">AI Vision Spatial Findings</h5>
          <ul class="space-y-1.5 text-xs text-on-surface-variant list-disc pl-4">
            {#each currentEstimate.keyInsights as insight}
              <li>{insight}</li>
            {/each}
          </ul>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span class="text-xs text-on-surface-variant">
            🔌 Plugs into standard 16A wall socket · Zero civil work required
          </span>
          <button
            type="button"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-container text-surface text-sm font-semibold hover:bg-surface-tint transition-all"
            onclick={() => alert(`Saved ${currentEstimate.title} (${currentEstimate.recommendedKitCapacityWp}W) to your profile!`)}
          >
            Save Balcony Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
