import { useTranslations } from 'next-intl';
import { MapPin, Navigation } from 'lucide-react';
import { config, getFullAddress } from '@/config/config';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';

/** Venue block — address + a directions link (no embedded map, by design). */
export function Location() {
  const t = useTranslations('location');
  const { venue } = config;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress())}`;

  return (
    <Section id="location" containerSize="narrow">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <Reveal preset="scaleIn" className="mt-14">
        <div className="glass-strong relative flex flex-col items-center gap-6 overflow-hidden rounded-4xl p-10 text-center sm:p-14">
          {/* Ambient gold halo behind the pin */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"
          />

          <span className="relative grid h-20 w-20 place-items-center rounded-3xl border border-gold/30 bg-gold/10 text-gold shadow-glow-gold">
            <MapPin className="h-10 w-10" aria-hidden="true" />
          </span>

          <address className="relative flex flex-col gap-1 not-italic">
            <span className="font-display text-2xl font-bold text-ink">{venue.name}</span>
            <span className="text-ink-muted">{venue.street}</span>
            <span className="text-ink-muted">
              {venue.postalCode} {venue.city}
            </span>
            <span className="text-ink-faint">{venue.country}</span>
          </address>

          <Button href={mapsUrl} external variant="outline" size="md" className="relative">
            <Navigation className="h-4 w-4" aria-hidden="true" />
            {t('directions')}
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
