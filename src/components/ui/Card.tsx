import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a lift + gold glow on hover. */
  interactive?: boolean;
}

/**
 * Frosted glass surface — the base building block for feature cards, ticket
 * cards, FAQ items and dashboard panels.
 */
export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6',
        interactive &&
          'group transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-card-hover',
        className,
      )}
    >
      {children}
    </div>
  );
}
