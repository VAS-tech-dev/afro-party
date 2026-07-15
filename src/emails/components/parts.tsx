import { Section, Text } from '@react-email/components';
import { config, getFullAddress, type Locale } from '@/config/config';
import { emailStyles, emailTheme } from '../theme';

/** Localized event date/time. */
function formatEventDateTime(locale: Locale) {
  const date = new Date(config.startsAt);
  const day = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: config.timezone,
  }).format(date);
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: config.timezone,
  }).format(date);
  return { day, time };
}

/** Event details info box (date, time, venue). */
export function EventDetails({ locale, label }: { locale: Locale; label: string }) {
  const { day, time } = formatEventDateTime(locale);
  return (
    <Section style={emailStyles.infoBox}>
      <Text
        style={{
          color: emailTheme.gold,
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase' as const,
          margin: '0 0 8px',
          fontWeight: 700,
        }}
      >
        {label}
      </Text>
      <Text style={{ color: emailTheme.text, fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
        📅 {day}
        <br />
        🕙 {time}
        <br />
        📍 {getFullAddress()}
      </Text>
    </Section>
  );
}

/** Amount + payment reference (Verwendungszweck) rows. */
export function PayInfo({
  amountLabel,
  amount,
  referenceLabel,
  reference,
}: {
  amountLabel: string;
  amount: string;
  referenceLabel: string;
  reference: string;
}) {
  return (
    <Section style={emailStyles.infoBox}>
      <Text style={{ margin: '0 0 6px', fontSize: '14px', color: emailTheme.muted }}>
        {amountLabel}:{' '}
        <span style={{ color: emailTheme.gold, fontWeight: 700, fontSize: '18px' }}>{amount}</span>
      </Text>
      <Text style={{ margin: 0, fontSize: '14px', color: emailTheme.muted }}>
        {referenceLabel}:{' '}
        <span style={{ color: emailTheme.text, fontWeight: 600 }}>{reference}</span>
      </Text>
    </Section>
  );
}

/** Small muted "reply to this email" line at the end of the body. */
export function ReplyNote({ text }: { text: string }) {
  return (
    <Text style={{ ...emailStyles.paragraph, fontSize: '13px', color: emailTheme.faint }}>
      {text}
    </Text>
  );
}
