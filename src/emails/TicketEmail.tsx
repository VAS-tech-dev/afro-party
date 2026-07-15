import { Heading, Img, Section, Text } from '@react-email/components';
import type { Locale } from '@/config/config';
import { emailStyles, emailTheme } from './theme';
import { getEmailDict } from './i18n';
import { EmailLayout } from './components/EmailLayout';
import { EventDetails, ReplyNote } from './components/parts';

export interface TicketEmailProps {
  locale: Locale;
  name: string;
  ticketId: string;
  /** Entry display, e.g. "7 €" or the localized free label. */
  entry: string;
  /** Free tickets (contributor) use a different intro. */
  isFree?: boolean;
}

/** Ticket email with the scannable QR (served as a hosted PNG). */
export function TicketEmail({ locale, name, ticketId, entry, isFree = false }: TicketEmailProps) {
  const t = getEmailDict(locale);

  const row = (label: string, value: string) => (
    <Text style={{ margin: '0 0 4px', fontSize: '14px', color: emailTheme.muted }}>
      {label}: <span style={{ color: emailTheme.text, fontWeight: 600 }}>{value}</span>
    </Text>
  );

  return (
    <EmailLayout preview={t.ticket.preview}>
      <Heading style={emailStyles.heading}>{t.ticket.title}</Heading>
      <Text style={emailStyles.paragraph}>{isFree ? t.ticket.introFree : t.ticket.intro}</Text>

      {/* QR */}
      <Section style={{ textAlign: 'center' as const, margin: '4px 0 20px' }}>
        <Img
          src="cid:qrcode"
          width="220"
          height="220"
          alt="Ticket QR code"
          style={{
            margin: '0 auto',
            borderRadius: '16px',
            border: `4px solid ${emailTheme.gold}`,
            backgroundColor: '#FFFFFF',
          }}
        />
      </Section>

      {/* Ticket details */}
      <Section style={emailStyles.infoBox}>
        {row(t.ticket.nameLabel, name)}
        {row(t.ticket.idLabel, ticketId)}
        {row(t.ticket.categoryLabel, entry)}
      </Section>

      <EventDetails locale={locale} label={t.common.eventLabel} />

      <Text style={{ ...emailStyles.paragraph, color: emailTheme.gold, fontSize: '13px' }}>
        {t.ticket.warning}
      </Text>
      <ReplyNote text={t.common.reply} />
    </EmailLayout>
  );
}

export default TicketEmail;
