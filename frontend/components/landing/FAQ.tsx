'use client';

import React, { useState } from 'react';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

const faqs = [
  {
    question: 'How accurate are the savings estimates?',
    answer: 'They are planning estimates based on published India averages, your inputs and the disclosed IN_2026_07 assumption set. They are not a site survey or location-specific irradiance simulation. Use the result to set a range and challenge quotes, then have the roof verified before signing.'
  },
  {
    question: 'Is my data safe?',
    answer: 'Yes. We use industry-standard bcrypt hashing for passwords, secure JWT for authentication, and private encrypted storage for your documents. You maintain complete ownership of your data.'
  },
  {
    question: 'Do I have to pay for RoofToGrid?',
    answer: 'Homeowners can access core features to plan their roof potential, track project milestones, and compare installer quotes.'
  },
  {
    question: 'How do you verify installers?',
    answer: 'Currently, you manually enter quotes from any installer you\'re considering. Our platform then normalizes and scores each quote for transparent comparison. In Phase 2, we plan to build an installer marketplace with an outcome-based reputation system and verified profiles.'
  },
  {
    question: 'What subsidies am I eligible for?',
    answer: 'The calculator applies the published central PM Surya Ghar sizing rule, up to ₹78,000, as a planning estimate. Final eligibility and payment depend on current programme, property, vendor and DISCOM requirements; verify them on the official portal.'
  },
  {
    question: 'Can I track my installation progress?',
    answer: 'Yes! RoofToGrid includes a comprehensive 9-milestone visual tracker that keeps you updated from initial quote approval to final grid integration and commissioning.'
  },
  {
    question: 'What happens after installation?',
    answer: 'After installation, you can log your monthly solar generation and we compare it against seasonal projections to flag underperformance. You also get warranty status tracking (Active / Expiring Soon / Expired) and a private document vault for all your project paperwork.'
  },
  {
    question: 'Who builds RoofToGrid?',
    answer: 'RoofToGrid is an independent, bootstrapped startup focused on bringing transparency and data-driven planning to India\'s residential solar market. We are not affiliated with any installer, manufacturer, or financing company — our recommendations are unbiased by design.'
  }
];

export function FAQ() {
  const [headerRef, headerVisible] = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="mx-auto max-w-[1180px] border-t border-outline-variant px-4 py-20 md:px-8 md:py-28">
      <div 
        ref={headerRef}
        className={`transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <h2 className="text-headline-lg md:text-display-lg font-semibold mb-12 font-jakarta">Common Questions</h2>
      </div>

      <div className="max-w-3xl">
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index}
            faq={faq}
            isOpen={openIndex === index}
            onToggle={() => toggleFAQ(index)}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function FAQItem({ faq, isOpen, onToggle, index }: { faq: any, isOpen: boolean, onToggle: () => void, index: number }) {
  const [ref, visible] = useScrollReveal();
  
  return (
    <div 
      ref={ref}
      style={{ transitionDelay: `${index * 50}ms` }}
      className={`border-b border-outline-variant transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex justify-between items-center py-6 text-left focus:outline-none"
      >
        <span className="text-body-lg font-semibold text-on-surface">{faq.question}</span>
        <svg 
          className={`w-6 h-6 text-on-surface-variant transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-body-md text-on-surface-variant">{faq.answer}</p>
      </div>
    </div>
  );
}
