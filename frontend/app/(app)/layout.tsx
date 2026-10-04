'use client';

/** Authenticated / Prototype shell: sidebar, topbar, and Pro subscription state. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Spinner } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription';
import { UpiCheckoutModal } from '@/components/billing/UpiCheckoutModal';
import { resetDemoData } from '@/lib/demo-data';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { isPro } = useSubscription();
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
    if (confirm('Reset demo data back to default sample state?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile Top Bar */}
      <header className="border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-semibold">
            Roof<span className="text-brand-700">To</span>Grid
          </Link>
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
        {navOpen && (
          <nav id="app-nav" aria-label="Sections" className="border-t border-slate-200 px-2 py-2">
            <NavList pathname={pathname} />
          </nav>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold">
            Roof<span className="text-brand-700">To</span>Grid
          </Link>
          {isPro && <Badge tone="brand">Pro</Badge>}
        </div>

        {/* Navigation */}
        <nav aria-label="Sections" className="flex-1 px-2 py-2">
          <NavList pathname={pathname} />
        </nav>

        {/* User Footer */}
        <div className="border-t border-slate-200 px-4 py-3">
          {user ? (
            <>
              <p className="truncate text-sm font-medium text-slate-800">{user.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => void logout()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-slate-800">Demo User</p>
                <Badge tone="muted">Demo</Badge>
              </div>
              <p className="truncate text-xs text-slate-500">demo@rooftogrid.in</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <Link href="/login" className="font-medium text-brand-700 hover:underline">
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="text-slate-400 hover:text-slate-600"
                  title="Reset sample data"
                >
                  Reset data
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
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

function NavList({ pathname }: { pathname: string }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
