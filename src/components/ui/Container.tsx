import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Narrower max-width for reading-heavy content (forms, FAQ). */
  size?: 'default' | 'narrow' | 'wide';
}

const sizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
} as const;

/** Centered, responsive content wrapper with consistent horizontal padding. */
export function Container({ children, className, as: Tag = 'div', size = 'default' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8', sizes[size], className)}>{children}</Tag>
  );
}
