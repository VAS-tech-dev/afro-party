'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, ScanLine, Settings, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/registrations', label: 'Inscriptions', icon: Users },
  { href: '/admin/scanner', label: 'Scanner', icon: ScanLine },
  { href: '/admin/settings', label: 'Réglages', icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-gold/10 text-gold' : 'text-ink-muted hover:bg-white/5 hover:text-ink',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
    >
      <LogOut className="h-5 w-5" aria-hidden="true" />
      Déconnexion
    </button>
  );
}

/**
 * Admin chrome. The login page opts out (no sidebar); every other /admin route
 * gets the fixed sidebar (desktop) or a slide-down menu (mobile).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="glass-strong sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 p-5 lg:flex">
        <Logo size={40} withWordmark href="/admin" />
        <NavLinks />
        <LogoutButton />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="glass-strong sticky top-0 z-40 flex items-center justify-between px-5 py-3 lg:hidden">
          <Logo size={34} withWordmark href="/admin" />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ink"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-strong overflow-hidden border-b border-white/10 px-5 py-4 lg:hidden"
            >
              <NavLinks onNavigate={() => setMenuOpen(false)} />
              <div className="mt-2 border-t border-white/10 pt-2">
                <LogoutButton />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
