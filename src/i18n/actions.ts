'use server';

import { cookies } from 'next/headers';
import { isLocale } from '@/config/config';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from './config';

/**
 * Server Action: persist the visitor's locale choice in a cookie.
 * The page is re-rendered by the caller (router.refresh) so all server
 * components pick up the new locale from src/i18n/request.ts.
 */
export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });
}
