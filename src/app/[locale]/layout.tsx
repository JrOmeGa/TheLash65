import type { Metadata } from 'next';
import { Noto_Serif, Manrope, Sarabun } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StickyMandateBar } from '@/components/layout/StickyMandateBar';
import '../globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-noto-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['400', '600'],
  variable: '--font-sarabun',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Lash Booking',
  description: 'Book your lash extension appointment online',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${notoSerif.variable} ${manrope.variable} ${sarabun.variable}`}
    >
      <body style={{ fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif' }}>
        <NextIntlClientProvider>
          <Header />
          <main className="min-h-screen pt-14 pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <StickyMandateBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
