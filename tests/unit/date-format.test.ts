import { describe, it, expect } from 'vitest';
import { formatDateGregorian } from '@/lib/date-utils';

describe('Date formatting - Gregorian calendar guard (I18N-03)', () => {
  const testDate = new Date('2025-06-15T12:00:00Z');

  it('formats Thai locale date with Gregorian year (not Buddhist Era)', () => {
    const result = formatDateGregorian(testDate, 'th-TH');
    // Buddhist Era would show 2568 instead of 2025
    expect(result).toContain('2025');
    expect(result).not.toContain('2568');
  });

  it('formats English locale date with correct year', () => {
    const result = formatDateGregorian(testDate, 'en-US');
    expect(result).toContain('2025');
  });

  it('includes month and day in output', () => {
    const result = formatDateGregorian(testDate, 'en-US');
    expect(result).toContain('June');
    expect(result).toContain('15');
  });

  it('accepts custom format options while preserving Gregorian calendar', () => {
    const result = formatDateGregorian(testDate, 'th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    expect(result).toContain('2025');
    expect(result).not.toContain('2568');
  });
});
