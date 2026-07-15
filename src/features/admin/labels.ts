import type { Category } from '@/types/registration';
import type { Locale } from '@/config/config';

/** French display labels for admin UI (internal tool). */
export const CATEGORY_LABEL: Record<Category, string> = {
  VAS_MEMBER: 'Membre VAS',
  STUDENT: 'Étudiant',
  NON_STUDENT: 'Non-étudiant',
  CONTRIBUTOR: 'Engagé VAS',
};

export const LANGUAGE_LABEL: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
};

/** French date-time formatter for admin timestamps. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}
