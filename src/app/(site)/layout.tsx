import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/** Public site layout — adds the header, footer and skip link. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-navy-950"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer />
    </>
  );
}
