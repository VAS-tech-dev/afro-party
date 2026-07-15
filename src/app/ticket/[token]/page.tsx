import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { config, getCategory, getFullAddress } from '@/config/config';
import { formatPrice } from '@/lib/utils';
import { getRegistrationByToken } from '@/services/registration';
import { isValidTicketToken } from '@/lib/ticket';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';

export const metadata: Metadata = { title: 'Billet', robots: { index: false } };
export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function NotFound() {
  return (
    <Container size="narrow" className="flex min-h-dvh flex-col items-center justify-center py-20 text-center">
      <div className="glass-strong flex flex-col items-center gap-4 rounded-4xl p-10">
        <TicketIcon className="h-10 w-10 text-ink-faint" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold">Billet introuvable</h1>
        <p className="text-ink-muted">Ce billet n’existe pas ou n’a pas encore été émis.</p>
        <Link href="/" className="text-gold hover:underline">Retour à l’accueil</Link>
      </div>
    </Container>
  );
}

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isValidTicketToken(token)) return <NotFound />;

  const reg = await getRegistrationByToken(token);
  if (!reg || !reg.ticketToken || reg.ticketStatus === 'NOT_GENERATED') return <NotFound />;

  const price = getCategory(reg.category).price;
  const entry = price === 0 ? 'Gratuit' : formatPrice(price, 'fr', config.currency);
  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: config.timezone,
  }).format(new Date(config.startsAt));
  const time = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit', minute: '2-digit', timeZone: config.timezone,
  }).format(new Date(config.startsAt));

  return (
    <Container size="narrow" className="flex min-h-dvh flex-col items-center justify-center py-16">
      <div className="w-full max-w-sm overflow-hidden rounded-4xl border border-gold/25 bg-navy-900/70 shadow-glow-gold-lg backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-navy-800 to-navy-900 px-6 py-6 text-center">
          <Logo size={44} href="" />
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Afro-Latina Party</p>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center gap-4 px-6 py-6">
          <div className="rounded-2xl border-4 border-gold bg-white p-2">
            <Image
              src={`${APP_URL}/api/ticket/qr?token=${encodeURIComponent(reg.ticketToken)}`}
              alt="QR code du billet"
              width={220}
              height={220}
              unoptimized
              className="h-56 w-56"
            />
          </div>
          {reg.checkedIn ? (
            <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
              Déjà scanné
            </span>
          ) : null}
        </div>

        {/* Perforation */}
        <div className="relative h-6">
          <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-white/20" />
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-navy-950" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-navy-950" />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3 px-6 pb-8 pt-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-faint">Titulaire</p>
            <p className="font-display text-xl font-bold text-ink">{reg.firstName} {reg.lastName}</p>
            <p className="text-sm text-gold">{entry}</p>
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 pt-3 text-sm text-ink-muted">
            <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {date}</p>
            <p className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> {time}</p>
            <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {getFullAddress()}</p>
          </div>
          {reg.ticketId ? (
            <p className="mt-1 text-center font-mono text-xs text-ink-faint">{reg.ticketId}</p>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
