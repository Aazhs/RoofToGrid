'use client';

/** Authenticated shell: sidebar, topbar and a client-side guard (design §5). */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your account" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen lg:flex">
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

      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="px-4 py-4">
          <Link href="/dashboard" className="text-lg font-semibold">
            Roof<span className="text-brand-700">To</span>Grid
          </Link>
        </div>
        <nav aria-label="Sections" className="flex-1 px-2">
          <NavList pathname={pathname} />
        </nav>
        <div className="border-t border-slate-200 px-4 py-3">
          <p className="truncate text-sm font-medium text-slate-800">{user.fullName}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
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
