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
