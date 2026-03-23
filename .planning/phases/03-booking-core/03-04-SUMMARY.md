---
phase: 03-booking-core
plan: 04
subsystem: booking-confirmation
tags: [next-intl, server-components, better-auth, confirmation-page, sticky-bar]

requires:
  - phase: 03-booking-core
    plan: 01
    provides: getBookingById Server Action, formatDateGregorian utility
  - phase: 03-booking-core
    plan: 02
    provides: createBooking Server Action, booking wizard redirecting to /book/confirmation/[id]

provides:
  - Auth-gated confirmation page at /book/confirmation/[id] (Server Component)
  - StickyMandateBar CTA wired to /book (was '#' placeholder)

affects: [promptpay-phase-4, booking-flow-e2e]

tech-stack:
  added: []
  patterns:
    - Server Component auth gate using auth.api.getSession() + redirect() — no middleware needed per-page
    - formatDateGregorian used with locale from params for date/time display
    - locale-aware Link from @/i18n/navigation auto-prefixes locale to href="/book"

key-files:
  created:
    - src/app/[locale]/book/confirmation/[id]/page.tsx
  modified:
    - src/components/layout/StickyMandateBar.tsx

key-decisions:
  - "No 'use client' on confirmation page — pure Server Component; session check in RSC layer"
  - "QR placeholder with #f5ede6 background reserved for Phase 4 PromptPay integration"
  - "StickyMandateBar uses next-intl Link href='/book' — locale prefix handled automatically"

requirements-completed: [BOOK-03, BOOK-01]

duration: 10min
completed: 2026-03-23
status: partial — Task 1 complete, Task 2 (human-verify) pending
---

# Phase 03 Plan 04: Confirmation Page + StickyMandateBar Wiring Summary

**Auth-gated confirmation page at /book/confirmation/[id] showing booking summary (service, date, time, price), next-steps copy, and QR placeholder for Phase 4 PromptPay. StickyMandateBar CTA wired from '#' placeholder to '/book'.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-23T06:50:00Z
- **Completed (partial):** 2026-03-23T06:50:00Z
- **Tasks:** 1 of 2 complete (Task 2 awaiting human verification)
- **Files modified:** 2

## Accomplishments

- Confirmation page (`/book/confirmation/[id]`) created as a Server Component with:
  - Auth gate: unauthenticated users and invalid booking IDs redirect to `/${locale}/book`
  - `getBookingById` Server Action called with the `id` param — only returns if booking belongs to current user
  - `<h1>` with `booking.confirmationHeading` i18n key, 28px Display semibold, `#755944` color
  - Booking summary card: `#ffffff` background, `border-radius: 12px`, shadow, `padding: 24px`
  - 4 summary rows (service, date, time, price) with `border-bottom: 1px solid rgba(31,27,24,0.06)` separators
  - `formatDateGregorian` used for both date (weekday+month+day) and time (HH:MM 24h) display
  - Price row value in `#755944` accent color
  - Next-steps copy block: `rgba(31,27,24,0.75)` color, `margin-top: 24px`
  - QR placeholder: `#f5ede6` background, `border-radius: 8px`, `padding: 32px`, centered `booking.qrPlaceholder` text
- StickyMandateBar: `href="#"` changed to `href="/book"` — next-intl's locale-aware Link auto-prefixes for `/th/book` and `/en/book`
- TypeScript compiled with no errors

## Task Commits

1. **Task 1: Confirmation page + StickyMandateBar wiring** — `f1f5dd7` (feat)

## Files Created/Modified

- `src/app/[locale]/book/confirmation/[id]/page.tsx` — Auth-gated Server Component; booking summary card, next-steps, QR placeholder
- `src/components/layout/StickyMandateBar.tsx` — Changed `href="#"` to `href="/book"`

## Decisions Made

- Pure Server Component for confirmation page — session guard in RSC layer via `auth.api.getSession()`, consistent with auth patterns established in Phase 2
- QR placeholder implemented as a styled `<div>` with `#f5ede6` background — will be replaced with actual PromptPay QR generation in Phase 4
- `href="/book"` on StickyMandateBar uses next-intl's `Link` which auto-prepends locale — no locale manipulation needed in the component

## Deviations from Plan

None — plan executed exactly as written. TypeScript compiled without errors.

## Known Stubs

- **QR placeholder** (`src/app/[locale]/book/confirmation/[id]/page.tsx`, lines 195-212): Static text "Payment QR will appear here once payment details are ready." This is intentional — the QR placeholder is a Phase 3 deliverable per the plan spec. Real PromptPay QR generation is scheduled for Phase 4.

## Status

**PARTIAL — Task 2 (Visual verification of complete booking flow) is a `checkpoint:human-verify` gate.**

Human verification is required before this plan can be marked fully complete.

## Self-Check: PASSED

- `src/app/[locale]/book/confirmation/[id]/page.tsx`: FOUND
- `src/components/layout/StickyMandateBar.tsx`: FOUND (modified)
- Commit `f1f5dd7`: FOUND

*Phase: 03-booking-core*
*Completed (partial): 2026-03-23*
