/**
 * Site-level navigation and metadata config.
 * Labels are translation keys (resolved via next-intl), not literal text.
 */

export interface NavItem {
  /** Translation key under `nav.*`. */
  labelKey: string;
  /** In-page anchor (landing sections) or route. */
  href: string;
}

/** Public header navigation — anchors to landing sections. */
export const navItems: NavItem[] = [
  { labelKey: 'event', href: '#event' },
  { labelKey: 'whyJoin', href: '#why-join' },
  { labelKey: 'prices', href: '#prices' },
  { labelKey: 'location', href: '#location' },
];

/** Admin sidebar navigation. */
export const adminNavItems = [
  { labelKey: 'dashboard', href: '/admin' },
  { labelKey: 'registrations', href: '/admin/registrations' },
  { labelKey: 'scanner', href: '/admin/scanner' },
  { labelKey: 'settings', href: '/admin/settings' },
] as const;

/** Locale metadata for the language switcher. */
export const localeMeta = {
  fr: { label: 'Français', short: 'FR', flag: '🇫🇷' },
  en: { label: 'English', short: 'EN', flag: '🇬🇧' },
  de: { label: 'Deutsch', short: 'DE', flag: '🇩🇪' },
} as const;
