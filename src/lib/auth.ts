import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

/**
 * Admin session handling with `jose` (Edge-compatible — safe to use from
 * middleware). The session is a signed JWT stored in an httpOnly cookie.
 *
 * Password hashing lives in a separate, Node-only module (lib/password.ts)
 * because it uses node:crypto, which the Edge runtime doesn't provide.
 */

export const ADMIN_COOKIE = 'vas_admin';
const SESSION_TTL = '7d';

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set.');
  return new TextEncoder().encode(secret);
}

/** Sign a session token for the given admin email. */
export async function createSession(email: string): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

/** Verify a session token; returns the payload or null if invalid/expired. */
export async function verifySession(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

/** Cookie options for the session (max-age must match SESSION_TTL). */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};
