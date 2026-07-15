import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { Inter, Sora } from 'next/font/google';
import { config } from '@/config/config';
import { AnimatedBackground } from '@/components/background/AnimatedBackground';
import '@/styles/globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    metadataBase: new URL(appUrl),
    title: {
      default: t('title'),
      template: `%s · ${config.eventName}`,
    },
    description: t('description'),
    applicationName: config.eventName,
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      siteName: config.eventName,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#081026',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${sora.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="relative min-h-dvh">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AnimatedBackground />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
