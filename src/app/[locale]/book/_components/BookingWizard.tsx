'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { generateSlotsForDate } from '@/lib/date-utils';
import { StepIndicator } from './StepIndicator';
import { DateStrip } from './DateStrip';
import { TimeSlotGrid } from './TimeSlotGrid';
import { ServiceSelector } from './ServiceSelector';
import { ConfirmStep } from './ConfirmStep';

export type BookingWizardProps = {
  scheduleRules: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    slotDurationMinutes: number;
    isActive: boolean;
  }>;
  blockedDatesISO: string[];
  bookedTimestampsISO: string[];
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

export function BookingWizard({
  scheduleRules,
  blockedDatesISO,
  bookedTimestampsISO,
  services,
  locale,
}: BookingWizardProps) {
  const t = useTranslations('booking');
  const step = useBookingStore((s) => s.step);
  const setStep = useBookingStore((s) => s.setStep);
  const selectedDate = useBookingStore((s) => s.selectedDate);

  // CRITICAL: Reconstitute ISO strings to Date[] — required for isSameDay comparisons in generateSlotsForDate
  const blockedDates = useMemo(
    () => blockedDatesISO.map((iso) => new Date(iso)),
    [blockedDatesISO],
  );
  const bookedTimestamps = useMemo(
    () => bookedTimestampsISO.map((iso) => new Date(iso)),
    [bookedTimestampsISO],
  );

  // Reset stale wizard state on mount (Pitfall 5)
  useEffect(() => {
    useBookingStore.getState().reset();
  }, []);

  // Compute slots for the selected date (step 2)
  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const rule = scheduleRules.find((r) => r.dayOfWeek === dayOfWeek && r.isActive);
    return generateSlotsForDate({
      rule: rule
        ? {
            openTime: rule.openTime,
            closeTime: rule.closeTime,
            slotDurationMinutes: rule.slotDurationMinutes,
          }
        : undefined,
      blockedDates,
      bookedTimestamps,
      targetDate: selectedDate,
    });
  }, [selectedDate, scheduleRules, blockedDates, bookedTimestamps]);

  const stepLabels = [
    t('stepDate'),
    t('stepTime'),
    t('stepService'),
    t('stepConfirm'),
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-[48px]">
      <StepIndicator currentStep={step} labels={stepLabels} />

      {/* Back button — shown on steps 2-4 */}
      {step > 1 && (
        <button
          type="button"
          onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
          className="mb-4 text-[16px] font-normal flex items-center gap-1"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'rgba(31, 27, 24, 0.60)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('back')}
        </button>
      )}

      {/* Wizard steps */}
      {step === 1 && (
        <DateStrip
          scheduleRules={scheduleRules}
          blockedDates={blockedDates}
          bookedTimestamps={bookedTimestamps}
          locale={locale}
        />
      )}
      {step === 2 && <TimeSlotGrid slots={slots} />}
      {step === 3 && <ServiceSelector services={services} locale={locale} />}
      {step === 4 && <ConfirmStep services={services} locale={locale} />}
    </div>
  );
}
