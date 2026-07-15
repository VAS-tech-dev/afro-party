'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'transition-all duration-300 will-change-transform focus-visible:ring-2 focus-visible:ring-gold ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:cursor-not-allowed ' +
  'disabled:opacity-50 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary:
    'bg-gold-gradient text-navy-950 shadow-glow-gold hover:shadow-glow-gold-lg hover:-translate-y-0.5',
  secondary: 'glass text-ink hover:border-gold/40 hover:-translate-y-0.5',
  outline:
    'border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold hover:-translate-y-0.5',
  ghost: 'text-ink-muted hover:text-ink hover:bg-white/5',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  /** External links open in a new tab. */
  external?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Primary interactive control. Renders a <button> by default, or a Next.js
 * <Link> when `href` is provided. Animated gold "shine" sweeps on hover for
 * the primary variant.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const shine =
    variant === 'primary' ? (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </span>
    ) : null;

  if ('href' in props && props.href !== undefined) {
    const { href, external } = props;
    const externalProps = external
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {};
    return (
      <Link href={href} className={classes} {...externalProps}>
        {shine}
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </Link>
    );
  }

  // Strip the presentational props so only real button attributes (type,
  // disabled, onClick…) are spread — otherwise the passed className would
  // override the computed variant classes.
  const {
    href: _href,
    variant: _variant,
    size: _size,
    className: _className,
    children: _children,
    ...buttonProps
  } = props as ButtonAsButton;
  return (
    <button ref={ref} className={classes} {...buttonProps}>
      {shine}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});
