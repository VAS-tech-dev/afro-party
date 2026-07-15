import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { computeStats, listRegistrations } from '@/services/admin';

export const runtime = 'nodejs';

/** GET /api/admin/registrations — full list + aggregate stats. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const registrations = await listRegistrations();
  return NextResponse.json({
    ok: true,
    registrations,
    stats: computeStats(registrations),
  });
}
