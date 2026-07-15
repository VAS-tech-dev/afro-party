import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { isLocale } from '@/config/config';
import { LOCALE_COOKIE, defaultLocale, type Locale } from './config';

/**
 * Resolves the active locale for a request (no URL prefix — "without i18n
 * routing" mode). Precedence:
 *   1. NEXT_LOCALE cookie (explicit user choice)
 *   2. configured default locale (German)
 *
 * The browser's Accept-Language is intentionally NOT used, so every first-time
 * visitor sees German first (the event is in Germany); they can still switch.
 */
async function resolveLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
