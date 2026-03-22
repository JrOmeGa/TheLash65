import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

function HomeContent() {
  const t = useTranslations('nav');
  return (
    <main className="min-h-screen bg-[var(--color-surface)] p-8">
      <h1
        className="text-[30px] font-semibold"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
      >
        Lash Booking
      </h1>
      <p className="mt-4 text-sm">{t('book')}</p>
    </main>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}
