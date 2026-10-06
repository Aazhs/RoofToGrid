'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '#calculator', label: 'Calculator', sectionId: 'calculator' },
  { href: '#how-it-works', label: 'How It Works', sectionId: 'how-it-works' },
  { href: '#principles', label: 'Principles', sectionId: 'principles' },
  { href: '#faq', label: 'FAQ', sectionId: 'faq' },
];

export default function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-spy: track which section is currently in view
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.sectionId);

    const handleScrollSpy = () => {
      // Get all section elements and sort by their position on the page
      const sections = sectionIds
        .map((id) => ({ id, el: document.getElementById(id) }))
        .filter((s): s is { id: string; el: HTMLElement } => s.el !== null)
        .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);

      let current: string | null = null;

      for (const { id, el } of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 80) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    handleScrollSpy();
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  const closeMobile = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'border-outline-variant/60 bg-surface/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
          : 'border-outline-variant/30 bg-surface'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 md:px-8">
        {/* Left: Logo */}
        <Link href="/" className="font-jakarta text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
          RoofToGrid
        </Link>

        {/* Center: Desktop Links with scroll-spy active indicator */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.sectionId;
            const label = link.label;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {/* Translucent active bubble */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full bg-surface-container border border-outline-variant/50 shadow-sm"
                    style={{ animation: 'fade-in-up 0.2s ease-out' }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </a>
            );
          })}
        </div>

        {/* Right: Login + CTA + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors duration-200 hover:text-on-surface md:block"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="hidden rounded-xl bg-primary-container px-6 py-2.5 text-sm font-semibold text-surface transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] md:block"
          >
            Try the demo
          </Link>
          
          {/* Hamburger / X toggle */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
              fill="currentColor"
              className={`absolute transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
              }`}
            >
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
              fill="currentColor"
              className={`absolute transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
              }`}
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu — animated slide-down */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-outline-variant/40 bg-surface/95 backdrop-blur-xl px-4 py-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId;
              const label = link.label;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-on-surface bg-on-surface/[0.06]'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                  onClick={closeMobile}
                >
                  {label}
                </a>
              );
            })}
            <Link
              href="/login"
              className="rounded-xl px-4 py-3 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface hover:bg-surface-container"
              onClick={closeMobile}
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              className="mt-2 w-full rounded-xl bg-primary-container px-6 py-3.5 text-center text-sm font-semibold text-surface transition-all hover:opacity-90"
              onClick={closeMobile}
            >
              Try the demo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
