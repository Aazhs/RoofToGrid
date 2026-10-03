'use client';

/** Authenticated / Prototype shell: sidebar, topbar, demo controls, and Pro status. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Spinner } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription';
import { UpiCheckoutModal } from '@/components/billing/UpiCheckoutModal';
import { resetDemoData } from '@/lib/demo-data';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { isPro, plan } = useSubscription();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading..." />
      </div>
    );
  }

  const isDemo = !user;

  const handleResetData = () => {
    if (confirm('Reset all demo data back to default sample state?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile Top Bar */}
      <header className="border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-bold flex items-center gap-1.5">
            <span>Roof<span className="text-brand-700">To</span>Grid</span>
            {isPro && (
              <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider">
                PRO
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {!isPro && (
              <button
                type="button"
                onClick={() => setCheckoutOpen(true)}
                className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-sm"
              >
                ⭐ Pro ₹499
              </button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
              aria-controls="app-nav"
            >
              {navOpen ? 'Close' : 'Menu'}
            </Button>
          </div>
        </div>
        {navOpen && (
          <nav id="app-nav" aria-label="Sections" className="border-t border-slate-200 px-2 py-2">
            <NavList pathname={pathname} isPro={isPro} onOpenCheckout={() => setCheckoutOpen(true)} />
          </nav>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <span>Roof<span className="text-brand-700">To</span>Grid</span>
            {isPro && (
              <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider shadow-sm">
                PRO
              </span>
            )}
          </Link>
        </div>

        {/* Demo Mode Notice */}
        {isDemo && (
          <div className="mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Prototype Mode
              </span>
              <button
                type="button"
                onClick={handleResetData}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                title="Reset sample data back to default"
              >
                Reset
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
              Exploring full platform capabilities with sample Bangalore homeowner data.
            </p>
          </div>
        )}

        {/* Pro Plan Card in Sidebar */}
        <div className="mx-3 mt-3">
          {isPro ? (
            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                  ⭐
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">RoofToGrid Pro Active</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">PDF Reports & Comparison Unlocked</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="w-full text-left rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 text-white p-3 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <span className="text-amber-400">⚡</span> RoofToGrid Pro
                </span>
                <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
                  ₹499/mo
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                Unlock PDF Feasibility Reports & unlimited quote comparisons →
              </p>
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav aria-label="Sections" className="flex-1 px-3 py-4 overflow-y-auto">
          <NavList pathname={pathname} isPro={isPro} onOpenCheckout={() => setCheckoutOpen(true)} />
        </nav>

        {/* User / Footer */}
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50/50">
          {user ? (
            <>
              <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <Button variant="ghost" size="sm" className="mt-1.5 px-0 text-xs text-slate-500 hover:text-slate-800" onClick={() => void logout()}>
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Arun Sharma (Demo)</p>
                <p className="text-[11px] text-slate-500">BESCOM · 5 kWp Solar</p>
              </div>
              <Link
                href="/"
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Landing →
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main" className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</div>
      </main>

      {/* Global UPI Checkout Modal */}
      <UpiCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}

function NavList({
  pathname,
  isPro,
  onOpenCheckout,
}: {
  pathname: string;
  isPro: boolean;
  onOpenCheckout: () => void;
}) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-50 text-brand-800 font-semibold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{item.label}</span>
              {item.href === '/quotes' && (
                <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                  3
                </span>
              )}
            </Link>
          </li>
        );
      })}

      {/* Direct link to checkout if not pro */}
      {!isPro && (
        <li className="pt-2">
          <button
            type="button"
            onClick={onOpenCheckout}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/60 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span>⭐</span> Unlock Pro
            </span>
            <span className="text-xs font-mono font-bold text-amber-800">₹499</span>
          </button>
        </li>
      )}
    </ul>
  );
}
