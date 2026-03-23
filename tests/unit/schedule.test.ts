import { describe, it, expect } from 'vitest';
import { generateSlotsForDate } from '@/lib/date-utils';

describe('ADMIN-04: upsertScheduleRules behavior', () => {
  it('schedule rules with isActive:true produce slots via generateSlotsForDate', () => {
    const rule = { openTime: '10:00', closeTime: '16:00', slotDurationMinutes: 120 };
    const monday = new Date('2026-04-06T00:00:00Z'); // A Monday
    const slots = generateSlotsForDate({
      rule,
      blockedDates: [],
      bookedTimestamps: [],
      targetDate: monday,
    });
    expect(slots.length).toBe(3);
    expect(slots.map((s) => s.time)).toEqual(['10:00', '12:00', '14:00']);
  });

  it('schedule rules with isActive:false (no rule passed) produce zero slots', () => {
    // When isActive is false, the UI layer passes undefined as rule
    const monday = new Date('2026-04-06T00:00:00Z');
    const slots = generateSlotsForDate({
      rule: undefined,
      blockedDates: [],
      bookedTimestamps: [],
      targetDate: monday,
    });
    expect(slots.length).toBe(0);
  });
});

describe('ADMIN-05: blockDate causes slot engine to return zero slots', () => {
  it('a blocked date produces zero slots even if a rule exists', () => {
    const rule = { openTime: '10:00', closeTime: '16:00', slotDurationMinutes: 120 };
    const targetDate = new Date('2026-04-06T00:00:00Z');
    // Simulate a blocked date (stored at noon UTC per blockDate action)
    const blockedDates = [new Date('2026-04-06T12:00:00Z')];
    const slots = generateSlotsForDate({
      rule,
      blockedDates,
      bookedTimestamps: [],
      targetDate,
    });
    expect(slots.length).toBe(0);
  });

  it('an unblocked date (not in blockedDates) still produces slots', () => {
    const rule = { openTime: '10:00', closeTime: '16:00', slotDurationMinutes: 120 };
    const targetDate = new Date('2026-04-06T00:00:00Z');
    // Different date blocked — should not affect targetDate
    const blockedDates = [new Date('2026-04-07T12:00:00Z')];
    const slots = generateSlotsForDate({
      rule,
      blockedDates,
      bookedTimestamps: [],
      targetDate,
    });
    expect(slots.length).toBe(3);
  });
});
