import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Highlights cards that need attention (e.g. pending approvals). */
  highlight?: boolean;
}

/** Compact stat tile for the dashboard. */
export function StatCard({ label, value, icon: Icon, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        'glass flex items-center gap-4 rounded-2xl p-5',
        highlight && value > 0 && 'border-gold/40 shadow-glow-gold',
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-xl border',
          highlight && value > 0
            ? 'border-gold/30 bg-gold/10 text-gold'
            : 'border-white/10 bg-white/5 text-ink-muted',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold tabular-nums text-ink">{value}</p>
        <p className="truncate text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
