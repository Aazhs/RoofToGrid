<script lang="ts">
  import { i18n, SUPPORTED_LANGUAGES } from '#lib/i18n.svelte';

  let isOpen = $state(false);

  let activeLang = $derived(
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.current) ?? SUPPORTED_LANGUAGES[0]
  );

  function toggle() {
    isOpen = !isOpen;
  }

  function selectLanguage(code: any) {
    i18n.setLanguage(code);
    isOpen = false;
  }

  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-selector-container')) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="lang-selector-container">
  <button
    type="button"
    class="lang-btn"
    onclick={(e) => {
      e.stopPropagation();
      toggle();
    }}
    aria-label="Select Language"
    aria-expanded={isOpen}
  >
    <span class="globe-icon">🌐</span>
    <span class="lang-name">{activeLang.nativeName}</span>
    <svg
      class="chevron {isOpen ? 'rotate' : ''}"
      viewBox="0 0 20 20"
      fill="currentColor"
      width="14"
      height="14"
    >
      <path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </button>

  {#if isOpen}
    <div class="dropdown-menu">
      {#each SUPPORTED_LANGUAGES as lang}
        <button
          type="button"
          class="dropdown-item {lang.code === i18n.current ? 'active' : ''}"
          onclick={(e) => {
            e.stopPropagation();
            selectLanguage(lang.code);
          }}
        >
          <span class="native-label">{lang.nativeName}</span>
          <span class="english-label">({lang.name})</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lang-selector-container {
    position: relative;
    display: inline-block;
  }

  .lang-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid var(--border-outline);
    background: var(--bg-surface-elevated);
    color: var(--text-main);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .lang-btn:hover {
    border-color: var(--border-outline-strong);
    background: var(--bg-surface-container);
  }

  .chevron {
    transition: transform 0.2s ease;
    color: var(--text-subtle);
  }

  .chevron.rotate {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    right: 0;
    margin-top: 0.35rem;
    width: 10rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border-outline);
    background: var(--bg-surface-card);
    box-shadow: var(--shadow-lg);
    padding: 0.25rem;
    z-index: 50;
    animation: fadeIn 0.15s ease-out;
  }

  .dropdown-item {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    color: var(--text-main);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .dropdown-item:hover {
    background: var(--bg-surface-elevated);
  }

  .dropdown-item.active {
    font-weight: 700;
    color: var(--brand-accent);
    background: rgba(2, 132, 199, 0.08);
  }

  .native-label {
    font-weight: 600;
  }

  .english-label {
    font-size: 0.75rem;
    color: var(--text-subtle);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
