import { Heading, Text } from '@react-email/components';
import type { Locale } from '@/config/config';
import { emailStyles } from './theme';
import { getEmailDict, interpolate } from './i18n';
import { EmailButton, EmailLayout } from './components/EmailLayout';
import { ReplyNote } from './components/parts';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** Which status message to render. */
export type NoticeKind = 'memberApproved' | 'memberRejected' | 'contributorRejected';

export interface NoticeEmailProps {
  locale: Locale;
  name: string;
  kind: NoticeKind;
  /** Only used for memberApproved (paid-at-door amount). */
  amount?: string;
}

/**
 * Generic titled status email used for admin decisions that don't carry a
 * ticket or a payment link: membership approved (pay at door), membership
 * rejected, contributor rejected.
 */
export function NoticeEmail({ locale, name, kind, amount = '' }: NoticeEmailProps) {
  const t = getEmailDict(locale);
  const block = t[kind];
  const showRegisterButton = kind === 'memberRejected' || kind === 'contributorRejected';

  return (
    <EmailLayout preview={block.preview}>
      <Heading style={emailStyles.heading}>{block.title}</Heading>
      <Text style={emailStyles.paragraph}>{interpolate(t.common.greeting, { name })}</Text>
      <Text style={emailStyles.paragraph}>{block.body1}</Text>
      <Text style={emailStyles.paragraph}>{interpolate(block.body2, { amount })}</Text>

      {showRegisterButton ? (
        <EmailButton href={`${APP_URL}/register`}>
          {'button' in block ? block.button : ''}
        </EmailButton>
      ) : null}

      <ReplyNote text={t.common.reply} />
    </EmailLayout>
  );
}

export default NoticeEmail;
