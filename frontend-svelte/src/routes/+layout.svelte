<script lang="ts">
  import '../app.css';
  import Navbar from '#lib/components/Navbar.svelte';
  import LandingFooter from '#lib/components/LandingFooter.svelte';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<svelte:head>
  <title>RoofToGrid — India's Smartest Rooftop Solar Planning Platform</title>
  <meta
    name="description"
    content="Plan your rooftop solar with clear numbers. Compare installer quotes fairly, track your project end-to-end, and monitor system performance — all in one platform built for Indian homeowners."
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="min-h-screen bg-slate-50 text-slate-800 antialiased dark:bg-surface dark:text-on-surface">
  <Navbar />
  <main id="main">
    {@render children()}
  </main>
  <LandingFooter />
</div>
