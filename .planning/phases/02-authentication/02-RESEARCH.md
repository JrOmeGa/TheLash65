# Phase 2: Authentication - Research

**Researched:** 2026-03-22
**Domain:** Better Auth 1.5.x, Google/Facebook OAuth, Next.js 16 proxy.ts, Drizzle schema extension
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Login UI placement**
- D-01: Auth only triggers when a client tries to book — no sign-in entry point in the header while logged out
- D-02: Auth appears as a step inside the booking wizard: "Step 3: Sign in to continue" with Google and Facebook SSO buttons
- D-03: Phase 2 creates a minimal `/[locale]/book` page stub with just the sign-in step — Phase 3 builds the full wizard around it
- D-04: No standalone `/sign-in` or `/login` route; auth is entirely contained in the /book flow

**Post-login destination**
- D-05: After successful SSO (Google or Facebook), the callback redirects to `/[locale]/book` so the client immediately continues their booking

**Admin identification and protection**
- D-06: Owner is identified by `ADMIN_EMAIL` environment variable — server checks `session.user.email === process.env.ADMIN_EMAIL`
- D-07: No role column on users table; no DB changes needed for admin identification
- D-08: Unauthorized access to any `/[locale]/admin/*` route redirects to `/[locale]/book` — silent redirect, no 403 page

**Authenticated header UI**
- D-09: When logged in: show user's SSO profile photo as a small avatar circle in the header (top-right, after TH|EN toggle)
- D-10: Tapping/clicking the avatar directly signs the user out — no dropdown, no confirmation
- D-11: When logged out: header is identical to Phase 1 — no sign-in button, no changes
- D-12: Avatar renders as a small circle (`<img>` from session `user.image`); fallback to a generic person icon if no profile photo

**Better Auth wiring**
- D-13: Better Auth mounts at `/api/auth/[...all]/route.ts` — standard Next.js App Router handler
- D-14: `src/proxy.ts` must be updated to chain next-intl middleware with Better Auth's `toNextJsHandler` for auth callback routes
- D-15: Better Auth session tables (`accounts`, `sessions`, `verifications`) added to Drizzle schema and migrated to Supabase

### Claude's Discretion
- Exact Better Auth config structure (`auth.ts` file location)
- Google and Facebook OAuth app configuration steps (documented in task but not locked here)
- Session cookie settings (Better Auth defaults are fine)
- Avatar image size and styling specifics

### Deferred Ideas (OUT OF SCOPE)
- LINE Login (AUTH-LINE) — explicitly v2; noted in CLAUDE.md §What NOT to Use
- Sign-in button in header when logged out — user chose not to add this; auth stays booking-flow-only
- Confirmation prompt before sign-out — "Are you sure?" skipped for simplicity
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Client can sign up and log in via Google SSO | Better Auth `socialProviders.google` config; `authClient.signIn.social({ provider: "google" })` client call; callback URL registration in Google Cloud Console |
| AUTH-02 | Client can sign up and log in via Facebook SSO | Better Auth `socialProviders.facebook` config; `authClient.signIn.social({ provider: "facebook" })` client call; callback URL + App Mode in Facebook Developer Portal |
| AUTH-03 | Client session persists across browser refresh | Better Auth sessions are stored in DB (`sessions` table) and restored via cookie on every request; `useSession()` hook rehydrates client state |
| AUTH-04 | Only authenticated clients can submit a booking | `/book` page checks session via `auth.api.getSession()`; unauthenticated clients see the sign-in step (they are already on /book — no redirect needed until Phase 3 submit) |
| ADMIN-06 | Admin pages are protected — only the owner can access them | Admin layout Server Component calls `auth.api.getSession()`, checks `session.user.email === process.env.ADMIN_EMAIL`, redirects to `/[locale]/book` if not the owner |
</phase_requirements>

---

## Summary

Phase 2 wires Better Auth 1.5.x into the existing Next.js 16 / Drizzle / Supabase stack. The core work is three layers: (1) schema — add three Better Auth tables (`accounts`, `sessions`, `verifications`) to `src/db/schema.ts` and push to Supabase; (2) server infrastructure — create `src/lib/auth.ts` with Google + Facebook social providers, mount the catch-all API route, and update `src/proxy.ts` to chain next-intl with auth callback routing; (3) UI — update `src/components/layout/Header.tsx` to show an avatar when a session exists, create a minimal `/[locale]/book` page stub with a sign-in step, and create a protected admin layout.

The biggest integration concern is `proxy.ts` chaining: the current file only runs next-intl middleware. Better Auth's route handler lives at `/api/auth/*` and does not need proxy-level session checks — it is the auth origin. Session checks for protected pages (admin) happen inside Server Component layouts via `auth.api.getSession({ headers: await headers() })`, not in proxy.ts. The proxy.ts only needs to exclude `/api/*` from the next-intl locale matcher so auth callbacks are not mangled by i18n rewriting.

The existing `users` table in `schema.ts` is already Better Auth-compatible (same column names and types). The Drizzle adapter's `usePlural: true` option maps Better Auth's singular model names (`user`, `session`, `account`, `verification`) to our plural table names. No rename is required.

**Primary recommendation:** Use `drizzleAdapter(db, { provider: "pg", usePlural: true })` with all four tables exported from `schema.ts`, create `src/lib/auth.ts` as the single auth instance, and protect admin routes in a Server Component layout — not in proxy.ts.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | 1.5.6 (latest on npm 2026-03-22) | Authentication engine | Auth.js team officially migrated to Better Auth Sept 2025; first-class Next.js 16 support; built-in Google + Facebook providers; TypeScript-native |
| better-auth/adapters/drizzle | (bundled in better-auth) | Drizzle ORM database adapter | No separate package; imported from `better-auth/adapters/drizzle`; supports PostgreSQL via `provider: "pg"` |
| better-auth/next-js | (bundled in better-auth) | `toNextJsHandler` for API route | Wraps auth instance as Next.js GET/POST route handler |
| better-auth/react | (bundled in better-auth) | `createAuthClient`, `useSession` | Client-side session hook and social sign-in triggers |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/headers | (Next.js built-in) | Pass request headers to `auth.api.getSession()` | Required in every Server Component or Server Action reading the session |
| next/navigation (redirect) | (Next.js built-in) | Redirect unauthenticated users | Used inside admin layout and /book page auth check |
| zod | 4.3.6 (already installed) | Validate `ADMIN_EMAIL` env var at startup | Catch misconfiguration early |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `auth.api.getSession()` in admin layout | `getSessionCookie()` check in proxy.ts | Cookie-only check is faster but bypassed by forged cookies; layout check queries DB — use layout check for admin |
| `usePlural: true` Drizzle adapter | Manual schema mapping | `usePlural` is one line vs mapping every table name individually |

**Installation:**
```bash
npm install better-auth
```

**Version verification (confirmed 2026-03-22):**
```bash
npm view better-auth version
# 1.5.6
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── auth.ts           # Better Auth instance (server-only)
│   └── auth-client.ts    # Better Auth client (browser-only)
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts   # Catch-all auth handler
│   └── [locale]/
│       ├── book/
│       │   └── page.tsx        # Booking stub with sign-in step (Phase 2 stub)
│       └── admin/
│           ├── layout.tsx      # Protected admin layout (session gate)
│           └── page.tsx        # Admin dashboard placeholder
├── components/
│   └── layout/
│       └── Header.tsx          # Extended with avatar (Client Component)
├── db/
│   └── schema.ts               # Add accounts, sessions, verifications tables
└── proxy.ts                    # Chain next-intl + exclude /api/* from i18n
```

### Pattern 1: Auth Instance (src/lib/auth.ts)

**What:** Single server-side Better Auth instance with Drizzle adapter and social providers.
**When to use:** Import in API route handler and in Server Components via `auth.api.getSession()`.

```typescript
// Source: https://better-auth.com/docs/installation + https://better-auth.com/docs/adapters/drizzle
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,    // maps user→users, session→sessions, etc.
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
});
```

### Pattern 2: API Route Handler (app/api/auth/[...all]/route.ts)

**What:** Mounts Better Auth at `/api/auth/*` for all OAuth callbacks and session endpoints.
**When to use:** Create once; do not add any application logic here.

```typescript
// Source: https://better-auth.com/docs/installation
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### Pattern 3: Auth Client (src/lib/auth-client.ts)

**What:** Client-side auth instance for triggering SSO flows and reading session state.
**When to use:** Import only in Client Components (`"use client"`).

```typescript
// Source: https://better-auth.com/docs/installation
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});
```

### Pattern 4: Social Sign-In Button (Client Component)

**What:** Triggers Google or Facebook OAuth flow with a post-auth redirect to `/[locale]/book`.
**When to use:** Inside the `/book` stub sign-in step component.

```typescript
// Source: https://better-auth.com/docs/adapters/drizzle (client usage section)
"use client";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "next-intl";

export function SignInButtons() {
  const locale = useLocale();
  const callbackURL = `/${locale}/book`;

  return (
    <>
      <button onClick={() => authClient.signIn.social({ provider: "google", callbackURL })}>
        Continue with Google
      </button>
      <button onClick={() => authClient.signIn.social({ provider: "facebook", callbackURL })}>
        Continue with Facebook
      </button>
    </>
  );
}
```

### Pattern 5: Session Check in Server Component (Admin Layout)

**What:** Gate admin routes in layout.tsx — check session + email against ADMIN_EMAIL.
**When to use:** `src/app/[locale]/admin/layout.tsx` — runs on every admin page request.

```typescript
// Source: https://better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect(`/${locale}/book`);
  }

  return <>{children}</>;
}
```

### Pattern 6: Avatar in Header (Client Component)

**What:** Reads session client-side via `useSession()`; shows avatar or nothing.
**When to use:** Extend existing `src/components/layout/Header.tsx`.

```typescript
// Source: https://better-auth.com/docs/integrations/next (useSession pattern)
"use client";
import { authClient } from "@/lib/auth-client";

export function UserAvatar() {
  const { data: session } = authClient.useSession();
  if (!session) return null;

  return (
    <button
      onClick={() => authClient.signOut()}
      className="w-8 h-8 rounded-full overflow-hidden"
      aria-label="Sign out"
    >
      {session.user.image ? (
        <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
      ) : (
        // Fallback generic person icon (inline SVG or lucide PersonIcon)
        <span className="w-full h-full flex items-center justify-center bg-[#755944] text-white text-xs">
          {session.user.name?.[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </button>
  );
}
```

### Pattern 7: proxy.ts — Chain next-intl, Exclude /api from i18n

**What:** Current proxy.ts only runs next-intl. Auth callbacks at `/api/auth/*` must NOT be rewritten by next-intl locale routing.
**When to use:** Update existing `src/proxy.ts`.

```typescript
// Source: https://better-auth.com/docs/integrations/next + existing proxy.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Skip i18n middleware for API routes (auth callbacks, etc.)
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/')) {
    return; // pass through
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!_next|_vercel|.*\\..*).*)',
};
```

**Note:** The existing `config.matcher` already excludes `/api` if it contains a dot (static files), but it does NOT explicitly exclude `/api/auth/*` path segments without dots. The explicit `pathname.startsWith('/api/')` guard is required to prevent next-intl from prepending `/th/api/auth/callback/google`.

### Pattern 8: Drizzle Schema Extensions

**What:** Three new tables alongside the existing `users` table. All use `text` IDs (matching Better Auth's string ID convention).
**When to use:** Add to `src/db/schema.ts`.

```typescript
// Source: https://better-auth.com/docs/concepts/database (column definitions)
// accounts table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// sessions table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// verifications table
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Anti-Patterns to Avoid

- **Auth checks in proxy.ts for admin:** Do not do `auth.api.getSession()` inside `proxy.ts` for admin page protection. Use Server Component layout.tsx instead. Proxy-level DB calls add latency on every non-admin request due to broad matchers.
- **Importing `src/lib/auth.ts` in a Client Component:** The auth instance uses server-only imports (postgres driver). Always import `auth-client.ts` in client components.
- **Using `redirect()` inside try/catch in Next.js:** `redirect()` throws internally — do not wrap it in try/catch or it will be silently swallowed.
- **Hardcoding callbackURL as `/book` without locale prefix:** After SSO, Better Auth redirects to the literal `callbackURL`. Pass `/${locale}/book` — not `/book` — to land on the correct locale route.
- **`BETTER_AUTH_URL` pointing to localhost in production:** Must be the Vercel deployment URL in production. Use `process.env.BETTER_AUTH_URL` — never hardcode.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth CSRF state validation | Custom state parameter generation + verification | Better Auth's social provider flow | OAuth CSRF is easy to get wrong; state must be tied to session, validated server-side |
| Session token generation | `crypto.randomBytes()` + DB insert | Better Auth sessions | Session fixation, timing attacks, rotation on privilege change — all handled |
| Facebook/Google token exchange | Raw HTTP POST to token endpoint | Better Auth social provider | Token endpoint URLs change; error handling for revoked tokens is complex |
| Cookie signing/encryption | `crypto.createHmac()` + base64 | Better Auth session cookies | SameSite, Secure, HttpOnly, domain scoping all handled with correct defaults |
| Admin role check custom DB column | `users.role` column + migration | `session.user.email === process.env.ADMIN_EMAIL` | The user confirmed D-07: no role column; env var check is sufficient for single-owner site |

**Key insight:** Better Auth handles all OAuth plumbing — state, PKCE, token exchange, refresh, session rotation. The only application code needed is configuration and consuming the session object.

---

## Common Pitfalls

### Pitfall 1: next-intl Mangling Auth Callback URLs

**What goes wrong:** Without guarding `/api/*` in proxy.ts, next-intl rewrites `/api/auth/callback/google` to `/th/api/auth/callback/google`. Google/Facebook reject the redirect URI because only the unlocalized version is registered in the OAuth app.

**Why it happens:** Current proxy.ts matcher `/((?!api|trpc|_next|_vercel|.*\\..*).*)` uses a negative lookahead for literal strings `api` and `trpc` at the path start. If the matcher ever changes, this breaks silently.

**How to avoid:** Add an explicit `pathname.startsWith('/api/')` early-return guard inside `proxy()` function body (not just the matcher regex).

**Warning signs:** OAuth error "redirect_uri_mismatch" in Google/Facebook developer console.

---

### Pitfall 2: `auth.api.getSession()` Returns null With Cookie Cache

**What goes wrong:** In some Next.js 16 configurations with React cache, `auth.api.getSession()` returns `null` even when the user is authenticated.

**Why it happens:** RSCs cannot write cookies. If Better Auth tries to refresh the session cookie inside a cached Server Component, it silently fails.

**How to avoid:** Do NOT enable `cookieCache: true` in Better Auth config for this project. Use the default cookie behavior. The session is read-only inside RSCs — only Server Actions and Route Handlers can set cookies.

**Warning signs:** Session is null on first load but appears after client-side navigation.

---

### Pitfall 3: `usePlural: true` Double-Pluralizes Custom Table Names

**What goes wrong:** If you add a table name that is already plural to `modelName` (e.g., `modelName: "sessions"`), the adapter pluralizes it again to `sessionss`.

**Why it happens:** `usePlural` appends `s` to Better Auth's internal singular model names before looking up schema tables.

**How to avoid:** Export all tables from `schema.ts` using the exact plural names (`accounts`, `sessions`, `verifications`, `users`). Pass `schema` directly to `drizzleAdapter`. Do not set `modelName` for these tables.

**Warning signs:** Database error `relation "sessionss" does not exist`.

---

### Pitfall 4: BETTER_AUTH_URL Missing in Production

**What goes wrong:** Redirect URIs constructed by Better Auth use the wrong base URL, causing OAuth flows to fail in production even though they work locally.

**Why it happens:** Better Auth uses `baseURL` to construct callback URLs. If unset, it infers from the request host, which on Vercel may be the internal preview URL instead of the custom domain.

**How to avoid:** Set `BETTER_AUTH_URL` in Vercel environment variables to the canonical production domain (`https://yourdomain.com`). Also add `NEXT_PUBLIC_BETTER_AUTH_URL` for the auth client.

**Warning signs:** Works on localhost; OAuth returns "redirect_uri_mismatch" after Vercel deployment.

---

### Pitfall 5: Facebook App in Development Mode

**What goes wrong:** Facebook OAuth works for the developer account but fails for real clients with "App not live" error.

**Why it happens:** Facebook apps start in Development Mode. Only the app's admin/developer accounts can authenticate. Public users get blocked until the app is switched to Live mode.

**How to avoid:** After configuring the Facebook app, navigate to App Settings and toggle the app to Live mode before testing with real users. This requires accepting Facebook Platform Policies.

**Warning signs:** Developer can sign in but testers/real clients get "This app is not available to the public yet."

---

### Pitfall 6: `redirect()` Swallowed in try/catch

**What goes wrong:** Admin layout protection silently fails to redirect.

**Why it happens:** In Next.js App Router, `redirect()` from `next/navigation` works by throwing a special `NEXT_REDIRECT` error internally. If the call is wrapped in try/catch (common when also running async DB/session code), the catch block intercepts the redirect error.

**How to avoid:** Call `redirect()` outside of try/catch. Read the session first, then call redirect after the await, in the component's main execution path.

---

## Code Examples

Verified patterns from official sources:

### Session in Server Component
```typescript
// Source: https://better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <div>Not authenticated</div>;
  return <div>Welcome {session.user.name}</div>;
}
```

### Social Sign-Out (Client)
```typescript
// Source: https://better-auth.com/docs/integrations/next
"use client";
import { authClient } from "@/lib/auth-client";

// Direct sign-out on avatar click (D-10: no confirmation)
<button onClick={() => authClient.signOut()}>
  <img src={session.user.image} />
</button>
```

### OAuth Callback URLs to Register
```
# Google Cloud Console — OAuth 2.0 Credentials — Authorized redirect URIs:
http://localhost:3000/api/auth/callback/google
https://[your-production-domain]/api/auth/callback/google

# Facebook Developer Portal — Valid OAuth Redirect URIs:
http://localhost:3000/api/auth/callback/facebook
https://[your-production-domain]/api/auth/callback/facebook
```

### Environment Variables Required (.env.local)
```
BETTER_AUTH_SECRET=[32+ character random string]
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
ADMIN_EMAIL=owner@example.com
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auth.js / NextAuth.js | Better Auth | Sept 22, 2025 (Auth.js team joined Better Auth) | New projects start on Better Auth; Auth.js only gets security patches |
| `middleware.ts` | `proxy.ts` | Next.js 16 (Oct 2025) | All middleware logic moves to proxy.ts; existing patterns using middleware.ts need renaming |
| LINE Notify | @line/bot-sdk Messaging API | March 31, 2025 | LINE Notify terminated; all push notification tutorials using it are invalid |

**Deprecated/outdated:**
- Auth.js `pages/api/auth/[...nextauth].js` pattern: Pages Router pattern; incompatible with App Router
- `getServerSession()` from next-auth: Replaced by `auth.api.getSession()` in Better Auth
- `authOptions` export pattern: NextAuth concept; does not exist in Better Auth

---

## Open Questions

1. **Facebook Business Verification for Live Mode**
   - What we know: Facebook apps in Development Mode block public users. Switching to Live mode requires accepting Platform Policies.
   - What's unclear: Whether Facebook requires Business Verification (submitting company documents) for a simple OAuth login app, or if accepting policies is sufficient for a solo operator.
   - Recommendation: Test with Facebook app in Live mode after accepting policies. Business Verification is typically required only for advanced permissions (e.g., `user_friends`). Email + public_profile should be available without it.

2. **Session cookie behavior across `/th/` and `/en/` paths**
   - What we know: Better Auth sets a session cookie at path `/` by default, which covers all locale subpaths.
   - What's unclear: Whether any next-intl locale rewriting could interfere with cookie domain/path scope.
   - Recommendation: Test sign-in on `/th/book` and verify `useSession()` still returns the session on `/en/book` without re-authenticating. Expected to work given cookie path is `/`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) + Vitest (unit) — already configured |
| Config file | `playwright.config.ts` + `vitest.config.ts` — already exist |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx playwright test && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Google SSO button renders on /book stub | E2E smoke | `npx playwright test tests/auth.spec.ts` | ❌ Wave 0 |
| AUTH-01 | Unauthenticated /book shows sign-in step (not empty) | E2E smoke | `npx playwright test tests/auth.spec.ts` | ❌ Wave 0 |
| AUTH-02 | Facebook SSO button renders on /book stub | E2E smoke | `npx playwright test tests/auth.spec.ts` | ❌ Wave 0 |
| AUTH-03 | Session persists across page refresh (localStorage/cookie check) | E2E | Manual-only (requires live OAuth credentials) | N/A |
| AUTH-04 | Unauthenticated user sees sign-in step on /book | E2E smoke | `npx playwright test tests/auth.spec.ts` | ❌ Wave 0 |
| ADMIN-06 | GET /th/admin without session redirects to /th/book | E2E | `npx playwright test tests/admin-protection.spec.ts` | ❌ Wave 0 |
| ADMIN-06 | Admin page content never renders for unauthenticated user | E2E | `npx playwright test tests/admin-protection.spec.ts` | ❌ Wave 0 |

**Manual-only items (cannot be automated without live OAuth):**
- Full Google OAuth round-trip (requires real Google credentials in test env)
- Full Facebook OAuth round-trip (requires real Facebook credentials in test env)
- Session persistence across browser tab close/reopen (requires headful Playwright or real browser)

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx playwright test && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/auth.spec.ts` — covers AUTH-01, AUTH-02, AUTH-04 (sign-in UI renders, buttons present)
- [ ] `tests/admin-protection.spec.ts` — covers ADMIN-06 (unauthenticated admin redirect)
- [ ] No framework install needed — Playwright + Vitest already in devDependencies and configured

---

## Sources

### Primary (HIGH confidence)
- https://better-auth.com/docs/installation — Auth instance setup, API route handler, client creation
- https://better-auth.com/docs/adapters/drizzle — Drizzle adapter config, `usePlural`, schema mapping
- https://better-auth.com/docs/authentication/google — Google provider config, callback URL format
- https://better-auth.com/docs/authentication/facebook — Facebook provider config, scope defaults
- https://better-auth.com/docs/integrations/next — proxy.ts chaining, `auth.api.getSession()`, admin layout pattern, `useSession` hook
- https://better-auth.com/docs/concepts/database — Exact column definitions for all four auth tables
- `CLAUDE.md` §Authentication — Better Auth 1.5.x stack decision, Admin route protection pattern
- `CLAUDE.md` §What NOT to Use — Auth.js/NextAuth banned, LINE Notify terminated

### Secondary (MEDIUM confidence)
- https://www.buildwithmatija.com/blog/nextjs16-middleware-change — proxy.ts rename context in Next.js 16
- https://github.com/better-auth/better-auth/issues/7008 — `getSession` null with cookie cache; confirms avoiding `cookieCache: true`
- https://github.com/better-auth/better-auth/issues/3069 — `usePlural` double-pluralization edge case

### Tertiary (LOW confidence)
- None — all critical claims verified against official Better Auth docs or existing project CLAUDE.md

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — better-auth 1.5.6 verified via `npm view`; all adapter imports verified in official docs
- Architecture: HIGH — patterns taken directly from https://better-auth.com/docs/integrations/next
- Drizzle schema extensions: HIGH — column definitions from official database concepts page
- Pitfalls: MEDIUM-HIGH — Pitfalls 1/4/5/6 verified from official docs + known Next.js behavior; Pitfalls 2/3 from verified GitHub issues
- Facebook Live Mode: MEDIUM — general OAuth knowledge; exact Facebook policy requirements not verified against current Facebook developer docs

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (Better Auth is actively maintained; check release notes if >30 days old)
