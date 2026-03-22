# Phase 2: Authentication - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Clients can create accounts and stay logged in via Google or Facebook SSO; the admin route is protected from non-owners. This phase delivers auth infrastructure and a minimal /book page stub — the full booking wizard is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Login UI placement
- **D-01:** Auth only triggers when a client tries to book — no sign-in entry point in the header while logged out
- **D-02:** Auth appears as a step inside the booking wizard: "Step 3: Sign in to continue" with Google and Facebook SSO buttons
- **D-03:** Phase 2 creates a minimal `/[locale]/book` page stub with just the sign-in step — Phase 3 builds the full wizard around it
- **D-04:** No standalone `/sign-in` or `/login` route; auth is entirely contained in the /book flow

### Post-login destination
- **D-05:** After successful SSO (Google or Facebook), the callback redirects to `/[locale]/book` so the client immediately continues their booking

### Admin identification and protection
- **D-06:** Owner is identified by `ADMIN_EMAIL` environment variable — server checks `session.user.email === process.env.ADMIN_EMAIL`
- **D-07:** No role column on users table; no DB changes needed for admin identification
- **D-08:** Unauthorized access to any `/[locale]/admin/*` route redirects to `/[locale]/book` — silent redirect, no 403 page

### Authenticated header UI
- **D-09:** When logged in: show user's SSO profile photo as a small avatar circle in the header (top-right, after TH|EN toggle)
- **D-10:** Tapping/clicking the avatar directly signs the user out — no dropdown, no confirmation
- **D-11:** When logged out: header is identical to Phase 1 — no sign-in button, no changes
- **D-12:** Avatar renders as a small circle (`<img>` from session `user.image`); fallback to a generic person icon if no profile photo

### Better Auth wiring
- **D-13:** Better Auth mounts at `/api/auth/[...all]/route.ts` — standard Next.js App Router handler
- **D-14:** `src/proxy.ts` must be updated to chain next-intl middleware with Better Auth's `toNextJsHandler` for auth callback routes
- **D-15:** Better Auth session tables (`accounts`, `sessions`, `verifications`) added to Drizzle schema and migrated to Supabase

### Claude's Discretion
- Exact Better Auth config structure (`auth.ts` file location)
- Google and Facebook OAuth app configuration steps (documented in task but not locked here)
- Session cookie settings (Better Auth defaults are fine)
- Avatar image size and styling specifics

</decisions>

<specifics>
## Specific Ideas

- The booking flow is the primary auth trigger — clients who just browse (portfolio, services, about) never see a sign-in prompt
- Phase 3 picks up the /book stub and adds the full service→date→time wizard around the sign-in step
- The StickyMandateBar "Book Now" CTA (currently linking to `#`) will link to `/[locale]/book` once Phase 3 builds it out

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth stack
- `CLAUDE.md` §Authentication — Better Auth 1.5.x, Next.js App Router integration, `auth.api.getSession()` usage
- `CLAUDE.md` §What NOT to Use — Auth.js/NextAuth is explicitly banned; LINE Login is v2 only
- `CLAUDE.md` §Stack Patterns — Admin route protection pattern using `proxy.ts` and `auth.api.getSession()`

### Existing code to integrate with
- `src/proxy.ts` — Currently only runs next-intl middleware; must be extended to handle auth callback routes
- `src/db/schema.ts` — `users` table already exists (Better Auth compatible); add `accounts`, `sessions`, `verifications` tables
- `src/app/[locale]/layout.tsx` — Root locale layout; Header lives here and needs auth state awareness

### Requirements
- `.planning/REQUIREMENTS.md` §Authentication — AUTH-01 through AUTH-04, ADMIN-06
- `.planning/ROADMAP.md` §Phase 2 — 5 success criteria (sign-in with Google, sign-in with Facebook, session persists, booking redirect, admin protection)

### Prior phase decisions
- `.planning/STATE.md` §Accumulated Context — Key decisions from Phase 1 (proxy.ts convention, Drizzle session-mode, i18n routing)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/dialog.tsx` — shadcn Dialog component; could be used for sign-in overlay if design changes in Phase 3
- `src/components/layout/Header.tsx` — Client Component; avatar state can be added here with a session hook
- `src/db/index.ts` — Lazy DB proxy; Drizzle instance already configured for Supabase session-mode

### Established Patterns
- `src/proxy.ts` — Next.js 16 convention uses proxy.ts, NOT middleware.ts; any auth middleware must follow this pattern
- `app/[locale]/` routing — All pages live under locale prefix; `/book` page is `/app/[locale]/book/page.tsx`
- Client Components — Header is already a Client Component; session state fits naturally here

### Integration Points
- Better Auth `accounts`/`sessions`/`verifications` tables join to the existing `users` table via `userId`
- `bookings.userId` FK (in schema.ts) connects to `users.id` — booking submission in Phase 3 will read the current session's userId
- The `/book` stub created here is the entry point Phase 3 expands into the full booking wizard

</code_context>

<deferred>
## Deferred Ideas

- LINE Login (AUTH-LINE) — explicitly v2; noted in CLAUDE.md §What NOT to Use
- Sign-in button in header when logged out — user chose not to add this; auth stays booking-flow-only
- Confirmation prompt before sign-out — "Are you sure?" skipped for simplicity

</deferred>

---

*Phase: 02-authentication*
*Context gathered: 2026-03-22*
