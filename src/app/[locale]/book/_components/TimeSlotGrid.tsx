'use client';

import { useTranslations } from 'next-intl';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { formatDateGregorian } from '@/lib/date-utils';

type TimeSlotGridProps = {
  slots: Array<{ time: string; startsAt: Date; available: boolean }>;
};

export function TimeSlotGrid({ slots }: TimeSlotGridProps) {
  const t = useTranslations('booking');
  const selectedTime = useBookingStore((s) => s.selectedTime);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  // Need locale for date display — read from store indirectly via selectedDate
  // Use a fixed format that works without locale prop (locale comes from page context)
  const locale = typeof window !== 'undefined'
    ? document.documentElement.lang || 'en'
    : 'en';

  function handleSlotSelect(time: string) {
    useBookingStore.getState().setTime(time);
  }

  // Use 3-col grid; if fewer than 3 slots, use auto-fill
  const gridCols = slots.length >= 3
    ? 'repeat(3, 1fr)'
    : 'repeat(auto-fill, minmax(80px, 1fr))';

  return (
    <div>
      <h2
        className="text-[20px] font-semibold leading-[1.2] mb-1"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif', color: '#1F1B18' }}
      >
        {t('stepTime')}
      </h2>

      {/* Selected date sub-heading */}
      {selectedDate && (
        <p
          className="text-[14px] mb-4"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'rgba(31, 27, 24, 0.60)',
          }}
        >
          {formatDateGregorian(selectedDate, locale, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: undefined,
          })}
        </p>
      )}

      {slots.length === 0 ? (
        <p
          className="text-[14px] text-center py-8"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'rgba(31, 27, 24, 0.60)',
          }}
        >
          {t('errorSlotFetch')}
        </p>
      ) : (
        <div
          role="group"
          aria-label="Available times"
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: '8px',
          }}
        >
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            const isUnavailable = !slot.available;

            return (
              <button
                key={slot.time}
                type="button"
                aria-pressed={isSelected}
                aria-disabled={isUnavailable ? 'true' : undefined}
                aria-label={isUnavailable ? `${slot.time} Unavailable` : slot.time}
                onClick={slot.available ? () => handleSlotSelect(slot.time) : undefined}
                className="flex flex-col items-center justify-center transition-transform duration-100 hover:brightness-[1.03] active:scale-[0.97]"
                style={{
                  height: '44px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                  background: isSelected
                    ? 'linear-gradient(135deg, #755944 0%, #9c7660 100%)'
                    : 'var(--color-surface-container-low)',
                  color: isSelected
                    ? '#ffffff'
                    : isUnavailable
                      ? 'rgba(31, 27, 24, 0.35)'
                      : '#1F1B18',
                  pointerEvents: isUnavailable ? 'none' : undefined,
                  border: 'none',
                  outline: 'none',
                  cursor: isUnavailable ? 'default' : 'pointer',
                }}
                onFocus={(e) => {
                  if (!isUnavailable) {
                    e.currentTarget.style.outline = '2px solid #755944';
                    e.currentTarget.style.outlineOffset = '2px';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <span>{slot.time}</span>
                {isUnavailable && (
                  <span
                    className="text-[14px] font-semibold leading-[1.3]"
                    style={{ fontSize: '10px' }}
                  >
                    {t('unavailable')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
