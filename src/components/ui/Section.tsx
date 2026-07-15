import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container } from './Container';

interface SectionProps {
  /** Anchor id for in-page navigation (e.g. "prices"). */
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  containerSize?: 'default' | 'narrow' | 'wide';
}

/**
 * Standard landing section: consistent vertical rhythm + scroll-margin so
 * anchor links land below the fixed header, wrapped in a Container.
 */
export function Section({
  id,
  children,
  className,
  containerClassName,
  containerSize = 'default',
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('scroll-mt-24 py-20 sm:py-28', className)}
    >
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
