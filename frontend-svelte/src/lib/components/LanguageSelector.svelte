<script lang="ts">
  import { i18n, SUPPORTED_LANGUAGES, type Language, type LanguageInfo } from '#lib';

  interface Props {
    className?: string;
  }

  let { className = '' }: Props = $props();

  let isOpen = $state(false);

  let activeLang = $derived(
    SUPPORTED_LANGUAGES.find((l: LanguageInfo) => l.code === i18n.current) ?? SUPPORTED_LANGUAGES[0]
  );

  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-selector-container')) {
      isOpen = false;
    }
  }

  function selectLanguage(code: Language) {
    i18n.setLanguage(code);
    isOpen = false;
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<div class={`lang-selector-container relative inline-block text-left ${className}`}>
  <button
    type="button"
    onclick={(e) => {
      e.stopPropagation();
      isOpen = !isOpen;
    }}
    class="flex items-center gap-1.5 rounded-full border border-outline-variant/40 bg-surface px-2.5 py-1.5 text-xs font-medium text-on-surface transition hover:border-outline-variant hover:bg-surface-container active:scale-95"
    aria-label="Select language"
    aria-expanded={isOpen}
  >
    <span class="text-sm">🌐</span>
    <span class="font-semibold">{activeLang.nativeName}</span>
    <svg
      class={`h-3 w-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div class="absolute right-0 z-50 mt-1 w-36 origin-top-right rounded-xl border border-outline-variant/40 bg-surface/95 py-1.5 shadow-lg backdrop-blur-xl animate-fade-in-up">
      {#each SUPPORTED_LANGUAGES as lang}
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            selectLanguage(lang.code);
          }}
          class={`flex w-full items-center justify-between px-3 py-1.5 text-xs transition ${
            lang.code === i18n.current
              ? 'bg-brand-50 font-bold text-brand-900'
              : 'text-on-surface hover:bg-surface-container'
          }`}
        >
          <span>{lang.nativeName}</span>
          <span class="text-[10px] text-slate-400 uppercase">{lang.code}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
