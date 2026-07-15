import { Heading, Text } from '@react-email/components';
import type { Locale } from '@/config/config';
import type { Category } from '@/types/registration';
import { emailStyles } from './theme';
import { getEmailDict, interpolate } from './i18n';
import { EmailButton, EmailLayout } from './components/EmailLayout';
import { EventDetails, PayInfo, ReplyNote } from './components/parts';

export interface ConfirmationEmailProps {
  locale: Locale;
  name: string;
  category: Category;
  payNow: boolean;
  /** Formatted price, e.g. "7 €" (empty for free). */
  amount: string;
  paypalLink: string;
  /** Verwendungszweck value (full name). */
  reference: string;
}

/**
 * Immediate confirmation email sent to everyone at registration time.
 * The body adapts to the case:
 *  - Student/Non-student paying now → PayPal block
 *  - Student/Non-student paying at door → "bring {amount}" note
 *  - Member → membership verification pending
 *  - Contributor → approval pending
 */
export function ConfirmationEmail({
  locale,
  name,
  category,
  payNow,
  amount,
  paypalLink,
  reference,
}: ConfirmationEmailProps) {
  const t = getEmailDict(locale);
  const isMember = category === 'VAS_MEMBER';
  const isContributor = category === 'CONTRIBUTOR';
  const isStandard = category === 'STUDENT' || category === 'NON_STUDENT';

  return (
    <EmailLayout preview={t.confirmation.preview}>
      <Heading style={emailStyles.heading}>{t.confirmation.title}</Heading>
      <Text style={emailStyles.paragraph}>{interpolate(t.common.greeting, { name })}</Text>
      <Text style={emailStyles.paragraph}>{t.confirmation.intro}</Text>

      <EventDetails locale={locale} label={t.common.eventLabel} />

      {/* Standard tiers */}
      {isStandard && payNow ? (
        <>
          <Text style={emailStyles.paragraph}>{t.confirmation.payNowIntro}</Text>
          <PayInfo
            amountLabel={t.common.amount}
            amount={amount}
            referenceLabel={t.common.reference}
            reference={reference}
          />
          <EmailButton href={paypalLink}>
            {interpolate(t.confirmation.payButton, { amount })}
          </EmailButton>
          <Text style={emailStyles.paragraph}>{t.confirmation.ticketLater}</Text>
        </>
      ) : null}

      {isStandard && !payNow ? (
        <Text style={emailStyles.paragraph}>
          {interpolate(t.confirmation.payLater, { amount })}
        </Text>
      ) : null}

      {/* Member — verification pending */}
      {isMember ? <Text style={emailStyles.paragraph}>{t.confirmation.memberPending}</Text> : null}

      {/* Contributor — approval pending */}
      {isContributor ? (
        <>
          <Text style={emailStyles.paragraph}>{t.confirmation.contributorPending}</Text>
          <Text style={emailStyles.paragraph}>{t.confirmation.ticketLaterFree}</Text>
        </>
      ) : null}

      <ReplyNote text={t.common.reply} />
    </EmailLayout>
  );
}

export default ConfirmationEmail;
