import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SuccessCheck } from '@/features/registration/SuccessCheck';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('success');
  return { title: t('title') };
}

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const t = await getTranslations('success');
  const tc = await getTranslations('common');

  return (
    <Container size="narrow" className="flex min-h-dvh flex-col items-center justify-center py-28 text-center">
      <div className="glass-strong flex w-full flex-col items-center gap-6 rounded-4xl p-10 sm:p-14">
        <SuccessCheck />

        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
          <p className="mx-auto max-w-md text-ink-muted">{t('body')}</p>
        </div>

        {code ? (
          <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-navy-900/50 px-6 py-3">
            <span className="text-xs uppercase tracking-widest text-ink-faint">{t('reference')}</span>
            <span className="font-display text-lg font-semibold text-gold-gradient">{code}</span>
          </div>
        ) : null}

        <Button href="/" size="lg" variant="secondary">
          {tc('backHome')}
        </Button>
      </div>
    </Container>
  );
}
