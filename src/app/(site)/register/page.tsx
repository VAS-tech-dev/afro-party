import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import type { CategoryId } from '@/config/config';
import { CATEGORY_VALUES } from '@/schemas/registration.schema';
import { Container } from '@/components/ui/Container';
import { RegistrationForm } from '@/features/registration/RegistrationForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('register');
  return { title: t('title'), description: t('subtitle') };
}

/** Narrow a raw query value to a valid category id. */
function parseCategory(value: string | string[] | undefined): CategoryId | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && (CATEGORY_VALUES as readonly string[]).includes(v) ? (v as CategoryId) : undefined;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const t = await getTranslations('register');
  const tc = await getTranslations('common');

  return (
    <Container size="narrow" className="min-h-dvh py-28 sm:py-32">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {tc('backHome')}
      </Link>

      <div className="glass-strong rounded-4xl p-6 sm:p-10">
        <header className="mb-8 flex flex-col gap-2 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
          <p className="text-ink-muted">{t('subtitle')}</p>
        </header>

        <RegistrationForm defaultCategory={parseCategory(category)} />
      </div>
    </Container>
  );
}
