<script lang="ts">
  const faqs = [
    {
      question: 'How accurate are the savings estimates?',
      answer: 'Our estimates use published India solar averages, standard panel degradation rates (0.5%/year), and current grid tariffs. These are rule-based calculations using national data — not site surveys or irradiance simulations. All assumptions (IN_2026_07 standard) are fully disclosed in your personalized report.',
    },
    {
      question: 'Is my data safe?',
      answer: 'Yes. We use industry-standard bcrypt hashing for passwords, secure JWT for authentication, and private encrypted storage for your documents. You maintain complete ownership of your data.',
    },
    {
      question: 'Do I have to pay for RoofToGrid?',
      answer: 'Homeowners can access core features to plan their roof potential, track project milestones, and compare installer quotes.',
    },
    {
      question: 'How do you verify installers?',
      answer: 'Currently, you manually enter quotes from any installer you\'re considering. Our platform then normalizes and scores each quote for transparent comparison. In Phase 2, we plan to build an installer marketplace with an outcome-based reputation system and verified profiles.',
    },
    {
      question: 'What subsidies am I eligible for?',
      answer: 'Under the PM Surya Ghar Muft Bijli Yojana, you may be eligible for a subsidy of up to ₹78,000 depending on your system size. Our platform auto-calculates your exact eligibility.',
    },
    {
      question: 'Can I track my installation progress?',
      answer: 'Yes! RoofToGrid includes a comprehensive 9-milestone visual tracker that keeps you updated from initial quote approval to final grid integration and commissioning.',
    },
    {
      question: 'What happens after installation?',
      answer: 'After installation, you can log your monthly solar generation and we compare it against seasonal projections to flag underperformance. You also get warranty status tracking (Active / Expiring Soon / Expired) and a private document vault for all your project paperwork.',
    },
    {
      question: 'Who builds RoofToGrid?',
      answer: 'RoofToGrid is an independent, bootstrapped startup focused on bringing transparency and data-driven planning to India\'s residential solar market. We are not affiliated with any installer, manufacturer, or financing company — our recommendations are unbiased by design.',
    },
  ];

  let openIndex = $state<number | null>(null);

  function toggleFAQ(idx: number) {
    openIndex = openIndex === idx ? null : idx;
  }
</script>

<section id="faq" class="py-10 md:py-16 border-t border-outline-variant/60 max-w-[1280px] mx-auto px-4 md:px-16">
  <div class="mb-8 max-w-2xl">
    <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3">
      FREQUENTLY ASKED
    </span>
    <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-2">
      Common <span class="font-serif italic text-amber-700 dark:text-amber-400">Questions</span>
    </h2>
  </div>

  <div class="max-w-3xl">
    {#each faqs as faq, index}
      {@const isOpen = openIndex === index}
      <div class="border-b border-outline-variant transition-all duration-300">
        <button
          type="button"
          onclick={() => toggleFAQ(index)}
          aria-expanded={isOpen}
          class="w-full flex justify-between items-center py-6 text-left focus:outline-none"
        >
          <span class="text-body-lg font-semibold text-on-surface">{faq.question}</span>
          <svg 
            class={`w-6 h-6 text-on-surface-variant transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div 
          class={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
        >
          <p class="text-body-md text-on-surface-variant">{faq.answer}</p>
        </div>
      </div>
    {/each}
  </div>
</section>
