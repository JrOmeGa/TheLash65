# Project Research Summary

**Project:** Lash extension booking website — solo technician, Thailand market
**Domain:** Mobile-first bilingual appointment booking site (Thai market, LINE + PromptPay integrations)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

This product is a mobile-first, bilingual (Thai/English) online booking site for a solo lash extension technician operating in Thailand. The core purpose is to replace manual appointment scheduling over LINE chat with a self-service web app that handles slot selection, LINE SSO authentication, PromptPay payment display, and booking management. Research consistently points to a Next.js 16 App Router + Supabase (PostgreSQL) + Better Auth stack as the correct foundation — it handles server-side rendering for mobile performance, bilingual routing via next-intl, and Thailand-specific integrations (LINE Login, LINE Messaging API, PromptPay QR) without needing a separate backend service.

The recommended approach is a phased build: establish infrastructure and public-facing content first, implement the authentication and booking core in the middle phases, and layer on notifications and the admin workflow last. Architecture research identifies a clear build order driven by hard dependencies — the database schema must precede booking logic, which must precede notifications, which must precede admin confirmation flows. The bilingual routing layer (next-intl `app/[locale]/`) must be scaffolded from day one because retrofitting i18n into an existing Next.js route structure requires significant restructuring.

Two risk categories stand out across all research files. The first is Thailand-specific integration gotchas: LINE Notify was terminated March 31, 2025 (many tutorials still reference it), LINE Login channels must be manually published before real users can authenticate, and PromptPay QR generation must happen server-side to keep the owner's phone number out of client bundles. The second is correctness risks in the booking system itself: slot reservation must use a database-level transaction with `SELECT FOR UPDATE` to prevent double bookings, and all dates must be stored in UTC Gregorian — never Buddhist Era — because Thai browser locales trigger a 543-year offset bug in JavaScript's `Intl.DateTimeFormat`.

## Key Findings

### Recommended Stack

Next.js 16 (App Router, Turbopack) with React 19.2, TypeScript 5.x, and Tailwind CSS v4 is the clear choice for this market. Better Auth 1.5.x replaces Auth.js for new projects (the Auth.js team officially moved to Better Auth in September 2025). Supabase on the Singapore region (ap-southeast-1) provides PostgreSQL, file storage, and Row Level Security with no infrastructure overhead. Drizzle ORM is preferred over Prisma because its pure-JavaScript approach avoids cold start timeouts on Vercel serverless. The full Next.js stack — Server Components for data fetching, Server Actions for mutations, and API routes only for webhook endpoints — eliminates the need for a separate backend for a solo-operator site of this scale.

For Thailand-specific integrations: `promptpay-qr` + `qrcode` handle PromptPay QR generation; `@line/bot-sdk` 10.6.x handles LINE Messaging API push notifications (LINE Notify is terminated — any reference to it in tutorials is outdated); `next-intl` 3.x/4.x handles bilingual routing with Server Component support; Resend + react-email handles transactional email. The shadcn/ui component library (copied into project, no version lock-in) provides Calendar, Dialog, Sheet, and Form components directly applicable to the booking flow.

**Core technologies:**
- Next.js 16 (App Router): full-stack framework — SSR for mobile, Server Actions for mutations, single repo
- Better Auth 1.5.x: authentication — LINE/Google/Facebook SSO, TypeScript-native, replaces Auth.js for new projects
- Supabase (PostgreSQL, ap-southeast-1): database + file storage — free tier sufficient, built-in Row Level Security
- Drizzle ORM: database access — edge-compatible, ~90% smaller bundle than Prisma, serverless cold starts under 500ms
- next-intl 3.x/4.x: i18n — App Router native, `app/[locale]/` routing, Server Component support
- @line/bot-sdk 10.6.x: LINE notifications — official SDK, handles webhook signature verification
- promptpay-qr + qrcode: PromptPay QR — de facto standard Thai library, stable EMVCo spec
- Tailwind CSS v4 + shadcn/ui: styling and UI components — CSS-first config, mobile-first utilities
- Resend + react-email: transactional email — native Next.js integration, React component email templates

### Expected Features

The feature set is well-defined. Every feature a solo Thai lash technician needs is documented; generic multi-staff or payment-gateway features are explicitly out of scope. The competitor gap is clear: Fresha/Booksy target multi-staff Western salons; GoWabi is a commission marketplace. Neither covers the solo Thai technician wanting a branded site with PromptPay QR and LINE-native notifications — that is the product's positioning.

**Must have (table stakes):**
- Service menu with prices — clients will not book without seeing what and what it costs
- Portfolio gallery — lash work is visual; new clients judge quality before booking
- Calendar-based slot selection with recurring schedule + exception blocks
- LINE Login SSO — identity gate before booking confirmation, reduces ghost bookings
- PromptPay QR at checkout — standard Thai payment method, avoids gateway fees
- Admin booking dashboard with payment confirmation
- LINE notification to owner on new booking
- LINE notification to client on payment confirmation
- Email confirmation to client (secondary channel)
- Bilingual TH/EN toggle — Thai-first, English for expats
- Mobile-first responsive design
- About + contact page

**Should have (competitive differentiators):**
- Appointment reminders via LINE (24h before) — reduces no-shows
- Client cancellation / rescheduling — reduces admin burden
- Client notes field at booking — preferences like "sensitive eyes"
- Facebook / Google SSO as alternative login options

**Defer (v2+):**
- Instagram-connected gallery auto-sync
- Booking analytics for owner
- Google Business Profile / Reserve with Google button
- Static testimonials section

### Architecture Approach

The architecture follows a layered Next.js App Router structure: public SSR pages for SEO, a booking flow mixing server-side data fetching with client-side interactivity, and a fully protected admin area. Business logic lives in pure TypeScript service modules (`lib/services/`) decoupled from React — `booking.ts`, `schedule.ts`, `notify.ts`, `promptpay.ts` — making them independently testable. All routes live under `app/[locale]/` from day one for bilingual routing. Route groups `(public)`, `(booking)`, and `(admin)` separate concerns without affecting URL structure. Mutations use Server Actions; the only API routes are the LINE webhook endpoint and the slot availability endpoint (for client-side refetch after initial render).

**Major components:**
1. Public Site (SSR Server Components) — home, gallery, services, about/contact; no auth dependency, validates i18n early
2. Booking Flow (RSC + CSR hybrid) — service selection, slot picker (Client Component), auth gate, PromptPay QR display
3. Schedule Service — recurring weekly hours + date exception blocks; source of truth for slot availability
4. Booking Service — atomic slot reservation via `$transaction` + `SELECT FOR UPDATE`; status machine: PENDING → CONFIRMED | EXPIRED | CANCELLED
5. Notify Service — fire-and-forget LINE push + email dispatch; triggered post-booking and post-confirmation
6. Admin Dashboard — protected by role middleware; pending bookings list; one-tap payment confirmation; schedule management
7. i18n Layer — next-intl middleware rewrites all routes to `/th/` or `/en/`; `th.json`/`en.json` message files

### Critical Pitfalls

1. **LINE Notify is terminated (March 31, 2025)** — Use `@line/bot-sdk` with LINE Messaging API exclusively. Any tutorial referencing `notify-bot.line.me` is outdated. No legacy code from these tutorials should enter the codebase.

2. **LINE Login channel stuck in "Developing" status** — Channel defaults to "Developing" on creation; only admin/tester accounts can log in. Publish the channel before any real user test. Verify with a non-admin LINE account as a launch gate checklist item.

3. **Double booking via race condition** — Never check slot availability and insert booking as two separate queries. Wrap in `prisma.$transaction` with `SELECT FOR UPDATE`. Add a unique constraint on `startAt` for PENDING/CONFIRMED bookings. Test with two concurrent submissions before launch.

4. **Buddhist Era (พ.ศ.) year offset bug** — `Intl.DateTimeFormat` with `locale: 'th-TH'` defaults to Buddhist calendar, producing dates 543 years off. Store all dates in UTC Gregorian in the database. Pass `calendar: 'gregory'` explicitly when rendering dates for Thai users unless BE output is intentional. Test with browser language forced to `th-TH`.

5. **PromptPay QR generated client-side exposes owner's phone number** — Generate the QR payload in a Server Action or API route; keep the owner's PromptPay phone number in server-side environment variables only (`NEXT_PUBLIC_*` is off-limits). Return the rendered QR as a base64 data URL.

6. **OAuth state parameter omitted** — Use Better Auth rather than a manual OAuth implementation. Better Auth handles state, nonce, and PKCE correctly. Do not attempt raw OAuth flows.

## Implications for Roadmap

Based on the combined research, the architecture's documented build order plus the feature dependency graph suggests a 6-phase structure. This ordering is driven by hard dependencies (schema before services before UI), the pitfall-to-phase mapping from PITFALLS.md, and the feature priority matrix from FEATURES.md.

### Phase 1: Foundation and Infrastructure
**Rationale:** Everything depends on the database schema, environment configuration, and bilingual routing. Starting with these prevents costly refactoring. i18n routing especially must be established first — retrofitting `app/[locale]/` later requires restructuring all routes.
**Delivers:** Running Next.js 16 app with TypeScript, Tailwind v4, Drizzle schema deployed to Supabase, next-intl routing (`/th/`, `/en/`), Biome configured, Vercel deployment pipeline
**Addresses:** Service menu (static data), portfolio gallery (Supabase Storage), about/contact page — all zero-dependency public features can launch here
**Avoids:** Anti-pattern of flat route structure without locale prefix; Thai font FOIT (add `font-display: swap` and subset in this phase)

### Phase 2: Authentication
**Rationale:** LINE Login is a prerequisite for the booking flow (auth gates booking confirmation). Better Auth configuration with LINE provider must be verified with a non-admin test account before the booking UI is built on top of it.
**Delivers:** Better Auth with LINE Login (primary), Google and Facebook as optional fallbacks; `lineUserId` stored in User record at sign-in; admin role enforcement via middleware; `/admin` route protection tested end-to-end
**Addresses:** LINE Login SSO feature; admin route security
**Avoids:** LINE channel left in "Developing" at launch (make channel publishing a checklist item ending this phase); OAuth state/CSRF vulnerability (Better Auth handles this); admin dashboard accessible to non-admin users

### Phase 3: Booking Core (Schedule + Slot Reservation)
**Rationale:** This is the highest-complexity phase and the product's core value. The schedule service (recurring hours + date exceptions) must exist before the calendar UI can render real data. Slot reservation must be atomic before it is exposed to any user.
**Delivers:** Weekly schedule configuration (admin); date exception blocking (admin); slot availability API (`/api/slots`); booking creation Server Action with pessimistic lock transaction; booking status state machine (PENDING / CONFIRMED / EXPIRED / CANCELLED); double-booking protection verified
**Addresses:** Calendar-based slot selection; recurring schedule with exception blocks; admin schedule management
**Avoids:** Double-booking race condition (transaction + SELECT FOR UPDATE built in from day one); no buffer time in slot model (buffer baked into service duration at schema level)

### Phase 4: Payment Display
**Rationale:** PromptPay QR depends on a confirmed pending booking record existing in the database (QR must not display before the booking is written — security requirement from PITFALLS.md). This phase adds the payment step after the booking core is working.
**Delivers:** Server-side PromptPay QR generation (promptpay-qr + qrcode in Server Action); QR displayed as base64 data URL; booking confirmation page with screenshot-friendly layout; booking ID shown as payment reference
**Addresses:** PromptPay QR at checkout feature
**Avoids:** QR displayed before booking record is written; owner's phone number exposed in client bundle; static QR reused across bookings

### Phase 5: Notifications
**Rationale:** Notification delivery depends on: (1) `lineUserId` stored from Phase 2 auth, (2) booking + confirmation events from Phase 3. Fire-and-forget notification calls are added to the existing Server Actions as post-commit side effects.
**Delivers:** LINE push to owner on new booking; LINE push to client on payment confirmation (with lineUserId null-check and email fallback); Resend transactional email confirmations; webhook endpoint for inbound LINE events with HMAC-SHA256 signature validation
**Addresses:** LINE notification to owner; LINE notification to client; email confirmation features
**Avoids:** Using LINE Notify (terminated); sending LINE push without checking friend status; webhook endpoint without signature validation; LINE channel secret in client-side code

### Phase 6: Admin Dashboard and Booking Management
**Rationale:** The admin dashboard aggregates all previous phases — it reads booking data, triggers confirmation (which fires notifications), and manages schedule. Building it last means all underlying services are stable and tested.
**Delivers:** Bookings list with status filtering (pending first); one-tap payment confirmation action; booking cancellation; appointment reminders (LINE push 24h before, Phase 2 data available); client cancellation/rescheduling UI
**Addresses:** Admin booking dashboard; admin payment confirmation; owner workflow features
**Avoids:** Admin notification only via LINE with no fallback; multiple taps to confirm payment (pending bookings surfaced first); client-supplied userId in booking requests (always derived from session)

### Phase Ordering Rationale

- i18n routing in Phase 1 is non-negotiable — the architecture anti-pattern of retrofitting locale prefixes is specifically called out in ARCHITECTURE.md
- Authentication in Phase 2 before booking core because LINE Login gates booking confirmation and `lineUserId` must be captured before notification infrastructure is built
- Booking core in Phase 3 before payment because the QR must not appear before a booking record exists (PITFALLS.md security requirement)
- Notifications in Phase 5 after booking core because they are triggered by booking events and require `lineUserId` from auth
- Admin last because it depends on all other services being stable and tested

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Authentication):** Better Auth's LINE provider configuration details and the exact LINE Developers Console setup sequence (channel creation, callback URL registration, email scope approval requirements) may need verification against current docs at planning time. The auth.js → Better Auth migration is recent (Sept 2025) and some patterns may still be stabilizing.
- **Phase 3 (Booking Core):** Drizzle's `$transaction` with `SELECT FOR UPDATE` syntax for Supabase/PostgreSQL should be verified against Drizzle's current docs — the ORM is actively developed and API details matter here.
- **Phase 5 (Notifications):** LINE Messaging API friendship status checking before push delivery, and the exact webhook signature validation flow with `@line/bot-sdk` 10.6.x, are integration-specific enough to warrant a research step before implementation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js 16 + Tailwind v4 + next-intl App Router setup is well-documented with official guides. Drizzle schema migrations with Supabase are straightforward.
- **Phase 4 (Payment Display):** `promptpay-qr` + `qrcode` usage is minimal and well-documented; the PromptPay EMVCo spec is stable.
- **Phase 6 (Admin Dashboard):** Standard CRUD UI patterns with Server Actions; no novel integrations.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies verified via official docs and Context7; Better Auth LINE provider confirmed; LINE Notify termination confirmed via official announcement. One MEDIUM item: `promptpay-qr` is unmaintained but the underlying spec is frozen. |
| Features | HIGH | Feature set is well-aligned with real Thai market context; competitor analysis is concrete; feature dependencies are clearly mapped. LINE pricing and LINE Login scopes verified against official docs. |
| Architecture | HIGH | Build order and component boundaries are grounded in Next.js App Router patterns and documented anti-patterns. Database schema design follows established appointment-scheduling models. |
| Pitfalls | HIGH | Critical pitfalls verified against official LINE Developers docs, Auth0 docs, and real-world bug reports. The Buddhist Era date bug has documented production examples. |

**Overall confidence:** HIGH

### Gaps to Address

- **LINE email scope approval:** Research notes that requesting the `email` scope from LINE Login requires prior approval from LINE. The current stack relies on `profile` and `openid` scopes. If the owner wants email-based fallback for non-LINE users, this approval process timeline needs to be factored into Phase 2 planning.
- **LINE Official Account free tier volume:** The free tier allows 200 push messages/month. At Phase 5 planning time, estimate monthly booking volume and whether the free tier will hold. If the owner averages 120 bookings/month with both new-booking and confirmation pushes, that is 240+ messages — the paid tier may be required from launch.
- **Supabase connection string mode:** Drizzle requires Supabase's session-mode connection string (port 5432), not transaction mode (port 6543). This is a configuration detail that must be set correctly in Phase 1 — if missed, it surfaces as cryptic prepared statement errors under load.
- **promptpay-qr maintenance status:** The library is stable (the EMVCo spec does not change) but has not been updated in ~4 years. Verify it produces QR codes that scan correctly in current KBank and SCB mobile apps before committing to it at Phase 4. The test checklist in PITFALLS.md covers this explicitly.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — Next.js 16 stable, Turbopack default, Node.js 20.9+ requirement
- [Better Auth LINE provider docs](https://better-auth.com/docs/authentication/line) — LINE SSO configuration
- [Auth.js joins Better Auth announcement](https://better-auth.com/blog/authjs-joins-better-auth) — merger confirmed Sept 22, 2025
- [LINE Notify closing announcement](https://notify-bot.line.me/closing-announce) — service ended March 31, 2025
- [LINE Developers: Integrating LINE Login](https://developers.line.biz/en/docs/line-login/integrate-line-login/) — OAuth flow, scopes, callback URL requirements
- [LINE Developers: Messaging API receiving messages](https://developers.line.biz/en/docs/messaging-api/receiving-messages/) — webhook signature validation
- [LINE Developers: LINE Login development guidelines](https://developers.line.biz/en/docs/line-login/development-guidelines/) — channel status (Developing vs Published)
- [Auth0: Prevent Attacks with OAuth 2.0 State Parameters](https://auth0.com/docs/secure/attack-protection/state-parameters) — OAuth state/CSRF
- [@line/bot-sdk GitHub releases](https://github.com/line/line-bot-sdk-nodejs/releases) — v10.6.0 (Jan 2025)
- [next-intl homepage](https://next-intl.dev/) — App Router native i18n
- [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4) — stable Jan 22, 2025
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — v4 support confirmed

### Secondary (MEDIUM confidence)
- [Drizzle vs Prisma 2026 comparison](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — serverless cold start benchmarks
- [promptpay-qr npm](https://www.npmjs.com/package/promptpay-qr) — v0.5.0, unmaintained but functional
- [Canvas LMS Buddhist calendar bug](https://community.canvaslms.com/t5/Known-Issues/Date-changes-from-Gregorian-to-Buddhist-calendar-in-the-date/ta-p/606786) — documented 543-year offset in production
- [ke2b.com: LINE Notify to End in 2025](https://ke2b.com/en/line-notify-closing-alt/) — corroborating source for Messaging API replacement
- [HackerNoon: Race Conditions in Booking Systems](https://hackernoon.com/how-to-solve-race-conditions-in-a-booking-system) — double booking prevention patterns
- [PromptPay Thailand market overview](https://knowledge.antom.com/guide-to-promptpay-in-thailand) — PromptPay context

### Tertiary (LOW confidence / inference)
- Better Auth v1.5.5 as latest stable — verified via npm search at research time; confirm version at project initialization

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*
