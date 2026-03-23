import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { SignInButtons } from '@/components/auth/SignInButtons';
import { addDays, startOfDay } from 'date-fns';
import { getAvailabilityData } from '@/lib/actions/booking';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { BookingWizard } from './_components/BookingWizard';
import { getTranslations } from 'next-intl/server';

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1
          className="text-2xl font-semibold text-[#1F1B18] mb-2 text-center"
          style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
        >
          {t('bookTitle')}
        </h1>
        <div data-testid="book-signin-step">
          <p
            className="text-[#6B5E54] mb-6 text-center"
            style={{ fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif' }}
          >
            {t('signInPrompt')}
          </p>
          <SignInButtons />
        </div>
      </div>
    );
  }

  // Fetch 60-day availability window (D-03)
  const today = startOfDay(new Date());
  const windowEnd = addDays(today, 60);
  const { rules, exceptions, booked } = await getAvailabilityData(today, windowEnd);
  const activeServices = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.sortOrder);

  // Serialize Date objects to ISO strings for RSC/client boundary
  const blockedDatesISO = exceptions.map((e) => e.exceptionDate.toISOString());
  const bookedTimestampsISO = booked.map((b) => b.scheduledAt.toISOString());

  return (
    <div data-testid="book-authenticated">
      <BookingWizard
        scheduleRules={rules}
        blockedDatesISO={blockedDatesISO}
        bookedTimestampsISO={bookedTimestampsISO}
        services={activeServices}
        locale={locale}
      />
    </div>
  );
}
