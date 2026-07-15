import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { CalendarDays, Clock, MapPin, Ticket } from 'lucide-react';
import { config } from '@/config/config';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Countdown } from '@/components/Countdown';

/**
 * Cinematic hero. Split layout on desktop: headline + info + CTAs on the left,
 * the official event poster framed on the right; the live countdown spans the
 * full width beneath.
 *
 * The entrance animation is CSS-driven (`animate-fade-up`), not scroll/JS
 * gated — this is the LCP content, so it must paint immediately and stay
 * visible even before hydration. Reduced-motion is honored globally.
 */
export function Hero() {
  const t = useTranslations('hero');
  const tc = useTranslations('common');

  const info = [
    { icon: CalendarDays, label: t('date') },
    { icon: Clock, label: t('time') },
    { icon: MapPin, label: `${config.venue.name} · ${config.venue.city}` },
  ];

  // Staggered CSS entrance — small increasing delays per block.
  const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <Container className="flex flex-col gap-16 py-10 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy */}
          <div className="flex flex-col items-start gap-6 text-left">
            <div className="animate-fade-up" style={delay(0)}>
              <Badge tone="gold">{t('organizedBy')}</Badge>
            </div>

            <h1
              className="animate-fade-up font-display text-5xl font-extrabold leading-[0.92] tracking-tight sm:text-6xl xl:text-7xl"
              style={delay(80)}
            >
              <span className="text-gold-gradient">AFRO-LATINA</span>
              <br />
              <span className="text-ink">PARTY</span>
            </h1>

            <p className="animate-fade-up max-w-md text-lg text-ink-muted" style={delay(160)}>
              {t('tagline')}
            </p>

            <ul className="animate-fade-up flex flex-wrap gap-2.5" style={delay(240)}>
              {info.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ink-muted"
                >
                  <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>

            <div
              className="animate-fade-up mt-2 flex flex-col gap-3 sm:flex-row"
              style={delay(320)}
            >
              <Button href="/register" size="lg">
                <Ticket className="h-5 w-5" aria-hidden="true" />
                {tc('registerNow')}
              </Button>
              <Button href="#prices" size="lg" variant="outline">
                {tc('viewPrices')}
              </Button>
            </div>
          </div>

          {/* Right — poster */}
          <div className="animate-fade-up mx-auto w-full max-w-md lg:max-w-none" style={delay(200)}>
            <div className="animate-float">
              <div className="relative aspect-square overflow-hidden rounded-4xl border border-gold/25 shadow-glow-gold-lg">
                <Image
                  src={config.assets.eventPoster}
                  alt={t('posterAlt')}
                  fill
                  sizes="(max-width: 1024px) 90vw, 640px"
                  className="object-cover"
                  priority
                />
                {/* Navy scrim to seat the poster in the palette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-4xl ring-1 ring-inset ring-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="animate-fade-up" style={delay(360)}>
          <Countdown className="rounded-4xl border border-white/10 bg-navy-900/40 py-10 backdrop-blur-sm" />
        </div>
      </Container>
    </section>
  );
}
