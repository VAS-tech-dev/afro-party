'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '@/config/config';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

/** Two-digit zero-padded string. */
const pad = (n: number) => n.toString().padStart(2, '0');

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="glass-strong relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl sm:h-24 sm:w-24">
        {/* Animate the number swap so ticking feels alive but calm. */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: '60%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-60%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-3xl font-bold tabular-nums text-gold-gradient sm:text-4xl"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">{label}</span>
    </div>
  );
}

/**
 * Live event countdown. Renders a stable placeholder before hydration
 * (useCountdown returns null) to avoid mismatches, then ticks every second.
 */
export function Countdown({ className }: { className?: string }) {
  const t = useTranslations('hero.countdown');
  const timeLeft = useCountdown(config.startsAt);

  const units = [
    { key: 'days', value: timeLeft ? String(timeLeft.days) : '—', label: t('days') },
    { key: 'hours', value: timeLeft ? pad(timeLeft.hours) : '—', label: t('hours') },
    { key: 'minutes', value: timeLeft ? pad(timeLeft.minutes) : '—', label: t('minutes') },
    { key: 'seconds', value: timeLeft ? pad(timeLeft.seconds) : '—', label: t('seconds') },
  ];

  return (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      {timeLeft?.isComplete ? (
        <p className="font-display text-2xl font-bold text-gold-gradient">{t('live')}</p>
      ) : (
        <>
          <p className="text-sm uppercase tracking-[0.25em] text-ink-muted">{t('title')}</p>
          <div className="flex items-center gap-3 sm:gap-4">
            {units.map((u) => (
              <Unit key={u.key} value={u.value} label={u.label} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
