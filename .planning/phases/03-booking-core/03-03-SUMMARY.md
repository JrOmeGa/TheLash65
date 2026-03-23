---
phase: 03-booking-core
plan: 03
subsystem: admin-ui
tags: [react-hook-form, next-intl, server-actions, lucide-react, admin, schedule]

requires:
  - phase: 03-booking-core
    plan: 01
    provides: upsertScheduleRules, blockDate, unblockDate, getScheduleData Server Actions, generateSlotsForDate slot engine

provides:
  - Admin schedule page at /admin/schedule (Server Component, fetches rules + exceptions)
  - WeeklyHoursForm: 7-row weekly hours table with toggles, time inputs, react-hook-form
  - BlockDateForm: date picker + block button + blocked date chip list with inline unblock confirmation
  - Nav link from admin dashboard to /admin/schedule
  - ADMIN-04 + ADMIN-05 behavioral tests (4 passing)

affects: [03-04, admin-dashboard, slot-engine-integration]

tech-stack:
  added: []
  patterns:
    - useParams() used in Client Component to obtain locale — no prop drilling for locale
    - Date objects serialized to ISO strings before crossing server/client boundary
    - Optimistic UI update for blocked dates + router.refresh() for server sync
    - Inline confirmation pattern (no modal) for destructive admin actions
    - slotDurationMinutes fixed at 120 as constant — not a form field (D-05)
    - Custom toggle built as button with role="switch" — no new shadcn import needed

key-files:
  created:
    - src/app/[locale]/admin/schedule/page.tsx
    - src/app/[locale]/admin/schedule/_components/WeeklyHoursForm.tsx
    - src/app/[locale]/admin/schedule/_components/BlockDateForm.tsx
    - tests/unit/schedule.test.ts
  modified:
    - src/app/[locale]/admin/page.tsx

key-decisions:
  - "Custom toggle (role=switch, button) used instead of new shadcn import — matches UI-SPEC track/thumb spec without adding a dependency"
  - "useParams() in BlockDateForm for locale access — avoids adding locale to BlockDateFormProps per plan spec"
  - "Optimistic UI update in BlockDateForm: adds new exception to local state + router.refresh() — prevents stale UI on slow connections"

requirements-completed: [ADMIN-04, ADMIN-05]

duration: 2min
completed: 2026-03-23
---

# Phase 03 Plan 03: Admin Schedule Management UI Summary

**Admin schedule page with 7-row weekly hours form, toggle per day, date blocking with removable chips and inline unblock confirmation — all wired to Plan 01 Server Actions**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-23T06:44:31Z
- **Completed:** 2026-03-23T06:46:52Z
- **Tasks:** 2 completed
- **Files modified:** 5

## Accomplishments

- Admin dashboard (`/admin`) updated with nav link to `/admin/schedule` (data-testid="admin-schedule-link")
- Schedule page (Server Component) fetches `rules` and `exceptions` via `getScheduleData`, serializes Date fields to ISO strings for client boundary, renders WeeklyHoursForm + BlockDateForm
- WeeklyHoursForm: 7 rows (Mon=1...Sat=6, Sun=0), custom toggle with `#755944` on-state and `surface-container-low` off-state, `type="time"` inputs, `opacity-50 pointer-events-none` when day is off, `slotDurationMinutes: 120` hardcoded (D-05), react-hook-form `useForm`, success/error toast via `role="alert"` div
- BlockDateForm: `type="date"` input, `blockDate` Server Action on block, chips with `rgba(185,28,28,0.08)` background and `#b91c1c` text, `X` lucide icon, inline unblock confirmation (no modal) with destructive "Yes, unblock" + ghost "Cancel" buttons, `unblockDate` Server Action on confirm
- Behavioral tests: 4 tests covering ADMIN-04 (upsert produces slots when active, zero when undefined) and ADMIN-05 (blocked date returns zero slots, unblocked date still produces slots) — all green

## Task Commits

1. **Task 1: Admin schedule page + WeeklyHoursForm + behavioral tests** — `cef8844` (feat)
2. **Task 2: BlockDateForm — date blocking and unblocking** — `cde55bb` (feat)

## Files Created/Modified

- `src/app/[locale]/admin/page.tsx` — Added getTranslations import, nav link to /admin/schedule with data-testid
- `src/app/[locale]/admin/schedule/page.tsx` — Server Component: getScheduleData, serializes dates, renders WeeklyHoursForm + BlockDateForm
- `src/app/[locale]/admin/schedule/_components/WeeklyHoursForm.tsx` — 7-row react-hook-form with custom toggle, time inputs, upsertScheduleRules submit handler, toast
- `src/app/[locale]/admin/schedule/_components/BlockDateForm.tsx` — Date picker, blockDate/unblockDate actions, chips with inline confirm, useParams() for locale, formatDateGregorian
- `tests/unit/schedule.test.ts` — 4 behavioral tests: ADMIN-04 (active rule produces slots, undefined rule produces zero) and ADMIN-05 (blocked date zero slots, unblocked date produces slots)

## Decisions Made

- Custom toggle built with `role="switch"` button — satisfies UI-SPEC `#755944` track spec without adding a new shadcn component import
- `useParams()` from `next/navigation` used in BlockDateForm to obtain locale — plan explicitly required this over a prop
- Optimistic update in BlockDateForm: new exception added to local state immediately on success + `router.refresh()` triggers server re-fetch to sync real IDs

## Deviations from Plan

None — plan executed exactly as written. TypeScript compiled without errors on first attempt.

## Known Stubs

None — all wired to Plan 01 Server Actions. The admin schedule page is fully functional once `ADMIN_EMAIL` env var is set and Supabase is connected.

## Self-Check: PASSED

All files verified present. All commits verified in git log.

*Phase: 03-booking-core*
*Completed: 2026-03-23*
