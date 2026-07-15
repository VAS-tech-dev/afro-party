import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'gold' | 'navy' | 'neutral';

const tones: Record<Tone, string> = {
  gold: 'border-gold/30 bg-gold/10 text-gold',
  navy: 'border-navy-600/50 bg-navy-800/60 text-ink-muted',
  neutral: 'border-white/10 bg-white/5 text-ink-muted',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

/** Small pill label — eyebrows, statuses, tags. */
export function Badge({ children, tone = 'gold', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
