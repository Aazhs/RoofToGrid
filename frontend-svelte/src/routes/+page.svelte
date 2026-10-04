<script lang="ts">
  import Hero from '#lib/components/Hero.svelte';
  import QuickCalculator from '#lib/components/QuickCalculator.svelte';
  import BalconyEstimator from '#lib/components/BalconyEstimator.svelte';
  import InstallerPriceMatrix from '#lib/components/InstallerPriceMatrix.svelte';
  import FeatureGrid from '#lib/components/FeatureGrid.svelte';
</script>

<Hero />

<section id="calculator" class="calc-section">
  <div class="container">
    <QuickCalculator />
  </div>
</section>

<BalconyEstimator />

<InstallerPriceMatrix />

<FeatureGrid />

<style>
  .calc-section {
    padding: 1.5rem 0 3.5rem;
  }
</style>
