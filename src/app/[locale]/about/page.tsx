import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { AboutContent } from '@/components/about/AboutContent';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');

  const translations = {
    title: t('title'),
    contact: t('contact'),
    hours: t('hours'),
    bookCta: t('bookCta'),
  };

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="px-4 md:px-8 py-12">
        <AboutContent locale={locale} translations={translations} />
      </div>
    </section>
  );
}
