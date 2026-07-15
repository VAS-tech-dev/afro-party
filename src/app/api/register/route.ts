import { NextResponse } from 'next/server';
import { makeRegistrationSchema } from '@/schemas/registration.schema';
import { createRegistration, RegistrationError } from '@/services/registration';
import { sendConfirmationEmail } from '@/services/email';
import { isSupabaseConfigured, SupabaseConfigError } from '@/lib/supabase/server';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

/** Runs on the Node.js runtime (Supabase service-role client). */
export const runtime = 'nodejs';

/**
 * POST /api/register
 * Public endpoint that persists a registration.
 *
 * Defense layers, in order:
 *  1. Rate limit per IP (burst protection).
 *  2. Honeypot — a filled `website` field means a bot; we return a fake success
 *     so the bot believes it worked, and never touch the database.
 *  3. Zod validation (with the server-side default messages).
 *  4. Service-layer business rules + DB insert.
 */
export async function POST(request: Request) {
  // 1) Rate limit
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`register:${ip}`, 5, 10 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json(
      { ok: false, error: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  // 2) Honeypot — silently accept without persisting.
  const honeypot = (body as Record<string, unknown>)?.website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return NextResponse.json({ ok: true, registrationCode: 'REG-0000-000000' });
  }

  // 3) Validate
  const parsed = makeRegistrationSchema().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'VALIDATION', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Guard: clear message if the database isn't set up yet.
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
  }

  // 4) Persist
  try {
    const result = await createRegistration({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      language: parsed.data.language,
      category: parsed.data.category,
      memberNumber: parsed.data.memberNumber,
      payNow: parsed.data.payNow,
    });

    // Immediate confirmation email (best-effort — never fail the registration
    // if email is down or not configured).
    try {
      await sendConfirmationEmail({
        recipient: {
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          language: parsed.data.language,
        },
        category: parsed.data.category,
        payNow: parsed.data.payNow,
      });
    } catch (emailError) {
      console.error('[register] confirmation email failed:', emailError);
    }

    return NextResponse.json({
      ok: true,
      registrationCode: result.registrationCode,
      status: result.status,
    });
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
    }
    if (error instanceof RegistrationError) {
      return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: 'UNKNOWN' }, { status: 500 });
  }
}
