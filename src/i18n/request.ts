import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { isLocale } from '@/config/config';
import { LOCALE_COOKIE, defaultLocale, type Locale } from './config';

/**
 * Resolves the active locale for a request (no URL prefix — "without i18n
 * routing" mode). Precedence:
 *   1. NEXT_LOCALE cookie (explicit user choice)
 *   2. Accept-Language header (best-effort first visit)
 *   3. configured default locale
 */
async function resolveLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = (await headers()).get('accept-language') ?? '';
  const preferred = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0]?.trim().slice(0, 2).toLowerCase())
    .find((code) => code && isLocale(code));

  return preferred && isLocale(preferred) ? preferred : defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
