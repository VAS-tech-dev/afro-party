import { config, type Locale } from '@/config/config';

/** Cookie name that stores the visitor's chosen locale. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** One year — the locale preference is sticky. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const locales = config.locales;
export const defaultLocale = config.defaultLocale;

export type { Locale };
