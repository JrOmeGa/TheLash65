---
phase: 01-foundation
plan: "02"
subsystem: database, testing
tags: [drizzle, postgres, supabase, vitest, playwright, i18n, date-formatting]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js 16 project scaffold, next-intl routing, src/ structure, package.json with all dependencies

provides:
  - Drizzle ORM schema with all 5 v1 tables (users, services, bookings, scheduleRules, scheduleExceptions)
  - Drizzle DB connection singleton configured for Supabase session-mode
  - drizzle.config.ts for drizzle-kit push/migrate commands
  - Seed script with 3 placeholder services (Classic, Hybrid, Volume)
  - formatDateGregorian utility enforcing Gregorian calendar for Thai locale (D-18)
  - Playwright E2E config targeting Mobile Chrome (Pixel 5)
  - Vitest unit test config with @ alias
  - 5 E2E test stubs covering SITE-01 through SITE-04 and I18N-01/02
  - Passing unit tests for I18N-03 Gregorian date guard

affects: [01-03, 01-04, 02-booking, 03-admin, all future phases using db or test infra]

# Tech tracking
tech-stack:
  added:
    - drizzle-orm (schema, db connection — was installed, now wired)
    - drizzle-kit (config for push/migrate commands)
    - postgres (postgres.js client)
    - vitest (unit test runner)
    - "@playwright/test" (E2E test runner, Chromium installed)
    - "@vitejs/plugin-react" (vitest plugin)
  patterns:
    - Drizzle schema: pgTable with generatedAlwaysAsIdentity for integer PKs, text PK for Better Auth users
    - DB singleton: drizzle(postgres(DATABASE_URL), { schema }) — single export from src/db/index.ts
    - Date formatting: always pass calendar:'gregory' when formatting dates in Thai locale
    - Tests: Playwright E2E stubs use data-testid selectors, unit tests live in tests/unit/

key-files:
  created:
    - src/db/schema.ts
    - src/db/index.ts
    - src/db/seed.ts
    - drizzle.config.ts
    - src/lib/date-utils.ts
    - playwright.config.ts
    - vitest.config.ts
    - tests/gallery.spec.ts
    - tests/services.spec.ts
    - tests/about.spec.ts
    - tests/responsive.spec.ts
    - tests/i18n.spec.ts
    - tests/unit/date-format.test.ts
  modified: []

key-decisions:
  - "session-mode port 5432 for Supabase connection (not transaction-mode 6543) per D-22"
  - "generatedAlwaysAsIdentity() used for integer PKs (native Postgres identity columns, Drizzle 0.45+)"
  - "Playwright targets only Mobile Chrome (Pixel 5) — mobile-first testing matches D-01/D-08"
  - "E2E tests are stubs that will fail until pages are built in Plans 03 and 04"
  - "Unit test for Gregorian date guard runs green immediately — formatDateGregorian utility works"

patterns-established:
  - "Pattern: All db imports go through src/db/index.ts (never import drizzle directly)"
  - "Pattern: Test data-testid selectors are defined here — pages in Plans 03/04 must implement them"
  - "Pattern: formatDateGregorian is the only date formatting utility — never use Intl.DateTimeFormat directly"

requirements-completed:
  - I18N-03

# Metrics
duration: 3min
completed: "2026-03-22"
---

# Phase 01 Plan 02: Database Schema, Seed, and Test Infrastructure Summary

**Drizzle ORM schema (5 tables + enum) with Supabase session-mode connection, 3-service seed, Gregorian date guard utility, and Playwright/Vitest test infrastructure with passing I18N-03 unit tests.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T13:32:45Z
- **Completed:** 2026-03-22T13:35:46Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Drizzle ORM schema defining all 5 v1 tables in a single file — users (Better Auth compatible), services, bookings (with indexes), scheduleRules, and scheduleExceptions — plus `bookingStatusEnum`
- DB connection singleton using postgres.js with session-mode port 5432 per D-22; seed script with 3 services at 800/1100/1400 THB ready to run once Supabase project is configured
- Test infrastructure fully operational: Playwright targeting Pixel 5 mobile viewport with dev server, Vitest with @ path alias; the I18N-03 Buddhist Era guard unit test runs green (4 tests pass)

## Task Commits

Each task was committed atomically:

1. **Task 1: Drizzle schema, DB connection, seed, date-utils** - `3f17806` (feat)
2. **Task 2: Playwright + Vitest config and test stubs** - `0643690` (feat)

## Files Created/Modified

- `src/db/schema.ts` - All 5 v1 tables + bookingStatusEnum (pgEnum), Drizzle pgTable definitions
- `src/db/index.ts` - postgres.js client + drizzle singleton; exports `db`
- `src/db/seed.ts` - Inserts Classic/Hybrid/Volume services (800/1100/1400 THB)
- `drizzle.config.ts` - Drizzle Kit config pointing to src/db/schema.ts, dialect postgresql
- `src/lib/date-utils.ts` - `formatDateGregorian()` with explicit `calendar: 'gregory'` (I18N-03)
- `playwright.config.ts` - Mobile Chrome (Pixel 5), baseURL localhost:3000, dev server integration
- `vitest.config.ts` - Unit test runner, `tests/unit/**/*.test.ts` glob, @ alias for src/
- `tests/gallery.spec.ts` - SITE-01: gallery grid + lightbox open/close
- `tests/services.spec.ts` - SITE-02: service cards + ฿ price format
- `tests/about.spec.ts` - SITE-03: about page + contact info + booking CTA
- `tests/responsive.spec.ts` - SITE-04: no horizontal scroll at 375px viewport
- `tests/i18n.spec.ts` - I18N-01/02: locale routing + TH/EN toggle
- `tests/unit/date-format.test.ts` - I18N-03: 4 passing tests verifying year 2025 (not BE 2568)

## Decisions Made

- Used `generatedAlwaysAsIdentity()` for integer PKs (native Postgres identity columns supported in Drizzle 0.45.1) rather than `serial` which is deprecated in newer Postgres
- E2E test stubs use `data-testid` selectors — Plans 03 and 04 must implement matching attributes on page components
- Vitest environment set to `node` (not `jsdom`) since `formatDateGregorian` uses `Intl.DateTimeFormat` which is available in Node.js

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

To run the seed script against Supabase, the operator must:
1. Create a Supabase project (Singapore region for Thai latency)
2. Copy the session-mode connection string (port 5432) to `.env.local` as `DATABASE_URL`
3. Run `npx drizzle-kit push` to apply the schema
4. Run `npx tsx src/db/seed.ts` to seed the 3 services

The E2E tests require the dev server (`npx next dev`) and will fail until Plans 03 and 04 implement the UI.

## Next Phase Readiness

- DB schema is complete and stable — Plans 03/04 can import from `src/db/schema.ts` immediately
- `db` singleton exported from `src/db/index.ts` ready for Server Component queries
- Test stubs define the acceptance contracts for Plans 03/04 (data-testid selectors, i18n routes)
- `formatDateGregorian` available globally in `src/lib/date-utils.ts` for any date rendering

---
*Phase: 01-foundation*
*Completed: 2026-03-22*

## Self-Check: PASSED

All 14 files verified present on disk. Both task commits (3f17806, 0643690) confirmed in git log. `npx vitest run` exits 0 (4 tests pass). `npx tsc --noEmit` exits 0.
