import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { ServiceList } from '@/components/services/ServiceList';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('services');

  let serviceList: typeof services.$inferSelect[] = [];
  let hasError = false;

  try {
    serviceList = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder));
  } catch {
    hasError = true;
  }

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="px-4 md:px-8 py-12 max-w-4xl mx-auto">
        <h1
          className="mb-8 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-on-surface)]"
          style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
        >
          {t('title')}
        </h1>

        {hasError ? (
          <div className="flex min-h-[120px] w-full items-center justify-center rounded-xl bg-[var(--color-surface-container-lowest)] shadow-ambient">
            <p
              className="text-center text-[14px] font-normal leading-[1.5]"
              style={{
                fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                color: 'rgba(31, 27, 24, 0.60)',
              }}
            >
              {t('error')}
            </p>
          </div>
        ) : (
          <ServiceList
            services={serviceList}
            locale={locale}
            emptyMessage={t('empty')}
            durationTemplate={t('duration')}
          />
        )}
      </div>
    </section>
  );
}
