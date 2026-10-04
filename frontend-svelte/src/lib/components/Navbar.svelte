<script lang="ts">
  import { i18n } from '#lib/i18n.svelte';
  import LanguageSelector from './LanguageSelector.svelte';

  let mobileMenuOpen = $state(false);

  function toggleMobile() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<header class="navbar">
  <div class="container nav-container">
    <a href="/" class="brand">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5" stroke="#f59e0b" fill="#fef3c7" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#d97706" />
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">RoofToGrid</span>
        <span class="brand-tag">Svelte 5 · Go</span>
      </div>
    </a>

    <nav class="desktop-nav">
      <a href="#calculator" class="nav-link">{i18n.t('nav_estimator')}</a>
      <a href="#balcony" class="nav-link">{i18n.t('nav_balcony')}</a>
      <a href="#installers" class="nav-link">{i18n.t('nav_quotes')}</a>
      <a href="#subsidy" class="nav-link">PM Surya Ghar</a>
    </nav>

    <div class="nav-actions">
      <LanguageSelector />
      <a href="#calculator" class="btn-cta">
        <span>{i18n.t('nav_get_started')}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
      <button
        type="button"
        class="mobile-toggle"
        onclick={toggleMobile}
        aria-label="Toggle Navigation Menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {#if mobileMenuOpen}
            <path d="M18 6L6 18M6 6l12 12" />
          {:else}
            <path d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  {#if mobileMenuOpen}
    <div class="mobile-drawer">
      <a href="#calculator" class="mobile-link" onclick={() => mobileMenuOpen = false}>
        {i18n.t('nav_estimator')}
      </a>
      <a href="#balcony" class="mobile-link" onclick={() => mobileMenuOpen = false}>
        {i18n.t('nav_balcony')}
      </a>
      <a href="#installers" class="mobile-link" onclick={() => mobileMenuOpen = false}>
        {i18n.t('nav_quotes')}
      </a>
      <a href="#subsidy" class="mobile-link" onclick={() => mobileMenuOpen = false}>
        PM Surya Ghar Subsidy
      </a>
    </div>
  {/if}
</header>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 40;
    width: 100%;
    background: rgba(250, 249, 247, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-outline);
    transition: all 0.2s ease;
  }

  :global(.dark) .navbar {
    background: rgba(11, 15, 25, 0.85);
  }

  @media (prefers-color-scheme: dark) {
    .navbar {
      background: rgba(11, 15, 25, 0.85);
    }
  }

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.625rem;
    background: #fffbeb;
    border: 1px solid #fde68a;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-main);
  }

  .brand-tag {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--brand-accent);
  }

  .desktop-nav {
    display: none;
    align-items: center;
    gap: 1.75rem;
  }

  @media (min-width: 840px) {
    .desktop-nav {
      display: flex;
    }
  }

  .nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: var(--text-main);
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn-cta {
    display: none;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.9rem;
    border-radius: 9999px;
    background: var(--brand-primary);
    color: var(--bg-surface);
    font-size: 0.8125rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s ease;
  }

  @media (min-width: 640px) {
    .btn-cta {
      display: inline-flex;
    }
  }

  .btn-cta:hover {
    opacity: 0.9;
  }

  .mobile-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-outline);
    background: transparent;
    color: var(--text-main);
    cursor: pointer;
  }

  @media (min-width: 840px) {
    .mobile-toggle {
      display: none;
    }
  }

  .mobile-drawer {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-outline);
    background: var(--bg-surface-card);
    gap: 0.75rem;
  }

  .mobile-link {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-main);
    text-decoration: none;
    padding: 0.5rem 0;
  }
</style>
