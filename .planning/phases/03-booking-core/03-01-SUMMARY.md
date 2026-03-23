---
phase: 03-booking-core
plan: 01
subsystem: database
tags: [drizzle, zustand, server-actions, zod, vitest, date-fns, next-intl, i18n]

requires:
  - phase: 02-authentication
    provides: auth.api.getSession pattern, Better Auth session check, admin route protection
  - phase: 01-foundation
    provides: Drizzle schema (bookings, services, scheduleRules, scheduleExceptions), date-utils, db proxy

provides:
  - Unique constraint on bookings.scheduledAt (atomic double-booking prevention)
  - generateSlotsForDate pure function with SlotStatus type
  - useBookingStore Zustand store (4-step wizard state machine)
  - createBooking Server Action with onConflictDoNothing atomic insert
  - getAvailabilityData and getBookingById Server Actions
  - Booking conflict behavioral test (BOOK-06 slot_unavailable path verified)
  - upsertScheduleRules, blockDate, unblockDate, getScheduleData Server Actions
  - Complete booking + admin i18n copy in en.json and th.json

affects: [03-02, 03-03, 03-04, booking-wizard-ui, admin-schedule-ui, confirmation-page]

tech-stack:
  added: [zustand@5, react-hook-form, @hookform/resolvers, date-fns (already present)]
  patterns:
    - Server Actions with 'use server' directive for all mutations
    - onConflictDoNothing targeting scheduledAt unique constraint for atomic reservation
    - ISO 8601 string (not Date objects) across Server Action boundary
    - requireAdmin() checks session.user.email === process.env.ADMIN_EMAIL
    - blockDate stores noon UTC (T12:00:00Z) to avoid timezone boundary issues
    - Zustand store with step: 1|2|3|4 wizard state machine
    - setDate resets selectedTime and advances to step 2 (date-first flow per D-01)

key-files:
  created:
    - src/lib/date-utils.ts (updated — generateSlotsForDate + SlotStatus type added)
    - src/lib/stores/bookingStore.ts
    - src/lib/actions/booking.ts
    - src/lib/actions/booking.test.ts
    - src/lib/actions/schedule.ts
    - src/lib/date-utils.test.ts
  modified:
    - src/db/schema.ts (unique constraint added to bookings table)
    - messages/en.json (booking + admin namespaces added)
    - messages/th.json (booking + admin namespaces added)
    - vitest.config.ts (include pattern extended to src/**/*.test.ts)
    - package.json (zustand, react-hook-form, @hookform/resolvers added)

key-decisions:
  - "Zustand 5 installed (5.0.12) — create() API compatible, no useSyncExternalStore bridging needed"
  - "bookingSchema uses z.string().datetime() — Zod v4 still supports this on string schema (not only z.iso.datetime())"
  - "vitest.config.ts extended to include src/**/*.test.ts pattern — avoids forcing test files into tests/unit/ structure"
  - "booking.test.ts uses makeMockDb() factory to avoid vi.clearAllMocks() breaking mock chains — simpler than re-mocking in beforeEach"
  - "date-utils.test.ts imports BookingStoreType from static import to fix TypeScript ReturnType<dynamic-import> unknown error"

patterns-established:
  - "Server Action boundary: always pass ISO 8601 strings, never Date objects (Server Actions serialize over network)"
  - "Admin auth: requireAdmin() throws Error('Unauthorized') — callers see thrown exception, not returned error object"
  - "Booking auth: createBooking returns { error: 'unauthorized' } — caller-friendly error handling for client components"
  - "Slot generation: blocked days return [] (not shown), booked slots return available:false (shown grayed per D-07)"

requirements-completed: [BOOK-04, BOOK-05, BOOK-06, ADMIN-04, ADMIN-05]

duration: 7min
completed: 2026-03-23
---

# Phase 03 Plan 01: Data Layer and Business Logic Summary

**Booking data layer: unique-constrained schema pushed to DB, slot generation engine, 4-step Zustand wizard, Server Actions for atomic booking and schedule management, and complete Thai/English i18n copy**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-23T06:35:20Z
- **Completed:** 2026-03-23T06:42:00Z
- **Tasks:** 2 completed
- **Files modified:** 10

## Accomplishments

- Schema migration: unique constraint `bookings_scheduled_at_unique` on `scheduledAt` pushed to Supabase DB — prevents double-booking at DB level (BOOK-06)
- Slot engine: `generateSlotsForDate` returns correct time slots from scheduleRules, handles blocked dates (empty array), booked timestamps (available:false but not hidden per D-07) — 7 test cases all green
- Zustand store: `useBookingStore` with 4-step wizard state, step transitions (setDate→2, setTime→3, setService→4), setDate resets selectedTime — 5 test cases all green
- Booking Server Actions: `createBooking` with atomic insert, `getAvailabilityData`, `getBookingById` — BOOK-06 conflict path tested behaviorally
- Schedule Server Actions: `upsertScheduleRules` (delete+insert), `blockDate` (noon UTC), `unblockDate`, `getScheduleData` with requireAdmin() guard
- i18n: booking + admin namespaces in both en.json and th.json — all copy keys from UI-SPEC Copywriting Contract present

## Task Commits

1. **Task 1: Schema migration + slot generation engine + Zustand store** - `6f4a33e` (feat)
2. **Task 2: Server Actions + i18n messages + booking conflict test** - `4bb476f` (feat)

## Files Created/Modified

- `src/db/schema.ts` — Added unique('bookings_scheduled_at_unique').on(table.scheduledAt) and `unique` import
- `src/lib/date-utils.ts` — Added generateSlotsForDate, SlotStatus type, date-fns imports
- `src/lib/date-utils.test.ts` — 12 tests: 7 for slot generation, 5 for Zustand store
- `src/lib/stores/bookingStore.ts` — useBookingStore Zustand 5 store with step 1|2|3|4
- `src/lib/actions/booking.ts` — createBooking (atomic), getAvailabilityData, getBookingById
- `src/lib/actions/booking.test.ts` — BOOK-06 conflict path: slot_unavailable + bookingId success
- `src/lib/actions/schedule.ts` — upsertScheduleRules, blockDate, unblockDate, getScheduleData
- `messages/en.json` — booking + admin namespaces (14 + 14 keys)
- `messages/th.json` — Thai translations for booking + admin namespaces
- `vitest.config.ts` — Extended include pattern to src/**/*.test.ts
- `package.json` — zustand, react-hook-form, @hookform/resolvers added

## Decisions Made

- Zustand 5 installed (5.0.12) — create() API works directly, no bridging needed for Vitest node environment
- `z.string().datetime()` works in Zod v4 (not deprecated, still accepts ISO 8601 strings)
- Extended vitest.config.ts include pattern — plan specifies test files in `src/lib/`, not `tests/unit/`
- `makeMockDb()` factory pattern in booking.test.ts — prevents vi.clearAllMocks() from breaking the mock chain
- `BookingStoreType` alias via static import — fixes TypeScript `unknown` error with dynamic import in let variable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript compilation error in date-utils.test.ts**
- **Found during:** Task 2 verification (npx tsc --noEmit)
- **Issue:** `let useBookingStore: ReturnType<typeof import(...)['useBookingStore']>` produced `'unknown'` TS errors (10 errors)
- **Fix:** Added static import at top of file, used `BookingStoreType = typeof bookingStoreImport` alias for the let variable
- **Files modified:** src/lib/date-utils.test.ts
- **Verification:** npx tsc --noEmit produced zero errors
- **Committed in:** 4bb476f (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed booking.test.ts ESM/require conflict and mock chain issue**
- **Found during:** Task 2 test execution
- **Issue 1:** `await` in non-async beforeEach caused parse error; `require('@/db')` fails in ESM vitest
- **Issue 2:** Original mock chain using `mockReturning.mock.results` was overly complex and error-prone
- **Fix:** Rewrote test using `makeMockDb()` factory in vi.mock, `mockReturning` as standalone vi.fn at module level, simple beforeEach with vi.clearAllMocks()
- **Files modified:** src/lib/actions/booking.test.ts
- **Verification:** Both conflict path tests pass (slot_unavailable + bookingId)
- **Committed in:** 4bb476f (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 TypeScript bug, 1 blocking test infrastructure)
**Impact on plan:** Both auto-fixes required for correctness. No scope creep — test behavior matches plan specification exactly.

## Issues Encountered

- Vitest config only covered `tests/unit/` — extended to `src/**/*.test.ts` (Rule 3, blocking)
- Zod v4's `z.string().datetime()` verified to still work (not renamed to `z.iso.datetime()` only) — no change needed

## User Setup Required

None - no external service configuration required beyond what's already in .env.local.

Note: The `npx drizzle-kit push` (via `npm run db:push`) applied the unique constraint to the Supabase database. The push output showed "Changes applied" confirming the constraint was created.

## Known Stubs

None — this plan delivers pure data layer (functions, store, Server Actions). No UI components with placeholder data. The `booking.confirmationNextSteps` and `booking.qrPlaceholder` i18n keys describe the QR placeholder intentionally per D-14 and Plan 04 (payment QR).

## Next Phase Readiness

- All data layer contracts stable and tested — Plans 02, 03, 04 can import from these files
- `createBooking` and `getAvailabilityData` are the primary interfaces for the booking wizard UI (Plan 02)
- `upsertScheduleRules`, `blockDate`, `unblockDate` are ready for the admin schedule UI (Plan 03)
- `getBookingById` is ready for the confirmation page (Plan 04)
- No blockers for next plans

---
## Self-Check: PASSED

All files verified present. All commits verified in git log.

*Phase: 03-booking-core*
*Completed: 2026-03-23*
