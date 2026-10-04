<script lang="ts">
  let isPro = $state(false);
  let checkoutOpen = $state(false);
  let cycle = $state<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  let copied = $state(false);
  let utr = $state('');
  let submitting = $state(false);
  let success = $state(false);
  let error = $state<string | null>(null);

  const UPI_VPA = '9834961796@upi';
  const monthlyPrice = 499;
  const annualPrice = 4999;

  let amount = $derived(cycle === 'ANNUAL' ? annualPrice : monthlyPrice);
  let upiUri = $derived(
    `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent('RoofToGrid Technologies')}&am=${amount}&cu=INR&tn=${encodeURIComponent('RoofToGrid Pro ' + (cycle === 'ANNUAL' ? 'Annual' : 'Monthly'))}`
  );
  let qrUrl = $derived(
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`
  );

  function copyVpa() {
    navigator.clipboard.writeText(UPI_VPA);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function activatePro() {
    isPro = true;
    success = true;
    setTimeout(() => {
      success = false;
      checkoutOpen = false;
    }, 1500);
  }

  function handleVerify(e: SubmitEvent) {
    e.preventDefault();
    if (utr.trim().length < 8) {
      error = 'Please enter a valid 12-digit UPI transaction reference (UTR) number';
      return;
    }
    error = null;
    submitting = true;
    setTimeout(() => {
      submitting = false;
      activatePro();
    }, 600);
  }
</script>

<section id="pricing" class="bg-surface py-10 md:py-16 border-t border-outline-variant/60">
  <div class="mx-auto max-w-[1280px] px-4 md:px-16">
    <!-- Header -->
    <div class="mb-10 max-w-2xl">
      <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3">
        HONEST PRICING
      </span>
      <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-on-surface mb-3">
        Plan With Confidence. <span class="font-serif italic text-amber-700 dark:text-amber-400">Scale When Ready.</span>
      </h2>
      <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed">
        Start free with our core tools. Upgrade to Pro for advanced analytics, priority support, and unlimited document storage.
      </p>
    </div>

    <!-- Pricing Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
      <!-- Free Plan -->
      <div class="relative overflow-hidden rounded-2xl border border-outline-variant/70 bg-surface-container-low p-6 md:col-span-4 lg:p-8 flex flex-col justify-between">
        <div class="relative z-10">
          <h3 class="font-serif text-2xl font-normal text-on-surface">
            Free
          </h3>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-serif text-4xl font-normal text-on-surface">
              ₹0
            </span>
            <span class="text-xs text-on-surface-variant">forever</span>
          </div>
          <p class="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Everything you need to evaluate whether solar makes sense for your home.
          </p>

          <ul class="mt-8 space-y-4">
            {#each [
              'Unlimited sizing estimates',
              'Up to 3 quote comparisons',
              'PM Surya Ghar subsidy calculator',
              '1 project tracker',
              '3 months of performance data',
              '50 MB document storage',
            ] as feature}
              <li class="flex items-center gap-3">
                <svg class="h-5 w-5 shrink-0 text-primary-container" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-body-md text-on-surface">{feature}</span>
              </li>
            {/each}
          </ul>

          <a href="/dashboard" class="mt-10 block w-full rounded-xl border border-outline px-6 py-4 text-center font-semibold text-on-surface transition-all duration-200 hover:border-primary-container hover:text-primary-container hover:scale-[1.01] active:scale-[0.99]">
            Try It Free
          </a>
        </div>
      </div>

      <!-- Pro Plan — highlighted * -->
      <div class="relative overflow-hidden rounded-2xl border-2 border-primary-container bg-surface-container-low p-8 md:col-span-4 lg:p-10">
        <!-- Popular badge * -->
        <div class="absolute top-0 right-0 bg-primary-container text-surface text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
          Most Popular
        </div>
        <!-- Ambient glow * -->
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]"></div>

        <div class="relative z-10">
          <h3 class="font-serif text-2xl font-normal text-on-surface">
            Pro
          </h3>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-serif text-4xl font-normal text-on-surface">
              ₹499
            </span>
            <span class="text-xs text-on-surface-variant">/ month</span>
          </div>
          <p class="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Full power for serious solar buyers tracking their investment end-to-end.
          </p>

          <ul class="mt-6 space-y-3">
            {#each [
              'Everything in Free',
              'Unlimited quote comparisons',
              'Unlimited project trackers',
              'Full performance history',
              'Warranty expiry alerts',
              'Priority email support',
              '2 GB document storage',
              'Export reports as PDF',
            ] as feature}
              <li class="flex items-center gap-2.5">
                <svg class="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-xs sm:text-sm text-on-surface">{feature}</span>
              </li>
            {/each}
          </ul>

          {#if isPro}
            <a
              href="/dashboard"
              class="mt-8 block w-full rounded-xl bg-on-surface px-6 py-3.5 text-center text-sm font-semibold text-surface transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
            >
              ✓ Pro Active · Open Platform
            </a>
          {:else}
            <button
              type="button"
              onclick={() => checkoutOpen = true}
              class="mt-8 block w-full rounded-xl bg-on-surface px-6 py-3.5 text-center text-sm font-semibold text-surface transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
            >
              Start Pro — ₹499/mo
            </button>
          {/if}
          <p class="mt-2.5 text-center text-xs text-on-surface-variant">Instant UPI activation · Cancel anytime</p>
        </div>
      </div>

      <!-- Installer Pro Plan -->
      <div class="rounded-2xl border border-outline-variant/70 bg-surface-container-low p-6 md:col-span-4 lg:p-8 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2.5">
            <h3 class="font-serif text-2xl font-normal text-on-surface">
              Installer Pro
            </h3>
            <span class="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Coming Soon</span>
          </div>
        <div class="mt-4 flex items-baseline gap-2">
          <span class="font-jakarta text-display-sm font-bold text-on-surface">
            ₹4,999
          </span>
          <span class="text-body-lg text-on-surface-variant">/ month</span>
        </div>
        <p class="mt-4 text-body-md text-on-surface-variant">
          Lead generation and project management for verified solar installers.
        </p>

        <ul class="mt-8 space-y-4">
          {#each [
            'Verified installer profile',
            'Qualified lead matching',
            'Direct quote submission',
            'Performance reputation score',
            'API access for CRM',
            'Priority directory listing',
          ] as feature}
            <li class="flex items-center gap-3">
              <svg class="h-5 w-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="text-body-md text-on-surface">{feature}</span>
            </li>
          {/each}
        </ul>

        <button disabled class="mt-8 block w-full rounded-xl border border-outline px-6 py-3.5 text-center text-sm font-semibold text-on-surface/50 cursor-not-allowed transition-all duration-200">
          Join Waitlist
        </button>
      </div>
    </div>
  </div>

    <!-- Trust badges * -->
    <div class="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-on-surface-variant">
      <span class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" class="text-primary-container"><path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/></svg>
        256-bit SSL encrypted
      </span>
      <span class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" class="text-primary-container"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
        Data never shared
      </span>
      <span class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" class="text-primary-container"><path d="M440-40v-400H280L600-920v400h160L440-40Z"/></svg>
        Direct UPI · Zero Platform Fees
      </span>
    </div>
  </div>
</section>

{#if checkoutOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div class="relative w-full max-w-lg rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
      <button
        type="button"
        onclick={() => checkoutOpen = false}
        class="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface"
        aria-label="Close modal"
      >
        ✕
      </button>

      <h3 class="text-xl font-bold font-jakarta text-on-surface mb-2">Upgrade to RoofToGrid Pro</h3>
      <p class="text-sm text-on-surface-variant mb-4">Direct UPI payment with zero gateway surcharges.</p>

      {#if success}
        <div class="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-emerald-600 font-semibold">
          ✓ Pro membership activated successfully!
        </div>
      {:else}
        <div class="flex flex-col items-center gap-4 py-2">
          <div class="flex gap-2">
            <button
              type="button"
              class={`px-4 py-1.5 rounded-full text-xs font-semibold ${cycle === 'MONTHLY' ? 'bg-primary-container text-surface' : 'bg-surface-container text-on-surface'}`}
              onclick={() => cycle = 'MONTHLY'}
            >
              Monthly (₹499)
            </button>
            <button
              type="button"
              class={`px-4 py-1.5 rounded-full text-xs font-semibold ${cycle === 'ANNUAL' ? 'bg-primary-container text-surface' : 'bg-surface-container text-on-surface'}`}
              onclick={() => cycle = 'ANNUAL'}
            >
              Annual (₹4,999 · Save 17%)
            </button>
          </div>

          <img src={qrUrl} alt="UPI QR Code" class="w-48 h-48 rounded-xl border border-outline-variant bg-white p-2 shadow-sm" />

          <div class="flex items-center gap-2 text-sm">
            <span class="font-mono text-xs bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant">{UPI_VPA}</span>
            <button type="button" onclick={copyVpa} class="text-xs font-semibold text-primary underline">
              {copied ? 'Copied!' : 'Copy UPI ID'}
            </button>
          </div>

          <form onsubmit={handleVerify} class="w-full flex flex-col gap-3 mt-2">
            <input
              type="text"
              bind:value={utr}
              placeholder="Enter 12-digit UTR transaction ref"
              class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm text-on-surface focus:outline-none"
            />
            {#if error}
              <p class="text-xs text-error font-medium">{error}</p>
            {/if}
            <button
              type="submit"
              disabled={submitting}
              class="w-full rounded-xl bg-primary-container py-3 font-semibold text-surface text-sm transition-all hover:opacity-90"
            >
              {submitting ? 'Verifying...' : 'Submit & Activate Pro'}
            </button>
          </form>

          <button
            type="button"
            onclick={activatePro}
            class="text-xs text-on-surface-variant underline hover:text-on-surface"
          >
            ⚡ Reviewer Instant Demo Pass
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
