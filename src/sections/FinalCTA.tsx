import { useTranslations } from 'next-intl';
import { Sparkles, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/motion/Reveal';

/** Closing call-to-action — the last push to register. */
export function FinalCTA() {
  const t = useTranslations('cta');

  return (
    <Section>
      <Reveal preset="scaleIn">
        <div className="glass-strong relative overflow-hidden rounded-4xl px-6 py-16 text-center sm:px-16 sm:py-20">
          {/* Layered gold glows for a premium finale */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-gold/20 blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gold-light/15 blur-[110px]"
          />

          <div className="relative flex flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-gold">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              VAS · Worms
            </span>

            <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              {t('title')}
            </h2>
            <p className="max-w-md text-lg text-ink-muted">{t('subtitle')}</p>

            <Button href="/register" size="lg" className="mt-2">
              <Ticket className="h-5 w-5" aria-hidden="true" />
              {t('button')}
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
