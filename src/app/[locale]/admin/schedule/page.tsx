import { getScheduleData } from '@/lib/actions/schedule';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { WeeklyHoursForm } from './_components/WeeklyHoursForm';
import { BlockDateForm } from './_components/BlockDateForm';

export default async function SchedulePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const { rules, exceptions } = await getScheduleData();

  // Serialize exception dates for client boundary (Date → ISO string)
  const serializedExceptions = exceptions.map((e) => ({
    ...e,
    exceptionDate: e.exceptionDate.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1
        className="text-[20px] font-semibold leading-[1.2] text-[var(--color-on-surface)] mb-8"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
      >
        {t('schedule')}
      </h1>
      <WeeklyHoursForm initialRules={rules} />
      <div className="mt-8">
        <BlockDateForm exceptions={serializedExceptions} />
      </div>
    </div>
  );
}
