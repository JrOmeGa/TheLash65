'use client';

import { addDays, startOfDay, isSameDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { formatDateGregorian } from '@/lib/date-utils';

type DateStripProps = {
  scheduleRules: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    slotDurationMinutes: number;
    isActive: boolean;
  }>;
  blockedDates: Date[];
  bookedTimestamps: Date[];
  locale: string;
};

export function DateStrip({ scheduleRules, blockedDates, locale }: DateStripProps) {
  const t = useTranslations('booking');
  const selectedDate = useBookingStore((s) => s.selectedDate);

  // Generate 60 date pills starting from today (D-03)
  const dates = Array.from({ length: 60 }, (_, i) => addDays(startOfDay(new Date()), i));

  function isDateAvailable(date: Date): boolean {
    const dayOfWeek = date.getDay();
    const hasActiveRule = scheduleRules.some((r) => r.dayOfWeek === dayOfWeek && r.isActive);
    if (!hasActiveRule) return false;
    const isBlocked = blockedDates.some((d) => isSameDay(d, date));
    return !isBlocked;
  }

  function handleDateSelect(date: Date) {
    useBookingStore.getState().setDate(date);
  }

  return (
    <div>
      <h2
        className="text-[20px] font-semibold leading-[1.2] mb-4"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif', color: '#1F1B18' }}
      >
        {t('stepDate')}
      </h2>

      {/* Horizontal scrollable date strip */}
      <div
        role="listbox"
        aria-label={t('stepDate')}
        className="flex gap-2 overflow-x-auto px-4 -mx-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`.date-strip::-webkit-scrollbar { display: none; }`}</style>
        {dates.map((date) => {
          const available = isDateAvailable(date);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const dayName = formatDateGregorian(date, locale, { weekday: 'short', year: undefined, month: undefined, day: undefined });
          const dateNum = date.getDate();

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-disabled={!available}
              onClick={available ? () => handleDateSelect(date) : undefined}
              className="flex flex-col items-center justify-center rounded-lg flex-shrink-0 transition-transform duration-100"
              style={{
                minWidth: '60px',
                height: '44px',
                scrollSnapAlign: 'start',
                background: isSelected
                  ? 'linear-gradient(135deg, #755944 0%, #9c7660 100%)'
                  : 'var(--color-surface-container-low)',
                color: isSelected ? '#ffffff' : available ? '#1F1B18' : 'rgba(31, 27, 24, 0.35)',
                pointerEvents: available ? undefined : 'none',
                cursor: available ? 'pointer' : 'default',
                border: 'none',
                outline: 'none',
              }}
            >
              {/* Day name — 14px semibold */}
              <span
                className="text-[14px] font-semibold leading-[1.3]"
                style={{
                  fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                  color: isSelected ? 'rgba(255,255,255,0.80)' : 'rgba(31, 27, 24, 0.60)',
                }}
              >
                {dayName}
              </span>
              {/* Date number — 16px */}
              <span
                className="text-[16px] leading-[1.3]"
                style={{
                  fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {dateNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
