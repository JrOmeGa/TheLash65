'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { upsertScheduleRules } from '@/lib/actions/schedule';

type RuleInput = {
  id: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
};

type WeeklyHoursFormProps = {
  initialRules: RuleInput[];
};

// Display order Mon–Sun; dayOfWeek values per schema (0=Sunday, 6=Saturday)
const DAY_ORDER = [
  { key: 'monday', dayOfWeek: 1 },
  { key: 'tuesday', dayOfWeek: 2 },
  { key: 'wednesday', dayOfWeek: 3 },
  { key: 'thursday', dayOfWeek: 4 },
  { key: 'friday', dayOfWeek: 5 },
  { key: 'saturday', dayOfWeek: 6 },
  { key: 'sunday', dayOfWeek: 0 },
] as const;

type DayKey = (typeof DAY_ORDER)[number]['key'];

type DayFormValues = {
  isActive: boolean;
  openTime: string;
  closeTime: string;
};

type FormValues = {
  days: Record<DayKey, DayFormValues>;
};

// Slot duration is fixed at 120 minutes per D-05 — not user-configurable
const SLOT_DURATION_MINUTES = 120;

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
      style={{ width: 44, height: 24, borderRadius: 12 }}
    >
      {/* Track */}
      <span
        className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{
          background: checked ? '#755944' : 'var(--color-surface-container-low)',
          borderRadius: 12,
        }}
      />
      {/* Thumb */}
      <span
        className="absolute transition-transform duration-200"
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#ffffff',
          top: 2,
          left: checked ? 22 : 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

export function WeeklyHoursForm({ initialRules }: WeeklyHoursFormProps) {
  const t = useTranslations('admin');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Build default values from initialRules
  const buildDefaultDayValues = (dayOfWeek: number): DayFormValues => {
    const existing = initialRules.find((r) => r.dayOfWeek === dayOfWeek);
    if (existing) {
      return {
        isActive: existing.isActive,
        openTime: existing.openTime,
        closeTime: existing.closeTime,
      };
    }
    return { isActive: false, openTime: '10:00', closeTime: '18:00' };
  };

  const defaultValues: FormValues = {
    days: {
      monday: buildDefaultDayValues(1),
      tuesday: buildDefaultDayValues(2),
      wednesday: buildDefaultDayValues(3),
      thursday: buildDefaultDayValues(4),
      friday: buildDefaultDayValues(5),
      saturday: buildDefaultDayValues(6),
      sunday: buildDefaultDayValues(0),
    },
  };

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({ defaultValues });

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const onSubmit = async (data: FormValues) => {
    const rules = DAY_ORDER.map(({ key, dayOfWeek }) => ({
      dayOfWeek,
      openTime: data.days[key].openTime,
      closeTime: data.days[key].closeTime,
      slotDurationMinutes: SLOT_DURATION_MINUTES,
      isActive: data.days[key].isActive,
    }));

    try {
      await upsertScheduleRules(rules);
      setToast({ message: t('scheduleSaved'), type: 'success' });
    } catch {
      setToast({ message: t('scheduleSaveError'), type: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        {DAY_ORDER.map(({ key, dayOfWeek }) => {
          const isActive = watch(`days.${key}.isActive`);
          return (
            <div
              key={dayOfWeek}
              className="flex items-center gap-4 py-3 border-b border-[rgba(31,27,24,0.06)]"
              style={{ minHeight: 44 }}
            >
              {/* Day name */}
              <span
                className="font-semibold text-[16px] text-[var(--color-on-surface)]"
                style={{
                  width: 80,
                  minWidth: 80,
                  fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                }}
              >
                {t(key as DayKey)}
              </span>

              {/* Toggle */}
              <Toggle
                checked={isActive}
                onChange={(v) => setValue(`days.${key}.isActive`, v)}
                label={`Toggle ${key}`}
              />

              {/* Open time */}
              <input
                type="time"
                {...register(`days.${key}.openTime`)}
                className="text-[14px] rounded px-2 py-1 border border-[rgba(31,27,24,0.15)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] focus:outline-2 focus:outline-[#755944]"
                style={{
                  width: 100,
                  opacity: isActive ? 1 : 0.5,
                  pointerEvents: isActive ? 'auto' : 'none',
                  fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                }}
                aria-label={`${key} open time`}
              />

              {/* Close time */}
              <input
                type="time"
                {...register(`days.${key}.closeTime`)}
                className="text-[14px] rounded px-2 py-1 border border-[rgba(31,27,24,0.15)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] focus:outline-2 focus:outline-[#755944]"
                style={{
                  width: 100,
                  opacity: isActive ? 1 : 0.5,
                  pointerEvents: isActive ? 'auto' : 'none',
                  fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                }}
                aria-label={`${key} close time`}
              />
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="mt-6">
        <Button type="submit" className="w-full sm:w-auto">
          {t('saveSchedule')}
        </Button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="mt-4 rounded-lg px-4 py-3 text-[14px]"
          style={{
            background: toast.type === 'success' ? 'rgba(117, 89, 68, 0.10)' : 'rgba(185, 28, 28, 0.10)',
            color: toast.type === 'success' ? '#755944' : '#b91c1c',
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
          }}
        >
          {toast.message}
        </div>
      )}
    </form>
  );
}
