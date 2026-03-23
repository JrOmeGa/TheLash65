import { describe, it, expect, beforeEach } from 'vitest';
import { generateSlotsForDate } from './date-utils';

// ────────────────────────────────────────────────────────────────────────────────
// generateSlotsForDate tests
// ────────────────────────────────────────────────────────────────────────────────

describe('generateSlotsForDate', () => {
  const baseRule = {
    openTime: '10:00',
    closeTime: '16:00',
    slotDurationMinutes: 120,
  };

  const targetDate = new Date('2026-04-01T00:00:00Z'); // Wednesday

  it('returns 3 slots for openTime:10:00, closeTime:16:00, slotDuration:120', () => {
    const slots = generateSlotsForDate({
      rule: baseRule,
      blockedDates: [],
      bookedTimestamps: [],
      targetDate,
    });
    expect(slots).toHaveLength(3);
    expect(slots[0].time).toBe('10:00');
    expect(slots[1].time).toBe('12:00');
    expect(slots[2].time).toBe('14:00');
  });

  it('returns empty array when no rule for the day', () => {
    const slots = generateSlotsForDate({
      rule: undefined,
      blockedDates: [],
      bookedTimestamps: [],
      targetDate,
    });
    expect(slots).toHaveLength(0);
  });

  it('returns empty array when targetDate is in blockedDates', () => {
    const slots = generateSlotsForDate({
      rule: baseRule,
      blockedDates: [new Date('2026-04-01T12:00:00Z')],
      bookedTimestamps: [],
      targetDate,
    });
    expect(slots).toHaveLength(0);
  });

  it('marks slot as unavailable when bookedTimestamp matches slot time', () => {
    // 2026-04-01 12:00 local time — using same day start + hours
    const bookedAt = new Date('2026-04-01T05:00:00.000Z'); // 12:00 Bangkok time (UTC+7)
    const targetLocal = new Date('2026-04-01T00:00:00+07:00'); // midnight Bangkok

    const slots = generateSlotsForDate({
      rule: baseRule,
      blockedDates: [],
      bookedTimestamps: [bookedAt],
      targetDate: targetLocal,
    });
    // All 3 slots returned
    expect(slots).toHaveLength(3);
    // The booked slot at 12:00 is unavailable
    const bookedSlot = slots.find((s) => s.time === '12:00');
    expect(bookedSlot).toBeDefined();
    expect(bookedSlot!.available).toBe(false);
  });

  it('returns all slots (booked ones show available:false, not hidden)', () => {
    const targetLocal = new Date('2026-04-01');
    const slots = generateSlotsForDate({
      rule: baseRule,
      blockedDates: [],
      bookedTimestamps: [slots_helper_booked_12(targetLocal)],
      targetDate: targetLocal,
    });
    // D-07: booked slots are shown grayed not hidden
    expect(slots).toHaveLength(3);
    const available = slots.filter((s) => s.available);
    const unavailable = slots.filter((s) => !s.available);
    expect(available.length + unavailable.length).toBe(3);
  });

  it('all slots are available when no bookings', () => {
    const slots = generateSlotsForDate({
      rule: baseRule,
      blockedDates: [],
      bookedTimestamps: [],
      targetDate,
    });
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it('each slot has a time string and startsAt Date', () => {
    const slots = generateSlotsForDate({
      rule: baseRule,
      blockedDates: [],
      bookedTimestamps: [],
      targetDate,
    });
    for (const slot of slots) {
      expect(typeof slot.time).toBe('string');
      expect(slot.time).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.startsAt).toBeInstanceOf(Date);
    }
  });
});

// Helper: returns a Date matching 12:00 on same day as targetDate (local time)
function slots_helper_booked_12(targetDate: Date): Date {
  const d = new Date(targetDate);
  d.setHours(12, 0, 0, 0);
  return d;
}

// ────────────────────────────────────────────────────────────────────────────────
// Zustand bookingStore tests
// ────────────────────────────────────────────────────────────────────────────────

describe('useBookingStore', () => {
  // Dynamically imported after module is available
  let useBookingStore: ReturnType<typeof import('./stores/bookingStore')['useBookingStore']>;

  beforeEach(async () => {
    // Fresh import for store isolation
    const mod = await import('./stores/bookingStore');
    useBookingStore = mod.useBookingStore;
    // Reset state before each test
    useBookingStore.getState().reset();
  });

  it('initial state has step=1 and all selections null', () => {
    const state = useBookingStore.getState();
    expect(state.step).toBe(1);
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTime).toBeNull();
    expect(state.selectedServiceId).toBeNull();
  });

  it('setDate resets selectedTime to null and advances step to 2', () => {
    const store = useBookingStore.getState();
    // First set a time to ensure it gets cleared
    store.setTime('10:00');
    store.setDate(new Date('2026-04-01'));
    const state = useBookingStore.getState();
    expect(state.selectedDate).toEqual(new Date('2026-04-01'));
    expect(state.selectedTime).toBeNull();
    expect(state.step).toBe(2);
  });

  it('setTime advances step to 3', () => {
    useBookingStore.getState().setTime('12:00');
    const state = useBookingStore.getState();
    expect(state.selectedTime).toBe('12:00');
    expect(state.step).toBe(3);
  });

  it('setService advances step to 4', () => {
    useBookingStore.getState().setService(42);
    const state = useBookingStore.getState();
    expect(state.selectedServiceId).toBe(42);
    expect(state.step).toBe(4);
  });

  it('reset clears all selections and sets step to 1', () => {
    const store = useBookingStore.getState();
    store.setDate(new Date('2026-04-01'));
    store.setTime('10:00');
    store.setService(1);
    store.reset();
    const state = useBookingStore.getState();
    expect(state.step).toBe(1);
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTime).toBeNull();
    expect(state.selectedServiceId).toBeNull();
  });
});
