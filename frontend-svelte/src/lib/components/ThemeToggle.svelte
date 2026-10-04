<script lang="ts">
  import { onMount } from 'svelte';

  let theme = $state<'dark' | 'light'>('dark');

  onMount(() => {
    const stored = localStorage.getItem('rtg-theme') as 'dark' | 'light' | null;
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      theme = 'dark';
    }
    applyTheme(theme);
  });

  function applyTheme(newTheme: 'dark' | 'light') {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rtg-theme', newTheme);
  }

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  }
</script>

<button
  type="button"
  onclick={toggle}
  class="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
>
  {#if theme === 'dark'}
    <!-- Sun icon — shown in dark mode to switch to light -->
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  {:else}
    <!-- Moon icon — shown in light mode to switch to dark -->
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  {/if}
</button>
