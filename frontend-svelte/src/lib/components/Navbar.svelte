<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n } from '#lib';
  import LanguageSelector from './LanguageSelector.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  const NAV_LINKS = [
    { href: '#quick-calculator', label: 'Estimator', sectionId: 'quick-calculator' },
    { href: '#features', label: 'Features', sectionId: 'features' },
    { href: '#how-it-works', label: 'How It Works', sectionId: 'how-it-works' },
    { href: '#pricing', label: 'Pricing', sectionId: 'pricing' },
    { href: '#faq', label: 'FAQ', sectionId: 'faq' },
  ];

  let isScrolled = $state(false);
  let isMobileMenuOpen = $state(false);
  let activeSection = $state<string | null>(null);

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 50;

      // Scroll-spy: track which section is currently in view
      const sectionIds = NAV_LINKS.map((link) => link.sectionId);
      const sections = sectionIds
        .map((id) => ({ id, el: document.getElementById(id) }))
        .filter((s): s is { id: string; el: HTMLElement } => s.el !== null)
        .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);

      let current: string | null = null;
      for (const { id, el } of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 80) {
          current = id;
        }
      }
      activeSection = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') isMobileMenuOpen = false;
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  function closeMobile() {
    isMobileMenuOpen = false;
  }
</script>

<nav
  class={`sticky top-0 z-50 border-b transition-all duration-300 ${
    isScrolled
      ? 'border-outline-variant/60 bg-surface/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
      : 'border-outline-variant/30 bg-surface'
  }`}
>
  <div class="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-16">
    <!-- Left: Logo * -->
    <a href="/" class="font-jakarta text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
      RoofToGrid
    </a>

    <!-- Center: Desktop Links with scroll-spy active indicator * -->
    <div class="hidden items-center gap-1 md:flex">
      {#each NAV_LINKS as link}
        {@const isActive = activeSection === link.sectionId}
        {@const label = i18n.t(`nav_${link.sectionId.replace(/-/g, '_')}`) || link.label}
        <a
          href={link.href}
          class={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
            isActive ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {#if isActive}
            <span
              class="absolute inset-0 rounded-full bg-surface-container border border-outline-variant/50 shadow-sm"
              style="animation: fade-in-up 0.2s ease-out;"
            ></span>
          {/if}
          <span class="relative z-10">{label}</span>
        </a>
      {/each}
    </div>

    <!-- Right: Login + CTA + Mobile Toggle * -->
    <div class="flex items-center gap-2">
      <a
        href="/login"
        class="hidden rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors duration-200 hover:text-on-surface md:block"
      >
        {i18n.t('nav_login')}
      </a>
      <LanguageSelector />
      <ThemeToggle />
      <a
        href="/dashboard"
        class="hidden rounded-xl bg-primary-container px-6 py-2.5 text-sm font-semibold text-surface transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] md:block"
      >
        {i18n.t('nav_get_started')}
      </a>

      <!-- Hamburger / X toggle * -->
      <button
        type="button"
        class="relative flex h-10 w-10 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container md:hidden"
        onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
          fill="currentColor"
          class={`absolute transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
          }`}
        >
          <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
          fill="currentColor"
          class={`absolute transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
          }`}
        >
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile Menu — animated slide-down * -->
  <div
    class={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
      isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
    }`}
  >
    <div class="border-t border-outline-variant/40 bg-surface/95 backdrop-blur-xl px-4 py-4">
      <div class="flex flex-col gap-1">
        {#each NAV_LINKS as link}
          {@const isActive = activeSection === link.sectionId}
          {@const label = i18n.t(`nav_${link.sectionId.replace(/-/g, '_')}`) || link.label}
          <a
            href={link.href}
            class={`relative rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'text-on-surface bg-on-surface/[0.06]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            onclick={closeMobile}
          >
            {label}
          </a>
        {/each}
        <div class="flex items-center justify-between border-t border-outline-variant/30 pt-3">
          <span class="text-xs text-on-surface-variant">Language & Theme</span>
          <div class="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
        <a
          href="/login"
          class="rounded-xl px-4 py-3 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface hover:bg-surface-container"
          onclick={closeMobile}
        >
          {i18n.t('nav_login')}
        </a>
        <a
          href="/dashboard"
          class="mt-2 w-full rounded-xl bg-primary-container px-6 py-3.5 text-center text-sm font-semibold text-surface transition-all hover:opacity-90"
          onclick={closeMobile}
        >
          {i18n.t('nav_get_started')}
        </a>
      </div>
    </div>
  </div>
</nav>
