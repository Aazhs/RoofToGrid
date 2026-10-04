'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const base = 'transition-all duration-700 ease-out';
  const hidden = 'opacity-0 translate-y-6';
  const visible = 'opacity-100 translate-y-0';

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-24 md:px-16 md:py-32">
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        
        {/* LEFT column */}
        <div>
          {/* Live product badge */}
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-medium text-on-surface-variant ${base} ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '50ms' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live Product · Free to Start
          </div>

          <h1
            className={`font-jakarta text-headline-lg md:text-display-lg font-semibold tracking-tight text-on-surface ${base} ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '100ms' }}
          >
            Your Roof.<br />
            Your Power.<br />
            <span className="text-primary-container">Your Savings.</span>
          </h1>
          
          <p
            className={`mt-6 max-w-xl text-body-lg text-on-surface-variant ${base} ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '250ms' }}
          >
            India&apos;s first independent rooftop solar planning platform. Size your system, compare installer quotes fairly, and track your project end-to-end — with PM Surya Ghar subsidies calculated automatically.
          </p>
          
          <div
            className={`mt-8 flex flex-col gap-4 sm:flex-row ${base} ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '400ms' }}
          >
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary-container px-8 py-4 text-center font-semibold text-surface transition-all duration-200 hover:bg-surface-tint hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Planning — It&apos;s Free &rarr;
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-outline-variant px-8 py-4 text-center font-semibold text-on-surface transition-all duration-200 hover:border-primary-container hover:text-primary-container"
            >
              See How It Works
            </a>
          </div>
          
          {/* Live social proof ticker */}
          <div 
            className={`mt-4 flex items-center gap-2 text-xs text-on-surface-variant ${base} ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '480ms' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span>
              <strong className="font-semibold text-on-surface">1,480+ homeowners</strong> modeled their roof this month · ₹2.1 Cr subsidies unlocked
            </span>
          </div>
          
          <div
            className={`mt-8 flex flex-wrap items-center gap-3 border-t border-outline-variant pt-8 ${base} ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '550ms' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-43-61v-82q-35 0-59.5-24.5T353-307v-43L151-552q-6 20-8.5 41.5T140-480q0 134 85 231.5T437-141Zm294-108q25-29 43.5-63t29-70.5q10.5-36.5 13.5-75T820-480q0-98-46-180t-126-140v6q0 35-24.5 59.5T564-710h-84v84q0 18-12 30t-30 12h-84v84h252q18 0 30 12t12 30v126h42q26 0 46.5 14t29.5 36Z"/></svg>
              Built for India
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M440-40v-400H280L600-920v400h160L440-40Z"/></svg>
              PM Surya Ghar Integrated
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor" className="text-primary-container"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
              Independent &amp; Unbiased
            </span>
          </div>
        </div>

        {/* RIGHT column */}
        <div
          className={`relative h-[400px] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low lg:h-[500px] group ${base} ${mounted ? visible : hidden}`}
          style={{ transitionDelay: '300ms' }}
        >
          {/* Optimized Next.js Hero Image */}
          <Image
            src="/house.jpg"
            alt="Rooftop solar installation on Indian home"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/35" />
          {/* Bottom gradient for card readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Floating Stats Card */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between rounded-xl border border-[#ffffff1a] bg-[#00000040] p-5 backdrop-blur-xl">
            <div>
              <p className="text-label-sm text-[#ffffffb3] uppercase tracking-wide">Estimated Output</p>
              <p className="font-jakarta text-headline-lg-mobile font-semibold text-[#ffffff]">12.4 kWh/day</p>
            </div>
            <div className="text-[#ffffffcc]">
              <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="currentColor">
                <path d="M440-40v-400H280L600-920v400h160L440-40Zm70-496v-250L352-520h148v250l158-266H510Z" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
