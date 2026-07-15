import { useLocale, useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { config } from '@/config/config';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

/** Highlight the Student tier as the most-chosen option. */
const POPULAR_CATEGORY = 'STUDENT';

/**
 * Ticket pricing — one card per category, prices pulled from config.ts so the
 * admin Settings screen can change them in one place. Shown BEFORE the form so
 * visitors decide their tier first. Includes the VAS verification note.
 */
export function TicketPrices() {
  const t = useTranslations('prices');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <Section id="prices">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {config.categories.map((category, i) => {
          const isFree = category.price === 0;
          const isPopular = category.id === POPULAR_CATEGORY;

          return (
            <Reveal key={category.id} preset="fadeUp" delay={i * 0.06} className="h-full">
              <article
                className={cn(
                  'glass relative flex h-full flex-col gap-6 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
                  isPopular ? 'border-gold/50 shadow-glow-gold' : 'hover:border-gold/40',
                )}
              >
                {isPopular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy-950">
                    {t('popular')}
                  </span>
                ) : null}

                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {t(`categories.${category.id}.name`)}
                  </h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold text-gold-gradient">
                      {isFree ? tc('free') : formatPrice(category.price, locale, config.currency)}
                    </span>
                    {!isFree ? (
                      <span className="text-sm text-ink-faint">/ {t('perPerson')}</span>
                    ) : null}
                  </div>
                </div>

                <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                  {t(`categories.${category.id}.description`)}
                </p>

                <Button
                  href={`/register?category=${category.id}`}
                  variant={isPopular ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full"
                >
                  {t('cta')}
                </Button>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* Verification note */}
      <Reveal preset="fadeUp" className="mt-10">
        <div className="glass flex items-start gap-4 rounded-2xl border-gold/20 p-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
            <Info className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-display font-semibold text-ink">{t('note.title')}</p>
            <p className="text-sm leading-relaxed text-ink-muted">{t('note.body')}</p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
