# Architecture Research

**Domain:** Mobile-first booking/appointment website (lash extension, solo operator, Thailand market)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Public Site │  │ Booking Flow │  │Admin Dashboard│              │
│  │  (SSR pages) │  │ (RSC + CSR)  │  │  (CSR heavy) │              │
│  │  /, /gallery │  │ /book/*      │  │  /admin/*    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                      │
├─────────┴─────────────────┴──────────────────┴──────────────────────┤
│                    NEXT.JS APP ROUTER LAYER                         │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ Route Groups│  │Server Actions│  │ API Routes  │                 │
│  │ (locale)    │  │(mutations)   │  │(/api/*)     │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                 │                        │
├─────────┴────────────────┴─────────────────┴────────────────────────┤
│                       SERVICE LAYER                                 │
│                                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │ Booking   │  │ Schedule  │  │ Notify    │  │ Auth      │        │
│  │ Service   │  │ Service   │  │ Service   │  │ Service   │        │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘        │
│        │              │              │              │               │
├────────┴──────────────┴──────────────┴──────────────┴───────────────┤
│                         DATA LAYER                                  │
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │  PostgreSQL   │  │  NextAuth.js  │  │   File Store  │           │
│  │  via Prisma   │  │  (sessions)   │  │ (QR images /  │           │
│  │               │  │               │  │  portfolio)   │           │
│  └───────────────┘  └───────────────┘  └───────────────┘           │
├─────────────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES LAYER                          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Line Login   │  │ Line Message │  │  Email (SMTP /│              │
│  │ (OAuth 2.0)  │  │ API (push)   │  │  Resend)      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │ Google OAuth │  │ Facebook     │                                 │
│  │              │  │ OAuth        │                                 │
│  └──────────────┘  └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Public Site | Portfolio, services, pricing, about — SSR for SEO | Next.js Server Components, `app/[locale]/` routes |
| Booking Flow | Date/slot selection, service choice, auth gate, QR display | Mix of RSC (calendar data fetch) + CSR (interactive calendar) |
| Admin Dashboard | View bookings, confirm payments, manage schedule | Client-heavy React, protected by role middleware |
| Auth Service | SSO via Line/Google/Facebook, session management | Auth.js (formerly NextAuth) with Line/Google/Facebook providers |
| Schedule Service | Recurring weekly hours, exception blocking, slot generation | Pure business logic module; queries DB, returns open slots |
| Booking Service | Create, confirm, cancel bookings; prevent double-bookings | Server Actions + Prisma; optimistic locking for concurrent slots |
| Notify Service | Push Line message (client + owner), send email confirmation | Server-side only; triggered post-booking and post-confirm events |
| PromptPay QR | Generate QR payload from phone number + booking amount | `promptpay-qr` npm library; rendered client-side or as image URL |
| i18n Layer | Thai/English routing and message lookup | `next-intl`; `app/[locale]/` route structure with `th.json`/`en.json` |

## Recommended Project Structure

```
src/
├── app/
│   ├── [locale]/                # next-intl locale wrapper (th / en)
│   │   ├── (public)/            # Route group: public-facing pages
│   │   │   ├── page.tsx         # Home / hero
│   │   │   ├── gallery/         # Portfolio
│   │   │   ├── services/        # Service menu + pricing
│   │   │   └── about/           # Contact + about
│   │   ├── (booking)/           # Route group: booking flow (requires auth at confirm step)
│   │   │   ├── book/
│   │   │   │   ├── page.tsx     # Step 1: select service + slot
│   │   │   │   ├── confirm/     # Step 2: login gate + review
│   │   │   │   └── payment/     # Step 3: PromptPay QR display
│   │   │   └── booking/[id]/    # Booking status page
│   │   └── (admin)/             # Route group: protected admin area
│   │       └── admin/
│   │           ├── layout.tsx   # Admin auth guard
│   │           ├── bookings/    # All bookings list + confirm action
│   │           └── schedule/    # Weekly hours + block-off dates
│   └── api/
│       ├── auth/[...nextauth]/  # Auth.js handler
│       ├── bookings/            # REST endpoints if needed alongside Server Actions
│       ├── slots/               # GET available slots for a date
│       └── webhooks/
│           └── line/            # Line Messaging API webhook (optional inbound)
├── components/
│   ├── ui/                      # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── booking/                 # BookingCalendar, SlotPicker, ServiceCard, QRCodeDisplay
│   ├── admin/                   # BookingTable, ScheduleEditor, ConfirmButton
│   └── layout/                  # Navbar, Footer, LanguageSwitcher
├── lib/
│   ├── db/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── schema.prisma        # Moved here or at root
│   ├── services/
│   │   ├── booking.ts           # Booking business logic
│   │   ├── schedule.ts          # Slot generation, availability
│   │   ├── notify.ts            # Line push + email dispatch
│   │   └── promptpay.ts        # QR payload generation wrapper
│   ├── auth.ts                  # Auth.js config (providers, callbacks)
│   └── utils.ts                 # Shared helpers
├── i18n/
│   ├── request.ts               # next-intl server config
│   ├── messages/
│   │   ├── en.json
│   │   └── th.json
├── middleware.ts                # next-intl locale routing + admin auth guard
└── prisma/
    └── schema.prisma
```

### Structure Rationale

- **`app/[locale]/`:** All routes live under the locale prefix — `next-intl` handles routing via middleware, producing URLs like `/th/book` and `/en/book`. This is the recommended App Router pattern.
- **Route groups `(public)`, `(booking)`, `(admin)`:** Groups share layouts without affecting URL paths. Admin group carries an auth guard layout; public group is open.
- **`lib/services/`:** Business logic lives outside React — pure TypeScript modules. This makes services testable and decoupled from the HTTP layer.
- **`components/booking/` and `components/admin/`:** Feature-scoped components avoid a flat UI dumping ground and make component ownership clear.

## Architectural Patterns

### Pattern 1: Server Components for Data, Client Components for Interaction

**What:** Fetch and render data on the server (availability, service list, existing bookings). Make only interactive elements client components (calendar date picker, form, QR display trigger).

**When to use:** All data-fetching pages. Booking calendar fetches initial slot data server-side; the interactive slot picker is a Client Component receiving that data as props.

**Trade-offs:** Reduces JavaScript bundle on mobile; small overhead of defining `"use client"` boundaries carefully.

**Example:**
```typescript
// app/[locale]/(booking)/book/page.tsx — Server Component
export default async function BookPage({ searchParams }) {
  const services = await getServices()          // DB call on server
  const slots = await getAvailableSlots(searchParams.date)
  return <SlotPicker services={services} initialSlots={slots} />
  // SlotPicker is "use client" — handles interactive selection
}
```

### Pattern 2: Server Actions for Mutations

**What:** All write operations (create booking, confirm payment, block schedule date) use Next.js Server Actions rather than dedicated API routes.

**When to use:** Form submissions, booking confirmation button in admin, schedule management. Actions run server-side, have direct DB access, return typed results.

**Trade-offs:** Simpler than a REST API for internal mutations. Slightly harder to call from external systems if ever needed, but this project has no external callers.

**Example:**
```typescript
// lib/services/booking.ts
"use server"
export async function createBooking(data: BookingInput) {
  // Validate slot still available (select for update / transaction)
  // Insert booking record
  // Trigger notifications (non-blocking)
  // Return booking ID and QR payload
}
```

### Pattern 3: Optimistic Locking for Slot Concurrency

**What:** Wrap slot reservation in a Prisma transaction. Mark slot as `PENDING` atomically before returning; release if payment not confirmed within a time window.

**When to use:** The moment a client submits a booking before paying. Prevents two clients booking the same 90-minute slot simultaneously.

**Trade-offs:** Adds a booking status state machine (`PENDING` → `CONFIRMED` | `EXPIRED`). Small complexity cost that is necessary for correctness.

```typescript
// Inside createBooking server action
await prisma.$transaction(async (tx) => {
  const slot = await tx.slot.findFirst({
    where: { startAt: data.startAt, status: "AVAILABLE" },
    lock: { update: true }   // SELECT FOR UPDATE
  })
  if (!slot) throw new Error("SLOT_TAKEN")
  await tx.slot.update({ where: { id: slot.id }, data: { status: "PENDING" } })
  return await tx.booking.create({ data: { slotId: slot.id, ...data } })
})
```

### Pattern 4: Event-Driven Notifications (Fire-and-Forget)

**What:** After a booking or confirmation action completes its DB write, dispatch notifications (Line push, email) asynchronously. Do not block the HTTP response on notification delivery.

**When to use:** All notification triggers. Line API and email SMTP have network latency; clients should not wait for them.

**Trade-offs:** Failed notifications are silent unless a retry/queue is added. For a solo-operator v1, logging errors and surfacing them in admin is sufficient — no message queue needed.

## Data Flow

### Booking Creation Flow

```
Client taps "Confirm Booking"
    ↓
Server Action: createBooking(formData)
    ↓
Validate session (Auth.js) → reject if not logged in
    ↓
Prisma transaction: check slot AVAILABLE → mark PENDING → create Booking
    ↓
Generate PromptPay QR payload (promptpay-qr, phone + amount)
    ↓
Return { bookingId, qrPayload } to client
    ↓
Client renders QR code (qrcode.react or similar)
    ↓        ↓ async, non-blocking
Redirect    notify.ts:
to /payment   - Line push to client (if Line SSO used and Line userId stored)
              - Email confirmation to client
              - Line push to owner Official Account
```

### Payment Confirmation Flow (Admin)

```
Owner opens admin dashboard
    ↓
BookingTable fetches bookings with status=PENDING
    ↓
Owner clicks "Confirm Payment" on a row
    ↓
Server Action: confirmBooking(bookingId)
    ↓
Prisma: update Booking status PENDING → CONFIRMED
    ↓
notify.ts (async):
  - Line push to client: "Payment confirmed, see you [date/time]"
  - Email: same confirmation
```

### Schedule Availability Flow

```
Client selects date on calendar
    ↓
GET /api/slots?date=YYYY-MM-DD (or Server Component refetch)
    ↓
schedule.ts:
  1. Load recurring weekly hours for that weekday
  2. Load any exception blocks for that date
  3. Load existing PENDING/CONFIRMED bookings for that date
  4. Generate 90-min slots from hours, exclude blocked + booked
  5. Return available slot times
    ↓
Client renders available slots; taken slots shown as disabled
```

### Authentication Flow (SSO)

```
Client clicks "Login to Book"
    ↓
Auth.js redirects to chosen provider (Line / Google / Facebook)
    ↓
Provider returns OAuth code → Auth.js exchanges for user profile
    ↓
Auth.js upserts User record in DB (name, email, provider, providerAccountId)
    ↓
Line provider: store lineUserId from profile for future push messages
    ↓
Session created (JWT) → client redirected back to /book/confirm
```

### i18n Request Flow

```
Browser navigates to /book
    ↓
next-intl middleware: detect locale from URL prefix, cookie, or Accept-Language
    ↓
Redirect/rewrite to /th/book or /en/book
    ↓
Server Component: getTranslations("booking") → loads th.json or en.json
    ↓
Rendered HTML contains Thai or English strings
```

## Database Schema (Core Tables)

```
User
  id, name, email, image
  lineUserId (nullable — only set when login is via Line)
  role: CLIENT | ADMIN

Service
  id, slug, nameTh, nameEn, descriptionTh, descriptionEn
  durationMinutes, price (THB)

WeeklySchedule
  id, dayOfWeek (0–6), openTime, closeTime, isActive

ScheduleException
  id, date (Date), reason, isBlocked

Booking
  id, userId, serviceId
  startAt (DateTime), endAt (DateTime)
  status: PENDING | CONFIRMED | CANCELLED | EXPIRED
  promptPayRef (nullable — owner's note)
  createdAt, updatedAt
```

**Key constraints:**
- `(startAt, endAt)` must not overlap with any other PENDING or CONFIRMED booking — enforced in transaction
- Only one booking can occupy a given `startAt` slot

## Integration Points

### External Services

| Service | Integration Pattern | Key Constraint |
|---------|---------------------|----------------|
| Line Login | Auth.js Line provider (OAuth 2.0) | Must store `lineUserId` from profile for push messages later |
| Google OAuth | Auth.js Google provider | Standard; no additional storage needed |
| Facebook OAuth | Auth.js Facebook provider | Standard; no additional storage needed |
| Line Messaging API | Server-side push via `@line/bot-sdk`; requires LINE Official Account | Client must have added Official Account as friend — cannot push to arbitrary users. Capture `lineUserId` at login. |
| Email | Resend (recommended) or SMTP/Nodemailer | Use Resend for reliable delivery on serverless/Vercel |
| PromptPay QR | `promptpay-qr` npm library (server or client) | Generates EMVCo QR string; render with `qrcode` or `qrcode.react`. Owner's PromptPay phone stored as env var. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components ↔ Service Layer | Direct function import (server-only) | Never import service layer into Client Components |
| Server Actions ↔ Service Layer | Direct function call | Server Actions are the mutation entry point |
| Admin routes ↔ Auth | Middleware + layout auth guard | `middleware.ts` protects `/[locale]/admin/*` by role |
| Notify Service ↔ DB | Read-only in notify; uses data passed from booking service | No direct DB writes in notify — keeps side effects isolated |
| API Routes ↔ Service Layer | Thin adapter — call service function, return JSON | `/api/slots` is a read-only endpoint used for client-side refetching after initial render |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–500 bookings/month | Current architecture is entirely sufficient. Vercel Hobby or Pro + Neon/Supabase PostgreSQL. No queue needed. |
| 500–5,000/month | Add database connection pooling (PgBouncer via Supabase/Neon). Consider moving notifications to background job (Vercel Cron or Upstash Queue). |
| 5,000+/month | Extract notification service to a dedicated worker. Add Redis for slot reservation cache. Unlikely given solo-operator context. |

### Scaling Priorities

1. **First bottleneck:** Database connections under concurrent slot queries. Fix: use `pgbouncer` mode on managed Postgres (Neon/Supabase have this built in).
2. **Second bottleneck:** Line Messaging API rate limits (500 push/user/month is per-user, not global). Owner-facing pushes are infrequent; client pushes depend on volume. Well within limits for a solo operator.

## Anti-Patterns

### Anti-Pattern 1: Flat Route Structure Without Locale Prefix

**What people do:** Build the app without i18n routing, then bolt on translations with query params (`?lang=th`).
**Why it's wrong:** Breaks SEO for both languages. Search engines index `/` as one page; `/th/` and `/en/` can both rank. Adding i18n to an existing route structure in Next.js App Router requires significant restructuring.
**Do this instead:** Start with `app/[locale]/` from day one. next-intl's App Router setup does this correctly.

### Anti-Pattern 2: Checking Slot Availability Without a Transaction

**What people do:** Check if a slot is free, then insert the booking in two separate queries.
**Why it's wrong:** Race condition — two users can pass the availability check simultaneously and both get "booked." For a lash extension with one technician, a double-booked slot is a real operational problem.
**Do this instead:** Use `prisma.$transaction` with `SELECT FOR UPDATE` (or a unique constraint on `startAt` + active status) so only one booking can succeed atomically.

### Anti-Pattern 3: Sending Line Notifications Without Stored lineUserId

**What people do:** Assume all users can receive Line push messages, or try to send to Line Login email instead of userId.
**Why it's wrong:** Line Messaging API requires the user's LINE User ID (a UUID-like string returned in the OAuth profile). Email is not sufficient. Users who authenticated via Google/Facebook have no lineUserId.
**Do this instead:** Store `lineUserId` during Line SSO sign-in (Auth.js `signIn` callback). Before sending a push, check that `lineUserId` is non-null. Fall back to email for non-Line users.

### Anti-Pattern 4: Using Line Notify Instead of Line Messaging API

**What people do:** Search old tutorials, find Line Notify examples, implement it.
**Why it's wrong:** Line Notify was shut down on March 31, 2025. Any implementation will fail immediately.
**Do this instead:** Use Line Messaging API with a LINE Official Account. Requires creating a Messaging API channel in LINE Developers Console. The `@line/bot-sdk` npm package handles push messages.

### Anti-Pattern 5: Client-Side PromptPay QR Generation With Secret Phone Number

**What people do:** Generate the PromptPay QR entirely in the browser, embedding the owner's phone number in client-side JavaScript.
**Why it's wrong:** The owner's PromptPay phone number is visible in client source. While not catastrophically secret, it is better practice to keep it server-side.
**Do this instead:** Generate the QR payload in a Server Action or API route; return the rendered QR image URL or the payload string. The phone number stays in environment variables.

## Build Order Implications

Components have clear dependencies. Build in this order to avoid blockers:

```
1. Database schema + Prisma setup
   └── Everything reads/writes from here

2. Auth.js SSO (Line + Google + Facebook)
   └── Booking flow requires session; admin requires role

3. Public pages (home, gallery, services)
   └── No auth dependency; validates i18n routing early

4. Schedule service + slot API
   └── Booking calendar depends on this

5. Booking flow (select → confirm → QR display)
   └── Depends on auth + schedule service + PromptPay QR library

6. Notification service (Line push + email)
   └── Triggered by booking creation; can be stubbed initially

7. Admin dashboard (bookings list + confirm action)
   └── Depends on booking data + notification service for confirm trigger

8. i18n (next-intl) — set up in Phase 1 alongside routing; fill translations throughout
```

## Sources

- [Next.js App Router Architecture 2026 — Server-First, Client-Islands](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Building a Real-Time Booking System with Next.js 14](https://medium.com/@abdulrehmanikram9710/building-a-real-time-booking-system-with-next-js-14-a-practical-guide-d67d7f944d76)
- [Line Notify shutdown, Messaging API as replacement](https://ke2b.com/en/line-notify-closing-alt/)
- [Auth.js Line Provider](https://authjs.dev/reference/core/providers/line)
- [LINE Login integration docs](https://developers.line.biz/en/docs/line-login/integrate-line-login/)
- [LINE Messaging API — Sending Messages](https://developers.line.biz/en/docs/messaging-api/sending-messages/)
- [promptpay-qr npm library](https://github.com/dtinth/promptpay-qr)
- [next-intl App Router docs](https://next-intl.dev/docs/getting-started/app-router)
- [How to build a high-concurrency booking system with Prisma](https://dev.to/zenstack/how-to-build-a-high-concurrency-ticket-booking-system-with-prisma-184n)
- [Vertabelo: Data model for appointment scheduling](https://vertabelo.com/blog/a-database-model-to-manage-appointments-and-organize-schedules/)

---
*Architecture research for: Lash extension booking website (mobile-first, Thai market, solo operator)*
*Researched: 2026-03-22*
