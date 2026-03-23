---
phase: 03-booking-core
plan: 02
subsystem: ui
tags: [next.js, react, zustand, tailwind, next-intl, date-fns, shadcn, server-actions]

requires:
  - phase: 03-booking-core
    plan: 01
    provides: useBookingStore, generateSlotsForDate, createBooking, getAvailabilityData, i18n booking namespace
  - phase: 01-foundation
    provides: ServiceCard component, Button component, formatDateGregorian, globals.css color tokens
  - phase: 02-authentication
    provides: auth.api.getSession, SignInButtons component

provides:
  - 4-step booking wizard at /[locale]/book with full client-side step navigation
  - DateStrip: 60-day horizontal scrollable date pill strip with available/unavailable states
  - TimeSlotGrid: 3-column CSS grid with unavailable slots shown grayed (D-07 compliant)
  - ServiceSelector: ServiceCard reuse with accent outline for selected state
  - ConfirmStep: booking summary card + createBooking submission + locale-prefixed redirect
  - StepIndicator: 4-dot progress indicator with connecting lines
  - Auth gate preserved — unauthenticated users see SignInButtons, authenticated see wizard
  - ISO string reconstitution to Date[] in BookingWizard before slot engine consumption

affects: [03-03, 03-04, admin-schedule-ui, confirmation-page]

tech-stack:
  added: []
  patterns:
    - ISO strings passed as RSC props, reconstituted to Date[] via useMemo in client component
    - useBookingStore.getState().reset() called on wizard mount to clear stale step state
    - Server Component fetches availability data and passes serialized props to client wizard
    - formatDateGregorian used for all date display (calendar:gregory prevents Buddhist Era)
    - Slot computation in BookingWizard useMemo, not in individual step components

key-files:
  created:
    - src/app/[locale]/book/_components/BookingWizard.tsx
    - src/app/[locale]/book/_components/StepIndicator.tsx
    - src/app/[locale]/book/_components/DateStrip.tsx
    - src/app/[locale]/book/_components/TimeSlotGrid.tsx
    - src/app/[locale]/book/_components/ServiceSelector.tsx
    - src/app/[locale]/book/_components/ConfirmStep.tsx
  modified:
    - src/app/[locale]/book/page.tsx

key-decisions:
  - "ISO strings reconstituted via useMemo in BookingWizard — not in individual step components — centralizes the boundary crossing"
  - "DateStrip receives reconstituted Date[] from parent (not ISO strings) — avoids repeated reconstitution"
  - "TimeSlotGrid receives Date-typed slots from BookingWizard useMemo — no serialization needed for client-only data"
  - "ConfirmStep reads locale from props rather than useLocale hook — avoids hydration mismatch risk"

patterns-established:
  - "RSC props crossing boundary: Date -> ISO string in Server Component, ISO string -> Date via useMemo in client"
  - "Wizard step components receive pre-processed data from orchestrator, not raw props"
  - "useBookingStore.getState() for writes in event handlers (avoids selector re-renders)"

requirements-completed: [BOOK-01, BOOK-02, BOOK-03, BOOK-06]

duration: 5min
completed: 2026-03-23
---

# Phase 03 Plan 02: Booking Wizard UI Summary

**4-step booking wizard: DateStrip (60-day scroll), TimeSlotGrid (3-col with grayed unavailable), ServiceSelector (existing ServiceCard + accent outline), ConfirmStep (summary card + atomic submission + locale-prefixed redirect)**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-23T06:42:00Z
- **Completed:** 2026-03-23T06:47:21Z
- **Tasks:** 2 completed
- **Files modified:** 7

## Accomplishments

- Book page server component: 60-day availability window fetch, DB query for active services, ISO serialization for RSC boundary, BookingWizard render for authenticated users, SignInButtons auth gate preserved
- BookingWizard orchestrator: ISO-to-Date reconstitution via useMemo, store reset on mount, slot computation for step 2, Back button on steps 2-4, conditional step rendering
- StepIndicator: 4 dots (filled active #755944, filled completed #9c7660, outlined upcoming), connecting lines, desktop-only labels, aria-label on active step
- DateStrip: 60 date pills, scroll-snap horizontal, available/unavailable/selected visual states, role=listbox + aria-selected
- TimeSlotGrid: 3-column CSS grid, unavailable slots visible grayed with aria-disabled (D-07), role=group aria-label
- ServiceSelector: ServiceCard reuse with 2px solid #755944 outline on selected card
- ConfirmStep: summary card with row-by-row booking details, createBooking Server Action call, slot_unavailable role=alert error, redirect to /${locale}/book/confirmation/${bookingId}

## Task Commits

1. **Task 1: Book page Server Component + BookingWizard orchestrator + StepIndicator** - `975095a` (feat)
2. **Task 2: DateStrip + TimeSlotGrid + ServiceSelector + ConfirmStep components** - `7556723` (feat)

## Files Created/Modified

- `src/app/[locale]/book/page.tsx` — Server Component: auth gate, 60-day window fetch, BookingWizard render
- `src/app/[locale]/book/_components/BookingWizard.tsx` — Wizard orchestrator with ISO reconstitution, slot computation, step routing
- `src/app/[locale]/book/_components/StepIndicator.tsx` — 4-dot progress indicator with connecting lines
- `src/app/[locale]/book/_components/DateStrip.tsx` — Horizontal scrollable 60-day date strip
- `src/app/[locale]/book/_components/TimeSlotGrid.tsx` — 3-column slot grid with unavailable state
- `src/app/[locale]/book/_components/ServiceSelector.tsx` — ServiceCard wrapper with selection outline
- `src/app/[locale]/book/_components/ConfirmStep.tsx` — Booking summary + submit + error handling + redirect

## Decisions Made

- ISO strings reconstituted to Date[] via useMemo in BookingWizard (not in each step component) — single conversion point, cleaner separation
- DateStrip receives pre-reconstituted Date[] from BookingWizard — avoids duplicate conversion work
- TimeSlotGrid receives slots with startsAt as Date objects — these stay client-side, no serialization needed
- ConfirmStep reads locale from props — consistent with other step components receiving locale as prop

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria satisfied. TypeScript compiled with zero errors.

## Issues Encountered

None — TypeScript compilation passed clean on first run after all files were created.

## User Setup Required

None — no external service configuration required.

## Known Stubs

None — all wizard steps are wired to real data from Server Component. ServiceSelector uses real services from DB query. ConfirmStep calls real createBooking Server Action. No placeholder data flows to UI.

Note: The confirmation page at `/${locale}/book/confirmation/[id]` is not yet built — it is the scope of Plan 04. ConfirmStep redirects to that URL; users will see a 404 until Plan 04 is complete.

## Next Phase Readiness

- Booking wizard UI complete — clients can navigate 4 steps and submit a booking
- Plan 03 (admin schedule UI) is independent and can execute in parallel
- Plan 04 (confirmation page) depends on this plan's /${locale}/book/confirmation/[id] redirect target
- No blockers for Plan 03 or Plan 04

---
## Self-Check: PASSED

Files verified:
- FOUND: src/app/[locale]/book/page.tsx
- FOUND: src/app/[locale]/book/_components/BookingWizard.tsx
- FOUND: src/app/[locale]/book/_components/StepIndicator.tsx
- FOUND: src/app/[locale]/book/_components/DateStrip.tsx
- FOUND: src/app/[locale]/book/_components/TimeSlotGrid.tsx
- FOUND: src/app/[locale]/book/_components/ServiceSelector.tsx
- FOUND: src/app/[locale]/book/_components/ConfirmStep.tsx

Commits verified:
- FOUND: 975095a (Task 1 — Book page + BookingWizard + StepIndicator)
- FOUND: 7556723 (Task 2 — DateStrip + TimeSlotGrid + ServiceSelector + ConfirmStep)

*Phase: 03-booking-core*
*Completed: 2026-03-23*
