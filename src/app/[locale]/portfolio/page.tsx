import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('portfolio');

  const images = [
    { src: '/images/portfolio/placeholder-1.jpg', alt: t('imageAlt') },
    { src: '/images/portfolio/placeholder-2.jpg', alt: t('imageAlt') },
    { src: '/images/portfolio/placeholder-3.jpg', alt: t('imageAlt') },
    { src: '/images/portfolio/placeholder-4.jpg', alt: t('imageAlt') },
    { src: '/images/portfolio/placeholder-5.jpg', alt: t('imageAlt') },
    { src: '/images/portfolio/placeholder-6.jpg', alt: t('imageAlt') },
  ];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="px-4 md:px-8 py-12 max-w-6xl mx-auto">
        <h1
          className="mb-8 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-on-surface)]"
          style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
        >
          {t('title')}
        </h1>

        <GalleryGrid
          images={images}
          closeLabel={t('closeLightbox')}
          emptyLabel={t('empty')}
        />
      </div>
    </section>
  );
}
