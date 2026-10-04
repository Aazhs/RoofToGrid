'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, type Language } from '@/lib/i18n';

export function LanguageSelector({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-outline-variant/40 bg-surface px-2.5 py-1.5 text-xs font-medium text-on-surface transition hover:border-outline-variant hover:bg-surface-container active:scale-95"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-sm">🌐</span>
        <span className="font-semibold">{activeLang.nativeName}</span>
        <svg
          className={`h-3 w-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-36 origin-top-right rounded-xl border border-outline-variant/40 bg-surface/95 py-1.5 shadow-lg backdrop-blur-xl animate-fade-in-up">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-1.5 text-xs transition ${
                lang.code === language
                  ? 'bg-brand-50 font-bold text-brand-900'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className="text-[10px] text-slate-400 uppercase">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
