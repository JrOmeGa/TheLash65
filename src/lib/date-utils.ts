import { addMinutes, getHours, getMinutes, isSameDay, setHours, setMinutes, startOfDay } from 'date-fns';

/**
 * Format a date for display, forcing Gregorian calendar to prevent
 * Buddhist Era years in Thai locale (th-TH defaults to BE+543).
 *
 * D-18: All dates pass `calendar: 'gregory'` explicitly when formatting
 * with Thai locale to prevent year 2568 (BE) being shown instead of 2025 (CE).
 */
export function formatDateGregorian(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(date);
}

// ────────────────────────────────────────────────────────────────────────────────
// Slot generation
// ────────────────────────────────────────────────────────────────────────────────

export type SlotStatus = {
  time: string; // "HH:MM"
  startsAt: Date; // Local timestamp for this slot
  available: boolean;
};

/**
 * Generate time slots for a given date from a schedule rule.
 *
 * Rules:
 * - No rule for the day of week → empty array (D-06)
 * - Date is blocked → empty array (D-08)
 * - Booked timestamps mark slots as unavailable, not hidden (D-07)
 */
export function generateSlotsForDate(params: {
  rule: { openTime: string; closeTime: string; slotDurationMinutes: number } | undefined;
  blockedDates: Date[];
  bookedTimestamps: Date[];
  targetDate: Date;
  now?: Date; // defaults to new Date(); injectable for tests
}): SlotStatus[] {
  const { rule, blockedDates, bookedTimestamps, targetDate, now = new Date() } = params;

  // No rule for this day of week = no slots
  if (!rule) return [];

  // Day is blocked = no slots (D-08: day grayed out entirely)
  const isBlocked = blockedDates.some((d) => isSameDay(d, targetDate));
  if (isBlocked) return [];

  const [openH, openM] = rule.openTime.split(':').map(Number);
  const [closeH, closeM] = rule.closeTime.split(':').map(Number);

  const dayBase = startOfDay(targetDate);
  let cursor = setMinutes(setHours(dayBase, openH), openM);
  const closeTime = setMinutes(setHours(dayBase, closeH), closeM);

  const slots: SlotStatus[] = [];

  while (cursor < closeTime) {
    const isBooked = bookedTimestamps.some(
      (b) => Math.abs(b.getTime() - cursor.getTime()) < 60_000,
    );
    const isPast = cursor <= now;
    slots.push({
      time: `${String(getHours(cursor)).padStart(2, '0')}:${String(getMinutes(cursor)).padStart(2, '0')}`,
      startsAt: cursor,
      available: !isBooked && !isPast,
    });
    cursor = addMinutes(cursor, rule.slotDurationMinutes);
  }

  return slots;
}
