import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { config, getFullAddress } from '@/config/config';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';

/** Site footer — brand, contact, address, social, legal links. */
export function Footer() {
  const t = useTranslations('footer');
  const { contact, venue } = config;
  const year = new Date(config.startsAt).getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/10">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Logo size={48} withWordmark />
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{t('tagline')}</p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {t('contact')}
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-ink-muted">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-ink"
                >
                  <Mail className="h-4 w-4 text-gold/70" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-ink"
                >
                  <Phone className="h-4 w-4 text-gold/70" aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
              {contact.instagram && contact.instagramUrl ? (
                <li>
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-ink"
                  >
                    <Instagram className="h-4 w-4 text-gold/70" aria-hidden="true" />
                    {contact.instagram}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {t('address')}
            </h3>
            <address
              className="flex items-start gap-2 text-sm not-italic leading-relaxed text-ink-muted"
              aria-label={getFullAddress()}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
              <span>
                {venue.name}
                <br />
                {venue.street}
                <br />
                {venue.postalCode} {venue.city}
                <br />
                {venue.country}
              </span>
            </address>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-ink-faint sm:flex-row">
          <p>
            © {year} {config.organizer}. {t('rights')}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal" className="transition-colors hover:text-ink-muted">
              {t('legal')}
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-ink-muted">
              {t('privacy')}
            </Link>
            <span>{t('madeBy')}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
