import { Heading, Text } from '@react-email/components';
import type { Locale } from '@/config/config';
import { emailStyles } from './theme';
import { getEmailDict, interpolate } from './i18n';
import { EmailButton, EmailLayout } from './components/EmailLayout';
import { EventDetails, PayInfo, ReplyNote } from './components/parts';

export interface PaymentEmailProps {
  locale: Locale;
  name: string;
  amount: string;
  paypalLink: string;
  reference: string;
  /** True after a membership approval (uses the "good news" intro). */
  afterMemberApproval?: boolean;
}

/**
 * Payment request email — sent when a VAS member is approved and chose to pay
 * now, or any time an admin (re)issues a payment link.
 */
export function PaymentEmail({
  locale,
  name,
  amount,
  paypalLink,
  reference,
  afterMemberApproval = false,
}: PaymentEmailProps) {
  const t = getEmailDict(locale);

  return (
    <EmailLayout preview={t.payment.preview}>
      <Heading style={emailStyles.heading}>{t.payment.title}</Heading>
      <Text style={emailStyles.paragraph}>{interpolate(t.common.greeting, { name })}</Text>
      <Text style={emailStyles.paragraph}>
        {afterMemberApproval ? t.payment.approvedIntro : t.payment.genericIntro}
      </Text>

      <PayInfo
        amountLabel={t.common.amount}
        amount={amount}
        referenceLabel={t.common.reference}
        reference={reference}
      />
      <EmailButton href={paypalLink}>{interpolate(t.payment.payButton, { amount })}</EmailButton>

      <Text style={emailStyles.paragraph}>{t.payment.afterPay}</Text>
      <EventDetails locale={locale} label={t.common.eventLabel} />
      <ReplyNote text={t.common.reply} />
    </EmailLayout>
  );
}

export default PaymentEmail;
