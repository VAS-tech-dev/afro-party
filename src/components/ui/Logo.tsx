import Image from 'next/image';
import Link from 'next/link';
import { config } from '@/config/config';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Pixel size of the square logo badge. */
  size?: number;
  /** Show the "Afro-Latina Party" wordmark next to the badge. */
  withWordmark?: boolean;
  className?: string;
  /** Wrap in a link to home. */
  href?: string;
}

/**
 * VAS logo lockup. The source asset is a navy JPEG, so it's framed inside a
 * rounded, gold-hairline badge which reads as an intentional emblem rather
 * than a floating square.
 */
export function Logo({ size = 44, withWordmark = false, className, href = '/' }: LogoProps) {
  const badge = (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/25 shadow-glow-gold"
      style={{ width: size, height: size }}
    >
      <Image
        src={config.assets.logoVas}
        alt="VAS — Verein Afrikanischer Studierende"
        width={size}
        height={size}
        priority
        className="h-full w-full object-cover"
      />
    </span>
  );

  const content = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      {badge}
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold tracking-tight text-ink">
            Afro-Latina Party
          </span>
          <span className="text-[0.7rem] uppercase tracking-[0.2em] text-gold/80">
            by {config.organizer}
          </span>
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Afro-Latina Party — home" className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
