import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getBookingById } from '@/lib/actions/booking';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { formatDateGregorian } from '@/lib/date-utils';

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('booking');
  const session = await auth.api.getSession({ headers: await headers() });

  // Auth gate — redirect unauthenticated users to /book (D-15)
  if (!session) redirect(`/${locale}/book`);

  const data = await getBookingById(id);

  // Not found or not owned by this user — redirect (D-15: only accessible when logged in)
  if (!data) redirect(`/${locale}/book`);

  const { booking, service } = data;
  const serviceName = locale === 'th' ? service?.nameTh : service?.nameEn;
  const formattedDate = formatDateGregorian(booking.scheduledAt, locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = formatDateGregorian(booking.scheduledAt, locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Page heading */}
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '28px',
          fontWeight: 600,
          lineHeight: 1.2,
          color: '#755944',
          marginBottom: '24px',
        }}
      >
        {t('confirmationHeading')}
      </h1>

      {/* Booking summary card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(31,27,24,0.10)',
          padding: '24px',
        }}
      >
        {/* Service row */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(31,27,24,0.06)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: '#1F1B18',
            }}
          >
            {t('service')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#1F1B18',
            }}
          >
            {serviceName ?? '—'}
          </span>
        </div>

        {/* Date row */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(31,27,24,0.06)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: '#1F1B18',
            }}
          >
            {t('date')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#1F1B18',
            }}
          >
            {formattedDate}
          </span>
        </div>

        {/* Time row */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(31,27,24,0.06)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: '#1F1B18',
            }}
          >
            {t('time')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#1F1B18',
            }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Price row */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: '12px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: '#1F1B18',
            }}
          >
            {t('price')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#755944',
            }}
          >
            {service ? `฿${service.priceTHB}` : '—'}
          </span>
        </div>
      </div>

      {/* Next steps copy block */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          lineHeight: 1.5,
          color: 'rgba(31,27,24,0.75)',
          marginTop: '24px',
        }}
      >
        {t('confirmationNextSteps')}
      </p>

      {/* QR placeholder — will be replaced with real PromptPay QR in Phase 4 */}
      <div
        style={{
          backgroundColor: '#f5ede6',
          borderRadius: '8px',
          padding: '32px',
          marginTop: '24px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1F1B18',
          }}
        >
          {t('qrPlaceholder')}
        </span>
      </div>
    </div>
  );
}
