import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the SERVICE ROLE key.
 *
 * ⚠️ Never import this from a Client Component. The service-role key grants
 * full database access and bypasses RLS — it must stay on the server. It is
 * read from a non-`NEXT_PUBLIC_` env var, so it is never bundled to the client.
 */

/** Thrown when Supabase env vars are missing (e.g. not configured yet). */
export class SupabaseConfigError extends Error {
  constructor() {
    super('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    this.name = 'SupabaseConfigError';
  }
}

let cached: SupabaseClient | null = null;

/** Returns a memoized admin client, throwing SupabaseConfigError if unset. */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new SupabaseConfigError();
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Whether Supabase env vars are present (used for graceful API responses). */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
