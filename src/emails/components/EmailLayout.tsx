import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';
import { config, getFullAddress } from '@/config/config';
import { emailStyles, emailTheme } from '../theme';

interface EmailLayoutProps {
  /** Inbox preview text (hidden preheader). */
  preview: string;
  children: ReactNode;
}

/**
 * Shared premium dark layout for every transactional email: VAS logo header,
 * a rounded navy card for the content, and a footer with contact + address.
 * All styling is inline for mail-client compatibility.
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          {/* Header */}
          <Section
            style={{
              padding: '28px 32px 8px',
              textAlign: 'center' as const,
              background: `linear-gradient(180deg, ${emailTheme.navy800}, ${emailTheme.navy900})`,
            }}
          >
            {/* Inline logo (attached as CID "vaslogo" by the mailer) so it
                renders in every client without a public URL. */}
            <Img
              src="cid:vaslogo"
              width="56"
              height="56"
              alt="VAS"
              style={{ borderRadius: '12px', margin: '0 auto' }}
            />
            <Text
              style={{
                color: emailTheme.gold,
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase' as const,
                margin: '12px 0 0',
                fontWeight: 700,
              }}
            >
              Afro-Latina Party
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: '24px 32px 8px' }}>{children}</Section>

          {/* Footer */}
          <Hr style={{ borderColor: emailTheme.border, margin: '8px 0 0' }} />
          <Section style={{ padding: '20px 32px 28px', textAlign: 'center' as const }}>
            <Text style={{ color: emailTheme.faint, fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
              {config.organizerLong}
              <br />
              {getFullAddress()}
            </Text>
            <Text style={{ margin: '10px 0 0', fontSize: '12px' }}>
              <Link href={`mailto:${config.contact.email}`} style={{ color: emailTheme.gold }}>
                {config.contact.email}
              </Link>
              {config.contact.instagram && config.contact.instagramUrl ? (
                <>
                  {'  ·  '}
                  <Link href={config.contact.instagramUrl} style={{ color: emailTheme.gold }}>
                    {config.contact.instagram}
                  </Link>
                </>
              ) : null}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Primary email CTA button. */
export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ textAlign: 'center' as const, margin: '4px 0 20px' }}>
      <Link href={href} style={emailStyles.button}>
        {children}
      </Link>
    </Section>
  );
}
