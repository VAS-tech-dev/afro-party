import type { Locale } from '@/config/config';

/**
 * Email copy, kept separate from the site's UI translations (src/messages/*)
 * because emails render outside the request/next-intl context. One typed
 * interface keeps the three locales aligned.
 *
 * Strings may contain {name} / {amount} placeholders, filled with `interpolate`.
 */

export interface EmailDict {
  common: {
    greeting: string; // "Hi {name},"
    reference: string;
    amount: string;
    reply: string;
    eventLabel: string;
    free: string;
  };
  confirmation: {
    subject: string;
    preview: string;
    title: string;
    intro: string;
    payNowIntro: string;
    payButton: string; // "Pay {amount} via PayPal"
    payLater: string; // "...{amount}..."
    memberPending: string;
    contributorPending: string;
    ticketLater: string;
    ticketLaterFree: string;
  };
  payment: {
    subject: string;
    preview: string;
    title: string;
    approvedIntro: string;
    genericIntro: string;
    payButton: string;
    afterPay: string;
  };
  ticket: {
    subject: string;
    preview: string;
    title: string;
    intro: string;
    introFree: string;
    idLabel: string;
    categoryLabel: string;
    nameLabel: string;
    warning: string;
  };
  memberApproved: {
    subject: string;
    preview: string;
    title: string;
    body1: string;
    body2: string; // "...{amount}..."
  };
  memberRejected: {
    subject: string;
    preview: string;
    title: string;
    body1: string;
    body2: string;
    button: string;
  };
  contributorRejected: {
    subject: string;
    preview: string;
    title: string;
    body1: string;
    body2: string;
    button: string;
  };
}

const fr: EmailDict = {
  common: {
    greeting: 'Bonjour {name},',
    reference: 'Verwendungszweck (référence à indiquer)',
    amount: 'Montant',
    reply: 'Une question ? Réponds simplement à cet email.',
    eventLabel: 'Détails de la soirée',
    free: 'Gratuit',
  },
  confirmation: {
    subject: 'Ta présence est enregistrée — Afro-Latina Party',
    preview: 'Merci ! Ta présence à l’Afro-Latina Party est bien enregistrée.',
    title: 'Ta présence est enregistrée 🎉',
    intro: 'Merci ! Nous avons bien reçu ta confirmation de présence pour l’Afro-Latina Party.',
    payNowIntro: 'Tu as choisi de régler ton entrée en ligne. Voici comment faire :',
    payButton: 'Payer {amount} via PayPal',
    payLater: 'Tu règleras ton entrée directement à l’entrée — pense à prévoir {amount}.',
    memberPending:
      'Ton statut de membre VAS est en cours de vérification par un administrateur. Tu recevras une confirmation par email.',
    contributorPending:
      'Ta participation en tant que membre engagé sera validée par un administrateur. Tu recevras ensuite ton billet.',
    ticketLater: 'Ton billet avec QR code te sera envoyé dès que ton paiement sera confirmé.',
    ticketLaterFree: 'Ton billet avec QR code te sera envoyé dès la validation.',
  },
  payment: {
    subject: 'Règle ton entrée — Afro-Latina Party',
    preview: 'Voici le lien pour régler ton entrée à l’Afro-Latina Party.',
    title: 'Paiement de ton entrée',
    approvedIntro:
      'Bonne nouvelle : ton statut de membre VAS a été confirmé ! Voici comment régler ton entrée :',
    genericIntro: 'Voici comment régler ton entrée à l’Afro-Latina Party :',
    payButton: 'Payer {amount} via PayPal',
    afterPay: 'Dès réception de ton paiement, tu recevras ton billet avec QR code.',
  },
  ticket: {
    subject: '🎟️ Ton billet — Afro-Latina Party',
    preview: 'Ton billet pour l’Afro-Latina Party est prêt.',
    title: 'Ton billet est prêt 🎟️',
    intro:
      'Ton paiement a bien été confirmé. Voici ton billet — présente simplement ce QR code à l’entrée.',
    introFree:
      'Ta participation a été validée. Voici ton billet — présente simplement ce QR code à l’entrée.',
    idLabel: 'Numéro de billet',
    categoryLabel: 'Tarif',
    nameLabel: 'Nom',
    warning: 'Ce QR code est ton billet personnel. Ne le partage pas.',
  },
  memberApproved: {
    subject: 'Ton statut de membre est confirmé — Afro-Latina Party',
    preview: 'Ton statut de membre VAS a été confirmé.',
    title: 'Statut de membre confirmé ✅',
    body1: 'Bonne nouvelle : ton statut de membre VAS a été confirmé.',
    body2: 'Tu règleras ton entrée ({amount}) directement à l’entrée. À très vite !',
  },
  memberRejected: {
    subject: 'À propos de ton statut de membre — Afro-Latina Party',
    preview: 'Une information concernant ton inscription.',
    title: 'Vérification de ton statut',
    body1: 'Après vérification, nous n’avons pas pu confirmer ton statut de membre VAS.',
    body2:
      'Tu es bien sûr le·la bienvenu·e ! Merci de te réinscrire en choisissant le tarif Étudiant ou Non-étudiant.',
    button: 'Se réinscrire',
  },
  contributorRejected: {
    subject: 'À propos de ta participation — Afro-Latina Party',
    preview: 'Une information concernant ta demande.',
    title: 'À propos de ta demande',
    body1: 'Après examen, nous ne pouvons pas valider ta participation en tant que membre engagé.',
    body2: 'Tu peux toujours venir en choisissant le tarif Étudiant ou Non-étudiant.',
    button: 'Se réinscrire',
  },
};

const en: EmailDict = {
  common: {
    greeting: 'Hi {name},',
    reference: 'Reference to include (Verwendungszweck)',
    amount: 'Amount',
    reply: 'Any questions? Just reply to this email.',
    eventLabel: 'Event details',
    free: 'Free',
  },
  confirmation: {
    subject: 'Your attendance is confirmed — Afro-Latina Party',
    preview: 'Thanks! Your attendance at the Afro-Latina Party is recorded.',
    title: 'Your attendance is confirmed 🎉',
    intro: 'Thank you! We’ve received your attendance confirmation for the Afro-Latina Party.',
    payNowIntro: 'You chose to pay your entry online. Here’s how:',
    payButton: 'Pay {amount} via PayPal',
    payLater: 'You’ll pay your entry at the door — please bring {amount}.',
    memberPending:
      'Your VAS membership status is being verified by an administrator. You’ll receive a confirmation by email.',
    contributorPending:
      'Your participation as an engaged member will be approved by an administrator. You’ll then receive your ticket.',
    ticketLater: 'Your ticket with a QR code will be sent as soon as your payment is confirmed.',
    ticketLaterFree: 'Your ticket with a QR code will be sent once approved.',
  },
  payment: {
    subject: 'Pay your entry — Afro-Latina Party',
    preview: 'Here’s the link to pay your entry to the Afro-Latina Party.',
    title: 'Pay your entry',
    approvedIntro:
      'Good news: your VAS membership has been confirmed! Here’s how to pay your entry:',
    genericIntro: 'Here’s how to pay your entry to the Afro-Latina Party:',
    payButton: 'Pay {amount} via PayPal',
    afterPay: 'As soon as we receive your payment, you’ll get your ticket with a QR code.',
  },
  ticket: {
    subject: '🎟️ Your ticket — Afro-Latina Party',
    preview: 'Your ticket for the Afro-Latina Party is ready.',
    title: 'Your ticket is ready 🎟️',
    intro: 'Your payment has been confirmed. Here’s your ticket — just show this QR code at the door.',
    introFree: 'Your participation has been approved. Here’s your ticket — just show this QR code at the door.',
    idLabel: 'Ticket number',
    categoryLabel: 'Entry',
    nameLabel: 'Name',
    warning: 'This QR code is your personal ticket. Don’t share it.',
  },
  memberApproved: {
    subject: 'Your membership is confirmed — Afro-Latina Party',
    preview: 'Your VAS membership has been confirmed.',
    title: 'Membership confirmed ✅',
    body1: 'Good news: your VAS membership has been confirmed.',
    body2: 'You’ll pay your entry ({amount}) directly at the door. See you soon!',
  },
  memberRejected: {
    subject: 'About your membership status — Afro-Latina Party',
    preview: 'An update about your registration.',
    title: 'About your status',
    body1: 'After checking, we couldn’t confirm your VAS membership status.',
    body2:
      'You’re very welcome to join! Please register again choosing the Student or Non-student entry.',
    button: 'Register again',
  },
  contributorRejected: {
    subject: 'About your participation — Afro-Latina Party',
    preview: 'An update about your request.',
    title: 'About your request',
    body1: 'After review, we can’t approve your participation as an engaged member.',
    body2: 'You’re still welcome to come by choosing the Student or Non-student entry.',
    button: 'Register again',
  },
};

const de: EmailDict = {
  common: {
    greeting: 'Hallo {name},',
    reference: 'Verwendungszweck (bitte angeben)',
    amount: 'Betrag',
    reply: 'Fragen? Antworte einfach auf diese E-Mail.',
    eventLabel: 'Event-Details',
    free: 'Kostenlos',
  },
  confirmation: {
    subject: 'Deine Teilnahme ist bestätigt — Afro-Latina Party',
    preview: 'Danke! Deine Teilnahme an der Afro-Latina Party ist erfasst.',
    title: 'Deine Teilnahme ist bestätigt 🎉',
    intro: 'Danke! Wir haben deine Teilnahmebestätigung für die Afro-Latina Party erhalten.',
    payNowIntro: 'Du hast dich entschieden, deinen Eintritt online zu zahlen. So geht’s:',
    payButton: '{amount} via PayPal zahlen',
    payLater: 'Du zahlst deinen Eintritt am Eingang — bitte bring {amount} mit.',
    memberPending:
      'Dein VAS-Mitgliedsstatus wird von einem Administrator geprüft. Du erhältst eine Bestätigung per E-Mail.',
    contributorPending:
      'Deine Teilnahme als engagiertes Mitglied wird von einem Administrator freigegeben. Danach erhältst du dein Ticket.',
    ticketLater: 'Dein Ticket mit QR-Code wird verschickt, sobald deine Zahlung bestätigt ist.',
    ticketLaterFree: 'Dein Ticket mit QR-Code wird nach der Freigabe verschickt.',
  },
  payment: {
    subject: 'Zahle deinen Eintritt — Afro-Latina Party',
    preview: 'Hier ist der Link, um deinen Eintritt zur Afro-Latina Party zu zahlen.',
    title: 'Zahle deinen Eintritt',
    approvedIntro:
      'Gute Nachrichten: Dein VAS-Mitgliedsstatus wurde bestätigt! So zahlst du deinen Eintritt:',
    genericIntro: 'So zahlst du deinen Eintritt zur Afro-Latina Party:',
    payButton: '{amount} via PayPal zahlen',
    afterPay: 'Sobald deine Zahlung eingegangen ist, erhältst du dein Ticket mit QR-Code.',
  },
  ticket: {
    subject: '🎟️ Dein Ticket — Afro-Latina Party',
    preview: 'Dein Ticket für die Afro-Latina Party ist bereit.',
    title: 'Dein Ticket ist bereit 🎟️',
    intro:
      'Deine Zahlung wurde bestätigt. Hier ist dein Ticket — zeige diesen QR-Code einfach am Eingang.',
    introFree:
      'Deine Teilnahme wurde freigegeben. Hier ist dein Ticket — zeige diesen QR-Code einfach am Eingang.',
    idLabel: 'Ticketnummer',
    categoryLabel: 'Eintritt',
    nameLabel: 'Name',
    warning: 'Dieser QR-Code ist dein persönliches Ticket. Teile ihn nicht.',
  },
  memberApproved: {
    subject: 'Dein Mitgliedsstatus ist bestätigt — Afro-Latina Party',
    preview: 'Dein VAS-Mitgliedsstatus wurde bestätigt.',
    title: 'Mitgliedschaft bestätigt ✅',
    body1: 'Gute Nachrichten: Dein VAS-Mitgliedsstatus wurde bestätigt.',
    body2: 'Du zahlst deinen Eintritt ({amount}) direkt am Eingang. Bis bald!',
  },
  memberRejected: {
    subject: 'Zu deinem Mitgliedsstatus — Afro-Latina Party',
    preview: 'Eine Info zu deiner Anmeldung.',
    title: 'Zu deinem Status',
    body1: 'Nach der Prüfung konnten wir deinen VAS-Mitgliedsstatus nicht bestätigen.',
    body2:
      'Du bist natürlich herzlich willkommen! Bitte melde dich erneut an und wähle den Studi- oder Nicht-Studi-Eintritt.',
    button: 'Erneut anmelden',
  },
  contributorRejected: {
    subject: 'Zu deiner Teilnahme — Afro-Latina Party',
    preview: 'Eine Info zu deiner Anfrage.',
    title: 'Zu deiner Anfrage',
    body1: 'Nach Prüfung können wir deine Teilnahme als engagiertes Mitglied nicht freigeben.',
    body2: 'Du kannst trotzdem kommen — wähle einfach den Studi- oder Nicht-Studi-Eintritt.',
    button: 'Erneut anmelden',
  },
};

const DICTS: Record<Locale, EmailDict> = { fr, en, de };

export function getEmailDict(locale: Locale): EmailDict {
  return DICTS[locale] ?? fr;
}

/** Replace {key} placeholders in a string. */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
