import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { LoginForm } from '@/features/admin/LoginForm';

export const metadata: Metadata = { title: 'Admin · Connexion', robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const safeFrom = from && from.startsWith('/admin') ? from : '/admin';

  return (
    <Container size="narrow" className="flex min-h-dvh flex-col items-center justify-center py-20">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo size={56} href="" />
        <p className="text-sm uppercase tracking-[0.25em] text-gold">Espace administrateur</p>
      </div>
      <div className="glass-strong w-full max-w-md rounded-4xl p-8 sm:p-10">
        <h1 className="mb-6 text-center font-display text-2xl font-bold">Connexion</h1>
        <LoginForm from={safeFrom} />
      </div>
    </Container>
  );
}
