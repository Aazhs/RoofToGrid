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

<section id="balcony" class="balcony-section">
  <div class="container">
    <div class="section-header">
      <div class="badge-pill">
        <span>🤖 AI Multimodal Vision (Gemini + Spatial CV)</span>
      </div>
      <h2 class="section-title">Apartment Balcony Solar Estimator</h2>
      <p class="section-subtitle">
        Live in a flat without private rooftop access? Upload 1 or more balcony photos to auto-calibrate railing length,
        orientation, and calculate plug-and-play balcony solar kit generation.
      </p>
    </div>

    <!-- Preset Selector Tabs -->
    <div class="preset-tabs">
      {#each SAMPLE_BALCONIES as preset, idx}
        <button
          type="button"
          class="preset-btn {selectedIndex === idx ? 'active' : ''}"
          onclick={() => selectPreset(idx)}
        >
          <span class="preset-title">{preset.title}</span>
          <span class="preset-sub">{preset.subtitle}</span>
        </button>
      {/each}
    </div>

    <!-- Interactive Workspace Grid -->
    <div class="workspace-grid">
      <!-- Upload / Calibration Simulator Card -->
      <div class="card visual-card">
        <div class="card-top">
          <span class="card-badge">Camera & Spatial Calibration</span>
          <span class="confidence-tag">AI Confidence {currentEstimate.confidence}%</span>
        </div>

        <button type="button" class="upload-zone" onclick={simulateAnalysis}>
          <div class="scan-overlay {isAnalyzing ? 'scanning' : ''}"></div>
          <div class="camera-icon">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h4 class="upload-title">
            {#if isAnalyzing}
              Detecting spatial anchors (door frame, railing height)...
            {:else if analysisSuccess}
              ✓ Spatial calibration complete!
            {:else}
              Click to Run AI Vision Analysis
            {/if}
          </h4>
          <p class="upload-hint">Simulates Google Gemini 1.5 Pro Multimodal Vision with metric calibration anchors</p>
        </button>

        <div class="anchors-list">
          <div class="anchor-item">
            <span class="anchor-dot"></span>
            <span>Anchor 1: Railing Height ~1.05m standard</span>
          </div>
          <div class="anchor-item">
            <span class="anchor-dot"></span>
            <span>Anchor 2: Balcony Door Frame ~2.10m</span>
          </div>
          <div class="anchor-item">
            <span class="anchor-dot"></span>
            <span>Anchor 3: Floor Tiles ~600x600mm grid</span>
          </div>
        </div>
      </div>

      <!-- Sizing & Economics Result Card -->
      <div class="card results-card">
        <div class="result-header">
          <div>
            <span class="kit-badge">{currentEstimate.recommendedKitCapacityWp}W Plug-and-Play Kit</span>
            <h3 class="kit-title">{currentEstimate.recommendedKitDescription}</h3>
          </div>
        </div>

        <div class="stats-row">
          <div class="mini-stat">
            <span class="mini-label">Railing Length</span>
            <span class="mini-val">{currentEstimate.railingLengthM} m</span>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Usable Area</span>
            <span class="mini-val">{currentEstimate.usableAreaSqft} sq.ft</span>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Daily Yield</span>
            <span class="mini-val text-emerald">{currentEstimate.dailyGenerationKwh} kWh</span>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Monthly Savings</span>
            <span class="mini-val text-emerald">₹{currentEstimate.monthlySavingsInr}</span>
          </div>
        </div>

        <div class="insights-box">
          <h5 class="insights-title">AI Vision Spatial Findings</h5>
          <ul class="insights-list">
            {#each currentEstimate.keyInsights as insight}
              <li>{insight}</li>
            {/each}
          </ul>
        </div>

        <div class="action-footer">
          <div class="plug-hint">
            <span>🔌 Requires standard 16A socket · No heavy civil work</span>
          </div>
          <button class="btn-primary" onclick={() => alert(`Saved ${currentEstimate.title} (${currentEstimate.recommendedKitCapacityWp}W) to your profile!`)}>
            Save Balcony Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .balcony-section {
    padding: 4rem 0;
    background: var(--bg-surface-elevated);
    border-top: 1px solid var(--border-outline);
    border-bottom: 1px solid var(--border-outline);
  }

  .section-header {
    text-align: center;
    max-width: 760px;
    margin: 0 auto 2.5rem;
  }

  .badge-pill {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    background: rgba(2, 132, 199, 0.1);
    color: var(--brand-accent);
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-main);
    margin-bottom: 0.75rem;
  }

  .section-subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .preset-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem 1.25rem;
    border-radius: 0.875rem;
    border: 1px solid var(--border-outline);
    background: var(--bg-surface-card);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .preset-btn:hover {
    border-color: var(--border-outline-strong);
  }

  .preset-btn.active {
    border-color: var(--brand-accent);
    background: rgba(2, 132, 199, 0.05);
    box-shadow: 0 0 0 1px var(--brand-accent);
  }

  .preset-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .preset-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.15rem;
  }

  .workspace-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 960px) {
    .workspace-grid {
      grid-template-columns: 1fr 1.2fr;
    }
  }

  .visual-card {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-badge {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle);
  }

  .confidence-tag {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--brand-emerald);
    background: rgba(5, 150, 105, 0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
  }

  .upload-zone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    border: 2px dashed var(--border-outline-strong);
    border-radius: 1rem;
    background: var(--bg-surface);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s ease;
    text-align: center;
  }

  .upload-zone:hover {
    border-color: var(--brand-accent);
  }

  .scan-overlay.scanning {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #0284c7, transparent);
    animation: scanAnim 1s infinite alternate;
  }

  @keyframes scanAnim {
    0% { top: 0; }
    100% { top: 98%; }
  }

  .camera-icon {
    color: var(--brand-accent);
    margin-bottom: 0.75rem;
  }

  .upload-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.25rem;
  }

  .upload-hint {
    font-size: 0.75rem;
    color: var(--text-subtle);
    max-width: 320px;
  }

  .anchors-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .anchor-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .anchor-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--brand-accent);
  }

  .results-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .kit-badge {
    display: inline-block;
    padding: 0.25rem 0.6rem;
    border-radius: 0.5rem;
    background: rgba(217, 119, 6, 0.1);
    color: var(--brand-amber);
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .kit-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main);
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .stats-row {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .mini-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background: var(--bg-surface-elevated);
    border-radius: 0.75rem;
    border: 1px solid var(--border-outline);
  }

  .mini-label {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle);
    font-weight: 600;
  }

  .mini-val {
    font-size: 1.125rem;
    font-weight: 800;
    color: var(--text-main);
  }

  .insights-box {
    padding: 1rem;
    border-radius: 0.75rem;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-outline);
  }

  .insights-title {
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-main);
    margin-bottom: 0.5rem;
  }

  .insights-list {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .action-footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: auto;
  }

  @media (min-width: 640px) {
    .action-footer {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .plug-hint {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .text-emerald {
    color: var(--brand-emerald);
  }
</style>
