import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ADMIN_COOKIE, createSession, sessionCookieOptions } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

/**
 * POST /api/admin/login
 * Verifies credentials against env vars (ADMIN_EMAIL + ADMIN_PASSWORD_HASH),
 * then sets a signed session cookie. Rate-limited to blunt brute force.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`admin-login:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ ok: false, error: 'RATE_LIMITED' }, { status: 429 });
  }

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

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const emailOk = adminEmail && parsed.data.email.toLowerCase() === adminEmail;
  const passwordOk = verifyPassword(parsed.data.password, process.env.ADMIN_PASSWORD_HASH);

  // Same generic error for either failure (don't reveal which was wrong).
  if (!emailOk || !passwordOk) {
    return NextResponse.json({ ok: false, error: 'INVALID_CREDENTIALS' }, { status: 401 });
  }

  const token = await createSession(parsed.data.email.toLowerCase());
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions);
  return response;
}
