---
phase: 02-authentication
plan: 01
subsystem: auth
tags: [better-auth, drizzle-orm, google-oauth, facebook-oauth, next-intl, postgres]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Drizzle schema (users table), db proxy export, next-intl routing and proxy.ts, Supabase connection
provides:
  - Better Auth 1.5.x server instance with Google and Facebook social providers
  - Drizzle schema accounts, sessions, verifications tables (pushed to Supabase)
  - Auth API catch-all route at /api/auth/[...all]
  - Auth client for browser-side session reads and sign-in triggers
  - proxy.ts middleware excluding /api/* from next-intl locale rewriting
affects:
  - 02-authentication (sign-in UI, session reads, admin protection all depend on this)
  - 03-booking (booking flow requires authenticated session)

# Tech tracking
tech-stack:
  added: [better-auth@1.5.6]
  patterns:
    - drizzleAdapter with usePlural:true maps Better Auth table names to existing schema
    - Auth server instance (auth.ts) is server-only; auth client (auth-client.ts) is browser-only
    - cookieCache intentionally absent so every RSC session check hits the DB (AUTH-03)
    - proxy.ts uses explicit pathname guard over regex for /api exclusion reliability

key-files:
  created:
    - src/lib/auth.ts
    - src/lib/auth-client.ts
    - src/app/api/auth/[...all]/route.ts
  modified:
    - src/db/schema.ts
    - src/proxy.ts
    - .env.example

key-decisions:
  - "cookieCache NOT used in auth.ts — ensures sessions persist via DB lookup on every RSC request (AUTH-03)"
  - "proxy.ts uses pathname.startsWith('/api/') function guard not regex, preventing OAuth redirect_uri_mismatch"
  - "drizzleAdapter usePlural:true aligns Better Auth internal table names with existing pgTable('accounts'...) plurals"
  - "drizzle-kit push run immediately — accounts/sessions/verifications tables created in Supabase"

patterns-established:
  - "Pattern 1: Server auth via import { auth } from '@/lib/auth' — never import auth-client in server code"
  - "Pattern 2: Browser auth via import { authClient } from '@/lib/auth-client' — for useSession and signIn"
  - "Pattern 3: Session check in Server Components: auth.api.getSession(headers()) — no cookieCache"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

# Metrics
duration: 10min
completed: 2026-03-22
---

# Phase 02 Plan 01: Better Auth Infrastructure Summary

**Better Auth 1.5.x wired into Next.js 16/Drizzle/Supabase with Google+Facebook OAuth, catch-all API route, and i18n-safe proxy middleware**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-22T18:16:13Z
- **Completed:** 2026-03-22T18:26:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Better Auth 1.5.6 installed and configured with Google and Facebook social providers using drizzleAdapter on Supabase Postgres
- Three auth tables (accounts, sessions, verifications) added to Drizzle schema and pushed to Supabase
- Auth API catch-all handler mounted at /api/auth/* via toNextJsHandler, auth client available for browser sign-in
- proxy.ts updated with explicit /api/ pathname guard to prevent next-intl from rewriting OAuth callback URLs

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Better Auth and extend Drizzle schema with auth tables** - `0edc90f` (feat)
2. **Task 2: Create auth server instance, auth client, API route handler, and update proxy.ts** - `0f48d44` (feat)

## Files Created/Modified

- `src/lib/auth.ts` - Server-side Better Auth instance with drizzleAdapter, Google/Facebook providers (no cookieCache)
- `src/lib/auth-client.ts` - Browser-side auth client for useSession and signIn triggers
- `src/app/api/auth/[...all]/route.ts` - Catch-all GET/POST handler via toNextJsHandler(auth)
- `src/db/schema.ts` - Added accounts, sessions, verifications tables alongside existing tables
- `src/proxy.ts` - Chained middleware with /api/ guard preventing i18n locale rewriting on auth callbacks
- `.env.example` - Added BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_BETTER_AUTH_URL, GOOGLE/FACEBOOK OAuth vars, ADMIN_EMAIL

## Decisions Made

- cookieCache intentionally absent from auth.ts — Better Auth performs DB lookup on every session check, ensuring RSC sessions are never stale (AUTH-03 compliance)
- proxy.ts uses `pathname.startsWith('/api/')` function guard instead of regex lookahead — more reliable, prevents OAuth redirect_uri_mismatch from locale prefix injection
- drizzleAdapter configured with `usePlural: true` so Better Auth maps to existing `accounts`/`sessions`/`verifications` table names correctly
- drizzle-kit push executed immediately after schema change — auth tables live in Supabase

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

External services require manual configuration before auth flows can be tested end-to-end:

**Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET):**
- Create OAuth 2.0 Client ID (Web application) in Google Cloud Console -> APIs & Services -> Credentials
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**Facebook OAuth (FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET):**
- Create Facebook App (Consumer type) with Facebook Login product in Facebook Developer Portal
- Add Valid OAuth Redirect URI: `http://localhost:3000/api/auth/callback/facebook`

**Better Auth secret (BETTER_AUTH_SECRET):**
- Generate: `openssl rand -base64 32`

**Admin email (ADMIN_EMAIL):**
- Set to the shop owner's email address used for Google/Facebook login

Add all values to `.env.local` (copy from `.env.example` as starting point).

## Next Phase Readiness

- Auth infrastructure is complete — sign-in UI, session reads, and admin route protection can be built in Plans 02+
- All three auth tables exist in Supabase and are wired to the Drizzle schema
- Auth client ready for Client Components to call `authClient.signIn.social({ provider: 'google' })`
- Session reads in Server Components: `const session = await auth.api.getSession({ headers: await headers() })`
- Blocker for real testing: Google/Facebook OAuth credentials must be configured in .env.local (user setup above)

---
*Phase: 02-authentication*
*Completed: 2026-03-22*

## Self-Check: PASSED

- FOUND: src/lib/auth.ts
- FOUND: src/lib/auth-client.ts
- FOUND: src/app/api/auth/[...all]/route.ts
- FOUND: src/proxy.ts
- FOUND: src/db/schema.ts
- FOUND: .env.example
- FOUND commit: 0edc90f (Task 1)
- FOUND commit: 0f48d44 (Task 2)
