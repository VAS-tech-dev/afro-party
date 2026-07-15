import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * next-intl is wired in "without i18n routing" mode: the active locale is
 * resolved from a cookie (see src/i18n/request.ts), so URLs stay clean
 * (/register instead of /fr/register).
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the tracing root to this project (a stray lockfile exists higher up in
  // the filesystem, which would otherwise make Next infer the wrong root).
  outputFileTracingRoot: __dirname,
  // Keep these Node libraries out of the webpack bundle — they should be
  // require()'d at runtime (bundling `qrcode` stalls compilation; `nodemailer`
  // needs Node's net/tls at runtime).
  serverExternalPackages: ['qrcode', 'nodemailer'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion'],
  },
};

export default withNextIntl(nextConfig);
