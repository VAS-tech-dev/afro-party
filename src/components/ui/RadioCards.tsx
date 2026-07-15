'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RadioCardOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  /** Optional trailing element (e.g. a price). */
  aside?: ReactNode;
}

interface RadioCardsProps<T extends string> {
  /** Radio group name (shared across inputs). */
  name: string;
  legend: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: RadioCardOption<T>[];
  columns?: 1 | 2;
  invalid?: boolean;
}

/**
 * Accessible radio-card group built on real <input type="radio"> elements
 * (native keyboard/AT semantics) with a premium card presentation.
 */
export function RadioCards<T extends string>({
  name,
  legend,
  value,
  onChange,
  options,
  columns = 1,
  invalid,
}: RadioCardsProps<T>) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={cn('grid gap-3', columns === 2 && 'sm:grid-cols-2')}>
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                'group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all',
                checked
                  ? 'border-gold/60 bg-gold/10 shadow-glow-gold'
                  : 'border-white/10 bg-navy-900/40 hover:border-white/25',
                invalid && !value && 'border-red-400/50',
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors',
                  checked ? 'border-gold bg-gold text-navy-950' : 'border-white/30',
                )}
                aria-hidden="true"
              >
                {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">{opt.title}</span>
                  {opt.aside}
                </span>
                {opt.description ? (
                  <span className="mt-0.5 text-xs text-ink-muted">{opt.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
