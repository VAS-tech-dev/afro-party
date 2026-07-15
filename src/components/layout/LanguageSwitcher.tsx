'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { setLocale } from '@/i18n/actions';
import { locales, type Locale } from '@/i18n/config';
import { localeMeta } from '@/config/site';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  /**
   * `dropdown` (default) — compact trigger + popup, used in the desktop header.
   * `inline` — the three languages laid out in a row, used inside the mobile
   * menu where a right-aligned popup would overflow the screen.
   */
  variant?: 'dropdown' | 'inline';
}

/**
 * Language selector. Writes the chosen locale to a cookie via a server action,
 * then refreshes the route so every server component re-renders in the new
 * language (no full page reload, no URL prefix).
 */
export function LanguageSwitcher({ className, variant = 'dropdown' }: LanguageSwitcherProps) {
  const current = useLocale() as Locale;
  const t = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape (dropdown only)
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (locale: Locale) => {
    setOpen(false);
    if (locale === current) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  // --- Inline variant (mobile) ---------------------------------------------
  if (variant === 'inline') {
    return (
      <div className={cn('flex w-full gap-2', className)} role="group" aria-label={t('language')}>
        {locales.map((locale) => {
          const meta = localeMeta[locale];
          const active = locale === current;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => choose(locale)}
              disabled={isPending}
              aria-pressed={active}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-60',
                active
                  ? 'border-gold/50 bg-gold/10 text-gold'
                  : 'border-white/10 bg-white/5 text-ink-muted hover:text-ink',
              )}
            >
              <span aria-hidden="true">{meta.flag}</span>
              {meta.short}
            </button>
          );
        })}
      </div>
    );
  }

  // --- Dropdown variant (desktop) ------------------------------------------
  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language')}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink-muted transition-colors hover:border-gold/40 hover:text-ink disabled:opacity-60"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">{localeMeta[current].short}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="glass-strong absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl p-1 shadow-glass"
        >
          {locales.map((locale) => {
            const meta = localeMeta[locale];
            const active = locale === current;
            return (
              <li key={locale} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => choose(locale)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    active ? 'bg-gold/10 text-gold' : 'text-ink-muted hover:bg-white/5 hover:text-ink',
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden="true">{meta.flag}</span>
                    {meta.label}
                  </span>
                  {active ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
