'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

/**
 * Hook that detects when an element enters the viewport and triggers a reveal
 * animation. Returns ref, visibility state, and inline styles for the transition.
 *
 * Supports multiple destructuring patterns used across landing components:
 *   const { ref, isVisible } = useScrollReveal();        // FeatureGrid, StatsCounter, Testimonials
 *   const { ref, style } = useScrollReveal();             // HowItWorks (reveal.ref, reveal.style)
 *   const [ref, visible] = useScrollReveal();              // FAQ, ComparisonSection, CTABanner
 */

type ScrollRevealReturn<T extends HTMLElement = HTMLDivElement> = {
  ref: RefObject<T | null>;
  isVisible: boolean;
  style: CSSProperties;
} & readonly [RefObject<T | null>, boolean];

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string } = {},
): ScrollRevealReturn<T> {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const style: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 600ms ease-out, transform 600ms ease-out',
  };

  // Create an object that supports both named-property and tuple destructuring.
  // The tuple entries [0] and [1] enable `const [ref, visible] = useScrollReveal()`.
  const result = {
    0: ref,
    1: isVisible,
    ref,
    isVisible,
    style,
    length: 2,
    [Symbol.iterator](): IterableIterator<RefObject<T | null> | boolean> {
      let i = 0;
      return {
        next: () =>
          i < 2
            ? { value: i++ === 0 ? ref : isVisible, done: false }
            : { value: undefined, done: true },
        [Symbol.iterator]() {
          return this;
        },
      };
    },
  } as unknown as ScrollRevealReturn<T>;

  return result;
}
