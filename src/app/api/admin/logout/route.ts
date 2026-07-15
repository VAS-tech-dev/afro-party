import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';

/** POST /api/admin/logout — clears the session cookie. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
