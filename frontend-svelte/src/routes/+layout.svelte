<script lang="ts">
  import '../app.css';
  import Navbar from '#lib/components/Navbar.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<svelte:head>
  <title>RoofToGrid — Zero Bullshit Solar for Indian Homeowners</title>
  <meta
    name="description"
    content="Independent rooftop & balcony solar sizing, PM Surya Ghar ₹78,000 DBT subsidy calculation, and transparent EPC quote intelligence."
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="app-layout">
  <Navbar />
  <main class="main-content">
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
  }
</style>
