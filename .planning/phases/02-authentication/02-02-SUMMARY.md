---
phase: 02-authentication
plan: 02
subsystem: auth
tags: [better-auth, next-intl, google-oauth, facebook-oauth, lucide-react, playwright, admin-protection]

# Dependency graph
requires:
  - phase: 02-authentication
    provides: Better Auth server instance, auth-client for browser, Google+Facebook providers, session check pattern
  - phase: 01-foundation
    provides: next-intl routing, Header component, layout structure, proxy.ts middleware

provides:
  - Booking page stub at /[locale]/book with Google+Facebook sign-in buttons for unauthenticated users
  - SignInButtons Client Component using authClient.signIn.social with locale-aware callbackURL
  - Header UserAvatar showing after LocaleSwitcher when session active; tapping signs out and calls router.refresh()
  - Admin layout session gate comparing session.user.email to ADMIN_EMAIL env var
  - Admin placeholder page at /[locale]/admin for Phase 6 dashboard
  - E2E test coverage for sign-in UI rendering and admin route protection (both locales)

affects:
  - 03-booking (booking page stub will be replaced by full wizard; session-gated flow)
  - 06-admin-dashboard (admin placeholder page wires into admin layout gate)

# Tech tracking
tech-stack:
  added: [lucide-react]
  patterns:
    - UserAvatar Client Component in Header — reads session via authClient.useSession(), signs out and calls router.refresh() to force RSC revalidation
    - Admin route protection via Server Component layout — auth.api.getSession() + process.env.ADMIN_EMAIL comparison + redirect()
    - redirect() in layout NOT inside try/catch — Next.js throws internally, wrapping suppresses it
    - Booking page stub pattern — Server Component checks session, renders SignInButtons or welcome message
    - locale-aware callbackURL in SSO triggers: `/${locale}/book` via useLocale()

key-files:
  created:
    - src/components/auth/SignInButtons.tsx
    - src/app/[locale]/book/page.tsx
    - src/app/[locale]/admin/layout.tsx
    - src/app/[locale]/admin/page.tsx
    - tests/auth.spec.ts
    - tests/admin-protection.spec.ts
  modified:
    - src/components/layout/Header.tsx
    - messages/en.json
    - messages/th.json
    - package.json

key-decisions:
  - "UserAvatar placed in Header right-side div (after LocaleSwitcher) — visible on all screen sizes, no MobileDrawer modification needed"
  - "lucide-react installed as dependency — required by plan for User icon fallback, was missing from project"
  - "Admin layout redirect not in try/catch — Next.js redirect() throws NEXT_REDIRECT internally; catch blocks absorb the throw and break redirection"

patterns-established:
  - "Pattern 4: Admin protection via layout — auth.api.getSession() + ADMIN_EMAIL check + redirect() in Server Component layout, not middleware"
  - "Pattern 5: SSO with locale-aware callback — useLocale() in Client Component to build /${locale}/book callbackURL"
  - "Pattern 6: Session-conditioned booking page — Server Component auth check renders sign-in step or welcome message"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, ADMIN-06]

# Metrics
duration: 3min
completed: 2026-03-22
---

# Phase 02 Plan 02: Auth UI and Admin Protection Summary

**Booking stub page with Google+Facebook SSO buttons, Header avatar with sign-out, and admin route protection via ADMIN_EMAIL env var check**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-22T18:21:08Z
- **Completed:** 2026-03-22T18:24:05Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Booking page at /[locale]/book shows Google+Facebook sign-in buttons for unauthenticated users; shows welcome message after SSO
- Header UserAvatar appears after LocaleSwitcher when signed in; tapping calls signOut then router.refresh() to unmount without manual reload
- Admin layout gates all /[locale]/admin/* routes by checking session.user.email against ADMIN_EMAIL env var; unauthorized redirected silently to /book
- E2E test files created for sign-in UI visibility and admin redirect behavior on both locales

## Task Commits

Each task was committed atomically:

1. **Task 1: Create sign-in buttons component and booking page stub** - `8725083` (feat)
2. **Task 2: Update Header with user avatar and sign-out behavior** - `5e367ae` (feat)
3. **Task 3: Create admin layout with session gate and E2E test files** - `7f0a649` (feat)

## Files Created/Modified

- `src/components/auth/SignInButtons.tsx` - Client Component with Google/Facebook OAuth buttons, locale-aware callbackURL
- `src/app/[locale]/book/page.tsx` - Server Component booking stub: auth check, sign-in step or welcome message
- `src/components/layout/Header.tsx` - Added UserAvatar component (useSession, signOut, router.refresh, lucide User fallback)
- `src/app/[locale]/admin/layout.tsx` - Server Component layout gate checking ADMIN_EMAIL, redirect to /book
- `src/app/[locale]/admin/page.tsx` - Admin placeholder page with admin-dashboard testid for Phase 6
- `tests/auth.spec.ts` - E2E tests for sign-in UI on /th/book and /en/book (AUTH-01, AUTH-02, AUTH-04)
- `tests/admin-protection.spec.ts` - E2E tests for admin route redirect on both locales (ADMIN-06)
- `messages/en.json` - Added "auth" section with 7 keys
- `messages/th.json` - Added "auth" section with 7 keys in Thai
- `package.json` / `package-lock.json` - Added lucide-react dependency

## Decisions Made

- UserAvatar added in the Header's right-side div (visible on all screen widths) rather than inside MobileDrawer — MobileDrawer is a self-contained component for the slide-up nav sheet; the Header bar is always present on both mobile and desktop
- lucide-react not in project dependencies; installed it as a Rule 3 auto-fix since it was blocking Task 2 TypeScript compilation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing lucide-react dependency**
- **Found during:** Task 2 (Header UserAvatar implementation)
- **Issue:** `lucide-react` was specified in the plan for the `User` icon fallback but was not installed in the project
- **Fix:** Ran `npm install lucide-react`
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx tsc --noEmit` passes after install
- **Committed in:** `5e367ae` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking dependency)
**Impact on plan:** Required for implementation. No scope creep.

## Issues Encountered

None.

## Known Stubs

- `src/app/[locale]/book/page.tsx` line 33: `{t("comingSoon")}` placeholder shown to authenticated users — intentional. Phase 3 will replace with the full booking wizard. Authenticated users see a "coming soon" message until the booking form is built.
- `src/app/[locale]/admin/page.tsx` line 15: Admin page shows "Dashboard content coming in Phase 6" — intentional placeholder. Phase 6 will wire the actual admin dashboard.

These stubs are intentional and do not prevent the plan's goal (auth UI and route protection) from being achieved.

## Next Phase Readiness

- Auth UI complete — /[locale]/book shows sign-in step; authenticated users will see booking wizard once Phase 3 delivers it
- Admin route protection in place — ADMIN_EMAIL env var must be set in .env.local before testing
- E2E tests ready to run against a running dev server (`npx playwright test`)
- Phase 3 (booking) can use `auth.api.getSession()` pattern established here to confirm user is authenticated before showing booking form

---
*Phase: 02-authentication*
*Completed: 2026-03-22*

## Self-Check: PASSED

- FOUND: src/components/auth/SignInButtons.tsx
- FOUND: src/app/[locale]/book/page.tsx
- FOUND: src/components/layout/Header.tsx (modified)
- FOUND: src/app/[locale]/admin/layout.tsx
- FOUND: src/app/[locale]/admin/page.tsx
- FOUND: tests/auth.spec.ts
- FOUND: tests/admin-protection.spec.ts
- FOUND: messages/en.json (modified)
- FOUND: messages/th.json (modified)
