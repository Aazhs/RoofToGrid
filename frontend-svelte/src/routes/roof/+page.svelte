<script lang="ts">
  import BalconyEstimator from '#lib/components/BalconyEstimator.svelte';
</script>

<svelte:head>
  <title>Balcony &amp; Terrace Solar AI — RoofToGrid</title>
</svelte:head>

<div class="mx-auto max-w-[1280px] px-4 py-8 md:px-16">
  <div class="mb-6">
    <div class="flex items-center gap-2 mb-2">
      <a href="/dashboard" class="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline">
        ← Back to Dashboard
      </a>
      <span class="text-outline-variant">/</span>
      <span class="text-xs text-on-surface-variant">Spatial CV</span>
    </div>
    <h1 class="font-serif text-3xl sm:text-4xl font-normal text-on-surface tracking-tight">
      Balcony &amp; Terrace <span class="font-serif italic text-amber-700 dark:text-amber-400">AI Dimension Estimator</span>
    </h1>
    <p class="mt-1 text-sm text-on-surface-variant max-w-2xl">
      Computer vision reference calibration using architectural anchors (doors, standard railings, floor tiles) to model plug-and-play solar generation without professional site visits.
    </p>
  </div>

  <BalconyEstimator />
</div>
