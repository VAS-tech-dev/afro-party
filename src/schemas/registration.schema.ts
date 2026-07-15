import { z } from 'zod';

/**
 * Registration validation — single source of truth shared by the client form
 * and the API route. The schema is produced by a factory so the same rules can
 * carry translated messages on the client and default messages on the server.
 */

export const CATEGORY_VALUES = ['VAS_MEMBER', 'STUDENT', 'NON_STUDENT', 'CONTRIBUTOR'] as const;
export const LANGUAGE_VALUES = ['fr', 'en', 'de'] as const;

export interface RegistrationMessages {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  category: string;
  memberNumber: string;
  language: string;
}

/** Neutral fallback messages (used server-side; client passes translations). */
export const DEFAULT_MESSAGES: RegistrationMessages = {
  firstName: 'Please enter your first name.',
  lastName: 'Please enter your last name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  category: 'Please choose a category.',
  memberNumber: 'Your VAS membership number is required.',
  language: 'Please choose a language.',
};

export function makeRegistrationSchema(m: RegistrationMessages = DEFAULT_MESSAGES) {
  return z
    .object({
      firstName: z.string().trim().min(1, m.firstName).max(80),
      lastName: z.string().trim().min(1, m.lastName).max(80),
      email: z.string().trim().min(1, m.email).email(m.email).max(160),
      phone: z.string().trim().min(6, m.phone).max(40),
      language: z.enum(LANGUAGE_VALUES, { errorMap: () => ({ message: m.language }) }),
      category: z.enum(CATEGORY_VALUES, { errorMap: () => ({ message: m.category }) }),
      memberNumber: z.string().trim().max(60).optional().default(''),
      payNow: z.boolean().default(false),
      // Honeypot: real users leave this empty; bots tend to fill every field.
      // Kept permissive so the API route can react *silently* (fake success)
      // rather than returning a tell-tale validation error.
      website: z.string().optional().default(''),
    })
    .superRefine((data, ctx) => {
      // Both VAS members (paid tier) and engaged VAS members (free tier) must
      // provide a membership number, verified by an admin.
      const needsMemberNumber =
        data.category === 'VAS_MEMBER' || data.category === 'CONTRIBUTOR';
      if (needsMemberNumber && data.memberNumber.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['memberNumber'],
          message: m.memberNumber,
        });
      }
    });
}

/** Inferred form/API value type. */
export type RegistrationFormValues = z.infer<ReturnType<typeof makeRegistrationSchema>>;
