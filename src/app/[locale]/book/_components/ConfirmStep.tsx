'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { formatDateGregorian } from '@/lib/date-utils';
import { createBooking } from '@/lib/actions/booking';
import { Button } from '@/components/ui/button';

type ConfirmStepProps = {
  services: Array<{
    id: number;
    nameTh: string;
    nameEn: string;
    descriptionTh: string | null;
    descriptionEn: string | null;
    durationMinutes: number;
    priceTHB: number;
  }>;
  locale: string;
};

export function ConfirmStep({ services, locale }: ConfirmStepProps) {
  const t = useTranslations('booking');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTime = useBookingStore((s) => s.selectedTime);
  const selectedServiceId = useBookingStore((s) => s.selectedServiceId);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const serviceName = selectedService
    ? locale === 'th'
      ? selectedService.nameTh
      : selectedService.nameEn
    : '';

  async function handleConfirm() {
    if (!selectedDate || !selectedTime || !selectedServiceId || !selectedService) return;

    setIsLoading(true);
    setErrorKey(null);

    try {
      // Combine selectedDate + selectedTime into UTC ISO string (Pitfall 3)
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);
      const scheduledAt = scheduledDate.toISOString();

      const result = await createBooking({ serviceId: selectedServiceId, scheduledAt });

      if ('bookingId' in result) {
        // Redirect to locale-prefixed confirmation page (D-13)
        router.push(`/${locale}/book/confirmation/${result.bookingId}`);
      } else {
        if (result.error === 'slot_unavailable') {
          setErrorKey('errorConflict');
        } else {
          setErrorKey('errorSubmission');
        }
        setIsLoading(false);
      }
    } catch {
      setErrorKey('errorSubmission');
      setIsLoading(false);
    }
  }

  if (!selectedDate || !selectedTime || !selectedService) {
    return null;
  }

  const formattedDate = formatDateGregorian(selectedDate, locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: undefined,
  });

  return (
    <div>
      <h2
        className="text-[20px] font-semibold leading-[1.2] mb-4"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif', color: '#1F1B18' }}
      >
        {t('stepConfirm')}
      </h2>

      {/* Booking summary card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* Service row */}
        <div
          className="flex items-center justify-between py-3"
          style={{ borderBottom: '1px solid rgba(31,27,24,0.06)' }}
        >
          <span
            className="text-[16px]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: '#1F1B18',
            }}
          >
            {t('service')}
          </span>
          <span
            className="text-[14px]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: 'rgba(31,27,24,0.75)',
            }}
          >
            {serviceName}
          </span>
        </div>

        {/* Date row */}
        <div
          className="flex items-center justify-between py-3"
          style={{ borderBottom: '1px solid rgba(31,27,24,0.06)' }}
        >
          <span
            className="text-[16px]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: '#1F1B18',
            }}
          >
            {t('date')}
          </span>
          <span
            className="text-[14px]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: 'rgba(31,27,24,0.75)',
            }}
          >
            {formattedDate}
          </span>
        </div>

        {/* Time row */}
        <div
          className="flex items-center justify-between py-3"
          style={{ borderBottom: '1px solid rgba(31,27,24,0.06)' }}
        >
          <span
            className="text-[16px]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: '#1F1B18',
            }}
          >
            {t('time')}
          </span>
          <span
            className="text-[14px]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: 'rgba(31,27,24,0.75)',
            }}
          >
            {selectedTime}
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between py-3">
          <span
            className="text-[16px]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: '#1F1B18',
            }}
          >
            {t('price')}
          </span>
          <span
            className="text-[14px] font-semibold"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: '#755944',
            }}
          >
            ฿{selectedService.priceTHB}
          </span>
        </div>
      </div>

      {/* Error message */}
      {errorKey && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg text-[14px]"
          style={{
            background: 'rgba(185, 28, 28, 0.06)',
            color: '#b91c1c',
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
          }}
        >
          {t(errorKey as 'errorConflict' | 'errorSubmission')}
        </div>
      )}

      {/* Confirm button */}
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full h-11"
        style={{
          background: isLoading
            ? undefined
            : 'linear-gradient(135deg, #755944 0%, #9c7660 100%)',
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? 'none' : undefined,
        }}
      >
        {t('confirmBooking')}
      </Button>
    </div>
  );
}
