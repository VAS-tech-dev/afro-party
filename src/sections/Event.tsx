import { useTranslations } from 'next-intl';
import { Disc3, Globe2, Music, Music2, Music4, Radio, Sparkles, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';

/** Music genres + vibes, each with its own icon. Keys map to `event.items.*`. */
const ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: 'afrobeats', icon: Music },
  { key: 'amapiano', icon: Disc3 },
  { key: 'dancehall', icon: Radio },
  { key: 'latino', icon: Music2 },
  { key: 'reggaeton', icon: Music4 },
  { key: 'international', icon: Globe2 },
  { key: 'networking', icon: Users },
  { key: 'atmosphere', icon: Sparkles },
];

/** Presents the event through a grid of premium sound/vibe tiles. */
export function Event() {
  const t = useTranslations('event');

  return (
    <Section id="event">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <Reveal
        as="div"
        preset="fadeIn"
        className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {ITEMS.map(({ key, icon: Icon }, i) => (
          <Reveal key={key} preset="fadeUp" delay={i * 0.05}>
            <div className="glass group flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-card-hover">
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/20 bg-gold/5 text-gold transition-colors group-hover:bg-gold/10">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="font-display text-sm font-semibold text-ink sm:text-base">
                {t(`items.${key}`)}
              </span>
            </div>
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
