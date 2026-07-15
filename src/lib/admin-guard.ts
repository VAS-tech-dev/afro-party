import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySession } from './auth';

/**
 * Route-handler guard (defense in depth alongside the middleware).
 * Returns a 401 NextResponse when the caller isn't an authenticated admin, or
 * `null` when the request may proceed.
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  return null;
}
