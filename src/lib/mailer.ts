import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '@/config/config';
import { VAS_LOGO_BASE64 } from '@/emails/logo-data';

/** VAS logo, attached inline to every email (referenced as cid:vaslogo). */
const LOGO_ATTACHMENT = {
  filename: 'vas-logo.jpeg',
  content: Buffer.from(VAS_LOGO_BASE64, 'base64'),
  cid: 'vaslogo',
};

/**
 * Email sending via the association's Gmail account (SMTP + App Password).
 *
 * Set GMAIL_USER (the address) and GMAIL_APP_PASSWORD (a 16-char Google "app
 * password", which requires 2-step verification enabled). Emails are sent
 * *from* that Gmail address.
 *
 * Sending is best-effort and degrades gracefully: if the credentials aren't
 * set (e.g. local dev), `sendEmail` logs and returns `{ skipped: true }`
 * instead of throwing, so registration never fails because email is down.
 *
 * Note: Gmail free accounts cap at ~500 emails/day.
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return transporter;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Optional attachments; pass `cid` to embed inline (e.g. the QR ticket). */
  attachments?: { filename: string; content: Buffer; cid?: string }[];
}

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped: true }
  | { ok: false; error: string };

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const tx = getTransporter();
  if (!tx) {
    console.warn(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — skipped "${params.subject}" to ${params.to}`);
    return { ok: false, skipped: true };
  }

  // Display name + the authenticated Gmail address (Gmail enforces the sender).
  const from = process.env.EMAIL_FROM || `${config.eventName} <${process.env.GMAIL_USER}>`;

  try {
    const info = await tx.sendMail({
      from,
      replyTo: config.contact.email,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      // Always embed the logo; append any caller attachments (e.g. QR).
      attachments: [LOGO_ATTACHMENT, ...(params.attachments ?? [])],
    });
    return { ok: true, id: info.messageId ?? null };
  } catch (err) {
    console.error('[email] send error:', err);
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}
