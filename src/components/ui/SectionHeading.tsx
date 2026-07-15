import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { Reveal } from '@/components/motion/Reveal';

interface SectionHeadingProps {
  /** Small uppercase eyebrow above the title. */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

/** Consistent section header: eyebrow badge + gold-accented title + subtitle. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? <Badge tone="gold">{eyebrow}</Badge> : null}
      <h2 className="text-3xl leading-tight sm:text-4xl md:text-5xl">{title}</h2>
      {subtitle ? (
        <p className={cn('max-w-2xl text-base text-ink-muted sm:text-lg')}>{subtitle}</p>
      ) : null}
    </Reveal>
  );
}
