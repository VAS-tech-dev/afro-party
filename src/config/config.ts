/**
 * Central event configuration.
 *
 * Everything that describes the event lives here so it can be changed without
 * touching any component. The (future) admin Settings screen edits these same
 * values. Prices, dates, links, contacts — all here.
 *
 * NOTE: user-facing *copy* is NOT stored here — it lives in the translation
 * files (src/messages/*.json). This file holds structured, language-agnostic
 * data (dates, prices, URLs, categories).
 */

export type Locale = 'fr' | 'en' | 'de';

export type CategoryId = 'VAS_MEMBER' | 'STUDENT' | 'NON_STUDENT' | 'CONTRIBUTOR';

export interface TicketCategory {
  /** Stable identifier stored in the database. */
  id: CategoryId;
  /** Price in euros. `0` means free (Contributor). */
  price: number;
  /** Whether choosing this category requires a VAS member number (matricule). */
  requiresMemberNumber: boolean;
  /** Whether this category can opt into paying immediately. */
  canPayNow: boolean;
  /** Whether registrations in this category need admin approval before anything. */
  requiresApproval: boolean;
}

export interface EventConfig {
  /** Brand + event names. */
  eventName: string;
  organizer: string;
  organizerLong: string;

  /** ISO 8601 date-time WITH timezone offset — drives the countdown. */
  startsAt: string;
  /** IANA timezone the event is held in. */
  timezone: string;

  /** Venue. */
  venue: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };

  /** Ticket categories and pricing. */
  categories: TicketCategory[];
  currency: string;

  /** Contact + social. Instagram is optional (null hides it everywhere). */
  contact: {
    email: string;
    phone: string;
    instagram: string | null;
    instagramUrl: string | null;
  };

  /** Manual payment link (paypal.me — no PayPal API). */
  paypalLink: string;

  /** Brand assets (in /public). */
  assets: {
    logoVas: string;
    eventPoster: string;
    ogImage: string;
  };

  /** Supported locales, first is the default. */
  locales: Locale[];
  defaultLocale: Locale;
}

export const config: EventConfig = {
  eventName: 'Afro-Latina Party',
  organizer: 'VAS',
  organizerLong: 'Verein Afrikanischer Studierende',

  // Friday 17 July 2026, 22:00 — Germany is CEST (UTC+2) in July.
  startsAt: '2026-07-17T22:00:00+02:00',
  timezone: 'Europe/Berlin',

  venue: {
    name: 'BeatMatch Club',
    street: 'Karmeliterstraße 6',
    postalCode: '67547',
    city: 'Worms',
    country: 'Germany',
  },

  categories: [
    {
      id: 'VAS_MEMBER',
      price: 5,
      requiresMemberNumber: true,
      canPayNow: true,
      requiresApproval: true,
    },
    {
      id: 'STUDENT',
      price: 7,
      requiresMemberNumber: false,
      canPayNow: true,
      requiresApproval: false,
    },
    {
      id: 'NON_STUDENT',
      price: 10,
      requiresMemberNumber: false,
      canPayNow: true,
      requiresApproval: false,
    },
    {
      id: 'CONTRIBUTOR',
      price: 0,
      // Engaged VAS members provide their membership number and are verified;
      // their entry is free (no online payment).
      requiresMemberNumber: true,
      canPayNow: false,
      requiresApproval: true,
    },
  ],
  currency: 'EUR',

  contact: {
    email: 'info.vas.worms@gmail.com',
    phone: '+49 176 29424376',
    instagram: null,
    instagramUrl: null,
  },

  paypalLink: 'https://paypal.me/VASeV25',

  assets: {
    logoVas: '/logo-vas.jpeg',
    eventPoster: '/afro-party.jpeg',
    ogImage: '/og-image.png',
  },

  locales: ['fr', 'en', 'de'],
  defaultLocale: 'fr',
};

/* --------------------------------------------------------------------------
 * Derived helpers (pure, no side effects)
 * ------------------------------------------------------------------------ */

/** Look up a ticket category by id. Throws in dev if the id is unknown. */
export function getCategory(id: CategoryId): TicketCategory {
  const category = config.categories.find((c) => c.id === id);
  if (!category) {
    throw new Error(`Unknown ticket category: ${id}`);
  }
  return category;
}

/** Full formatted venue address on a single line. */
export function getFullAddress(): string {
  const { name, street, postalCode, city, country } = config.venue;
  return `${name}, ${street}, ${postalCode} ${city}, ${country}`;
}

/** Type guard for runtime-validating an arbitrary string as a Locale. */
export function isLocale(value: string): value is Locale {
  return (config.locales as string[]).includes(value);
}
