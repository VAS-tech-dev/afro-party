import {
  BadgeCheck,
  CreditCard,
  DoorOpen,
  GraduationCap,
  Hourglass,
  ScanLine,
  Ticket,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { computeStats, listRegistrations } from '@/services/admin';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { StatCard } from '@/features/admin/StatCard';

export const metadata = { title: 'Tableau de bord' };
// Always reflect the latest data.
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="glass rounded-2xl p-8 text-ink-muted">
        Base de données non configurée. Renseigne les variables Supabase dans{' '}
        <code className="text-gold">.env.local</code>.
      </div>
    );
  }

  const registrations = await listRegistrations();
  const stats = computeStats(registrations);

  const cards = [
    { label: 'Inscriptions', value: stats.total, icon: Users },
    { label: 'Membres VAS', value: stats.vasMembers, icon: BadgeCheck },
    { label: 'Étudiants', value: stats.students, icon: GraduationCap },
    { label: 'Non-étudiants', value: stats.nonStudents, icon: DoorOpen },
    { label: 'Engagés', value: stats.contributors, icon: UserCheck },
    { label: 'Membres à vérifier', value: stats.pendingMembers, icon: Hourglass, highlight: true },
    { label: 'Engagés à valider', value: stats.pendingContributors, icon: Hourglass, highlight: true },
    { label: 'Paiements attendus', value: stats.waitingPayment, icon: Wallet, highlight: true },
    { label: 'Payés', value: stats.paid, icon: CreditCard },
    { label: 'Billets envoyés', value: stats.ticketsGenerated, icon: Ticket },
    { label: 'Entrées scannées', value: stats.checkedIn, icon: ScanLine },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Tableau de bord</h1>
        <p className="mt-1 text-sm text-ink-muted">Vue d’ensemble des inscriptions à la soirée.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
