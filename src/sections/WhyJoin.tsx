import { useTranslations } from 'next-intl';
import { Building2, DoorOpen, Headphones, Globe2, Sparkles, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';

/** Benefit cards. Keys map to `whyJoin.items.<key>.{title,description}`. */
const ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: 'music', icon: Headphones },
  { key: 'people', icon: Users },
  { key: 'student', icon: DoorOpen },
  { key: 'atmosphere', icon: Sparkles },
  { key: 'community', icon: Globe2 },
  { key: 'venue', icon: Building2 },
];

/** "Why you should join" — reasons to attend, as hoverable premium cards. */
export function WhyJoin() {
  const t = useTranslations('whyJoin');

  return (
    <Section id="why-join">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ key, icon: Icon }, i) => (
          <Reveal key={key} preset="fadeUp" delay={i * 0.06}>
            <article className="glass group flex h-full flex-col gap-4 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-card-hover">
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/20 bg-gold/5 text-gold transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                {t(`items.${key}.description`)}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
