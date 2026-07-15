import type { ReactElement } from 'react';
import { render } from '@react-email/render';
import { config, getCategory, type Locale } from '@/config/config';
import type { Category } from '@/types/registration';
import { formatPrice } from '@/lib/utils';
import { qrPngBuffer } from '@/lib/qrcode';
import { sendEmail, type SendEmailResult } from '@/lib/mailer';
import { getEmailDict } from '@/emails/i18n';
import { ConfirmationEmail } from '@/emails/ConfirmationEmail';
import { PaymentEmail } from '@/emails/PaymentEmail';
import { TicketEmail } from '@/emails/TicketEmail';
import { NoticeEmail } from '@/emails/NoticeEmail';

/**
 * High-level email orchestration. Each function renders the right React Email
 * template (HTML + plain-text) and hands it to the Resend wrapper. All are
 * best-effort: a failure here never throws to the caller (registration/admin
 * actions must not fail because email is down).
 */

interface Recipient {
  email: string;
  firstName: string;
  lastName: string;
  language: Locale;
}

const fullName = (r: Recipient) => `${r.firstName} ${r.lastName}`.trim();

/** Localized entry display: a formatted price, or the free label. */
function entryDisplay(locale: Locale, category: Category): string {
  const price = getCategory(category).price;
  if (price === 0) return getEmailDict(locale).common.free;
  return formatPrice(price, locale, config.currency);
}

/** Render a React Email element to { html, text }. */
async function renderEmail(element: ReactElement): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}

/* ------------------------------------------------------------------ */
/* Registration-time confirmation (sent to everyone)                   */
/* ------------------------------------------------------------------ */
export async function sendConfirmationEmail(params: {
  recipient: Recipient;
  category: Category;
  payNow: boolean;
}): Promise<SendEmailResult> {
  const { recipient, category, payNow } = params;
  const locale = recipient.language;
  const dict = getEmailDict(locale);
  const price = getCategory(category).price;

  const { html, text } = await renderEmail(
    ConfirmationEmail({
      locale,
      name: recipient.firstName,
      category,
      payNow,
      amount: price === 0 ? dict.common.free : formatPrice(price, locale, config.currency),
      paypalLink: config.paypalLink,
      reference: fullName(recipient),
    }),
  );

  return sendEmail({ to: recipient.email, subject: dict.confirmation.subject, html, text });
}

/* ------------------------------------------------------------------ */
/* Payment request (member approved + pay now, or admin re-issue)      */
/* ------------------------------------------------------------------ */
export async function sendPaymentEmail(params: {
  recipient: Recipient;
  category: Category;
  afterMemberApproval?: boolean;
}): Promise<SendEmailResult> {
  const { recipient, category, afterMemberApproval } = params;
  const locale = recipient.language;
  const dict = getEmailDict(locale);

  const { html, text } = await renderEmail(
    PaymentEmail({
      locale,
      name: recipient.firstName,
      amount: formatPrice(getCategory(category).price, locale, config.currency),
      paypalLink: config.paypalLink,
      reference: fullName(recipient),
      afterMemberApproval,
    }),
  );

  return sendEmail({ to: recipient.email, subject: dict.payment.subject, html, text });
}

/* ------------------------------------------------------------------ */
/* Ticket (payment confirmed, or contributor approved)                 */
/* ------------------------------------------------------------------ */
export async function sendTicketEmail(params: {
  recipient: Recipient;
  category: Category;
  ticketId: string;
  ticketToken: string;
}): Promise<SendEmailResult> {
  const { recipient, category, ticketId, ticketToken } = params;
  const locale = recipient.language;
  const dict = getEmailDict(locale);

  const { html, text } = await renderEmail(
    TicketEmail({
      locale,
      name: fullName(recipient),
      ticketId,
      entry: entryDisplay(locale, category),
      isFree: getCategory(category).price === 0,
    }),
  );

  // Embed the QR inline (cid:qrcode) so it always renders in the email.
  const qr = await qrPngBuffer(ticketToken);

  return sendEmail({
    to: recipient.email,
    subject: dict.ticket.subject,
    html,
    text,
    attachments: [{ filename: 'ticket-qr.png', content: qr, cid: 'qrcode' }],
  });
}

/* ------------------------------------------------------------------ */
/* Notices (approve without payment / rejections)                      */
/* ------------------------------------------------------------------ */
export async function sendMemberApprovedEmail(params: {
  recipient: Recipient;
}): Promise<SendEmailResult> {
  const { recipient } = params;
  const locale = recipient.language;
  const dict = getEmailDict(locale);

  const { html, text } = await renderEmail(
    NoticeEmail({
      locale,
      name: recipient.firstName,
      kind: 'memberApproved',
      amount: formatPrice(getCategory('VAS_MEMBER').price, locale, config.currency),
    }),
  );

  return sendEmail({ to: recipient.email, subject: dict.memberApproved.subject, html, text });
}

export async function sendMemberRejectedEmail(params: {
  recipient: Recipient;
}): Promise<SendEmailResult> {
  const { recipient } = params;
  const dict = getEmailDict(recipient.language);
  const { html, text } = await renderEmail(
    NoticeEmail({ locale: recipient.language, name: recipient.firstName, kind: 'memberRejected' }),
  );
  return sendEmail({ to: recipient.email, subject: dict.memberRejected.subject, html, text });
}

export async function sendContributorRejectedEmail(params: {
  recipient: Recipient;
}): Promise<SendEmailResult> {
  const { recipient } = params;
  const dict = getEmailDict(recipient.language);
  const { html, text } = await renderEmail(
    NoticeEmail({
      locale: recipient.language,
      name: recipient.firstName,
      kind: 'contributorRejected',
    }),
  );
  return sendEmail({ to: recipient.email, subject: dict.contributorRejected.subject, html, text });
}
