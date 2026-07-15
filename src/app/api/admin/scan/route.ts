import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { scanTicket } from '@/services/admin';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(1).max(64),
  /** true = perform check-in; false/absent = preview only. */
  confirm: z.boolean().optional().default(false),
});

/** POST /api/admin/scan — validate a scanned ticket (and optionally check in). */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'INVALID' }, { status: 400 });
  }

  const outcome = await scanTicket(parsed.data.token.trim(), parsed.data.confirm);
  return NextResponse.json({ ok: true, ...outcome });
}
