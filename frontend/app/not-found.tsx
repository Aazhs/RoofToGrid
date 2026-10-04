import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between text-on-surface">
      <header className="border-b border-outline-variant px-6 py-4">
        <Link href="/" className="font-jakarta text-xl font-bold tracking-tight text-on-surface inline-flex items-center gap-2">
          <span>RoofToGrid</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-surface font-mono">
            404
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary-container">
            <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="currentColor">
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-360h80v-240h-80v240Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320Z"/>
            </svg>
          </div>

          <h1 className="text-3xl font-bold font-jakarta mb-3">
            Page Not Found
          </h1>

          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            The page you are looking for has been moved, renamed, or doesn&apos;t exist. Let&apos;s get you back on the solar grid.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="rounded-xl bg-primary-container text-surface px-6 py-3 text-sm font-semibold hover:bg-surface-tint transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-outline-variant bg-surface-container text-on-surface px-6 py-3 text-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Open Dashboard
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-outline-variant/60 flex items-center justify-center gap-6 text-xs text-on-surface-variant/70">
            <Link href="/sizing" className="hover:text-on-surface transition-colors">Sizing Calculator</Link>
            <span>·</span>
            <Link href="/quotes" className="hover:text-on-surface transition-colors">Quote Comparison</Link>
            <span>·</span>
            <Link href="/pricing" className="hover:text-on-surface transition-colors">Pricing</Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/50 py-4 text-center text-xs text-on-surface-variant/60">
        © {new Date().getFullYear()} RoofToGrid Technologies
      </footer>
    </div>
  );
}
