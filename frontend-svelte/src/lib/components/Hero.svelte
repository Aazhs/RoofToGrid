<script lang="ts">
  import { i18n } from '#lib/i18n.svelte';
</script>

<section class="hero-section">
  <div class="container hero-container">
    <div class="badge-wrapper">
      <span class="badge-pill">
        <span class="pulse-dot"></span>
        <span class="badge-text">{i18n.t('hero_badge')}</span>
      </span>
    </div>

    <h1 class="hero-title">
      {i18n.t('hero_headline')}
    </h1>

    <p class="hero-desc">
      {i18n.t('hero_subhead')}
    </p>

    <div class="hero-actions">
      <a href="#calculator" class="btn-primary hero-btn">
        <span>{i18n.t('hero_cta_primary')}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
      <a href="#balcony" class="btn-secondary hero-btn">
        <span>🏢 Apartment Balcony Solar</span>
      </a>
    </div>

    <!-- Live Social Proof Stats Grid -->
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-num">14,800+</span>
        <span class="stat-label">Indian Homes Modeled</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num text-emerald">₹42.6 Cr</span>
        <span class="stat-label">Subsidies Unlocked (DBT)</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num text-amber">18.2 MW</span>
        <span class="stat-label">Clean Capacity Estimated</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num text-blue">&lt;400 µs</span>
        <span class="stat-label">Go Calculation Latency</span>
      </div>
    </div>
  </div>
</section>

<style>
  .hero-section {
    padding: 3.5rem 0 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .hero-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 900px;
    margin: 0 auto;
  }

  .badge-wrapper {
    margin-bottom: 1.25rem;
  }

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.85rem;
    border-radius: 9999px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #b45309;
  }

  :global(.dark) .badge-pill {
    background: rgba(245, 158, 11, 0.18);
    color: #fbbf24;
  }

  @media (prefers-color-scheme: dark) {
    .badge-pill {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
    }
  }

  .pulse-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    background: #f59e0b;
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
    }
  }

  .hero-title {
    font-size: 2.25rem;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: var(--text-main);
    margin-bottom: 1.25rem;
  }

  @media (min-width: 640px) {
    .hero-title {
      font-size: 3.25rem;
    }
  }

  .hero-desc {
    font-size: 1.125rem;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 720px;
    margin-bottom: 2rem;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .hero-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .hero-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .stats-card {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    width: 100%;
    padding: 1.5rem;
    border-radius: 1.25rem;
    background: var(--bg-surface-card);
    border: 1px solid var(--border-outline);
    box-shadow: var(--shadow-sm);
  }

  @media (min-width: 768px) {
    .stats-card {
      grid-template-columns: repeat(4, 1fr);
      padding: 1.5rem 2rem;
    }
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-num {
    font-size: 1.625rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-main);
  }

  .stat-label {
    font-size: 0.8125rem;
    color: var(--text-muted);
    text-align: center;
  }

  .stat-divider {
    display: none;
  }

  .text-emerald {
    color: var(--brand-emerald);
  }

  .text-amber {
    color: var(--brand-amber);
  }

  .text-blue {
    color: var(--brand-accent);
  }
</style>
