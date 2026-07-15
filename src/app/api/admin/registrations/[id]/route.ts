import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import {
  AdminActionError,
  approveContributor,
  approveMember,
  getRegistrationById,
  markPaymentReceived,
  rejectContributor,
  rejectMember,
  resendTicket,
  undoPayment,
  updateNotes,
} from '@/services/admin';

export const runtime = 'nodejs';

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approveMember') }),
  z.object({ action: z.literal('rejectMember'), convertTo: z.enum(['STUDENT', 'NON_STUDENT']) }),
  z.object({ action: z.literal('approveContributor') }),
  z.object({ action: z.literal('rejectContributor') }),
  z.object({ action: z.literal('paymentReceived') }),
  z.object({ action: z.literal('undoPayment') }),
  z.object({ action: z.literal('resendTicket') }),
  z.object({ action: z.literal('updateNotes'), notes: z.string().max(2000) }),
]);

/** GET /api/admin/registrations/[id] — single registration detail. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const reg = await getRegistrationById(id);
  if (!reg) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true, registration: reg });
}

/** POST /api/admin/registrations/[id] — run an admin action. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'INVALID_ACTION' }, { status: 400 });
  }

  try {
    const input = parsed.data;
    let registration;
    switch (input.action) {
      case 'approveMember':
        registration = await approveMember(id);
        break;
      case 'rejectMember':
        registration = await rejectMember(id, input.convertTo);
        break;
      case 'approveContributor':
        registration = await approveContributor(id);
        break;
      case 'rejectContributor':
        registration = await rejectContributor(id);
        break;
      case 'paymentReceived':
        registration = await markPaymentReceived(id);
        break;
      case 'undoPayment':
        registration = await undoPayment(id);
        break;
      case 'resendTicket':
        registration = await resendTicket(id);
        break;
      case 'updateNotes':
        registration = await updateNotes(id, input.notes);
        break;
    }
    return NextResponse.json({ ok: true, registration });
  } catch (error) {
    if (error instanceof AdminActionError) {
      const status = error.code === 'NOT_FOUND' ? 404 : 409;
      return NextResponse.json({ ok: false, error: error.code }, { status });
    }
    console.error('[admin action] error:', error);
    return NextResponse.json({ ok: false, error: 'UNKNOWN' }, { status: 500 });
  }
}
