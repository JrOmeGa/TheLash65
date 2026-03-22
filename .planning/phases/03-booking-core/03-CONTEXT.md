# Phase 3: Booking Core - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Clients can browse real available slots driven by the owner's schedule and reserve an appointment atomically — two clients can never book the same slot. Includes owner tools to set recurring weekly hours and block specific dates. Payment QR and notifications are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Booking wizard step order
- **D-01:** Step order is **Date → Time → Service → Confirm** (client picks when first, then what)
- **D-02:** Date picker is a horizontal scrollable date strip, not a full month calendar
- **D-03:** Look-ahead window is **60 days** from today
- **D-04:** After picking a date, available time slots appear as **tappable buttons in a grid** (e.g. `[10:00]  [12:00]  [14:00]`)

### Slot generation
- **D-05:** Slots are **fixed 120-min blocks** — slot duration does not change based on service selected
- **D-06:** All slot timing is derived from `scheduleRules` (`openTime`, `closeTime`, `slotDurationMinutes`) — nothing hardcoded
- **D-07:** Already-booked slots are shown **grayed out and untappable** ("Unavailable") — not hidden
- **D-08:** Days with zero open slots are **grayed out and not tappable** in the date strip (no message shown)

### Double-booking prevention
- **Claude's Discretion:** Atomic reservation mechanism (DB-level unique constraint or advisory lock via Supabase/Postgres) — implementation choice left to planner/researcher

### Admin schedule management
- **D-09:** Weekly hours UI is a **simple table** — 7 rows (Mon–Sun), each with an On/Off toggle + open time + close time inputs
- **D-10:** Date blocking scope is **full day only** in this phase — data model stays ready for slot-level blocking later (ADMIN-05 partial)
- **D-11:** Owner adds a blocked date via **date picker → "Block this day" button** — tap date, confirm, done
- **D-12:** Admin schedule lives at **`/admin/schedule`** — a separate page, linked from admin nav

### Post-booking state
- **D-13:** After submitting, client is redirected to **`/book/confirmation/[id]`** — a persistent, auth-gated page
- **D-14:** Confirmation page shows: **booking summary** (service, date, time, price) + **next steps copy** ("Please wait for the owner to send payment details") + a QR placeholder for Phase 4
- **D-15:** Page is **persistent** — accessible any time the client is logged in (Phase 4 needs it for QR download)
- **D-16:** No booking history or account page in this phase — CLIENT-01 is v2

### Claude's Discretion
- Atomic reservation mechanism (unique constraint vs advisory lock vs optimistic retry)
- Exact loading/skeleton states during slot fetch
- Error state copy and handling
- Mobile layout spacing and typography details

</decisions>

<specifics>
## Specific Ideas

- Date strip feels like a horizontal scroll of pills: `[Tue 24]  [Wed 25]  [Thu 26]...` — available days normal, unavailable grayed
- Slot grid is clean button rows: `[10:00]  [12:00]  [14:00]` — selected slot gets filled/highlighted state
- Admin weekly hours table is fast to scan: one glance shows the whole week
- Confirmation page QR placeholder should make it obvious Phase 4 will fill it — "Payment QR will appear here" style

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema (booking data model)
- `src/db/schema.ts` — `bookings`, `services`, `scheduleRules`, `scheduleExceptions` tables — all fields and indexes already deployed
- `src/db/schema.ts` §scheduleRules — `dayOfWeek`, `openTime`, `closeTime`, `slotDurationMinutes`, `isActive` — slot generation inputs
- `src/db/schema.ts` §scheduleExceptions — `exceptionDate`, `isClosed` — blocked date inputs

### Existing booking entry point
- `src/app/[locale]/book/page.tsx` — current stub; Phase 3 replaces the "coming soon" placeholder with the full wizard
- `.planning/phases/02-authentication/02-CONTEXT.md` §D-01–D-05 — auth step is already wired as the first gate; wizard starts AFTER auth check passes

### Admin foundation
- `src/app/[locale]/admin/layout.tsx` — admin session gate already in place; `/admin/schedule` inherits this protection
- `src/app/[locale]/admin/page.tsx` — current admin stub; add nav link to `/admin/schedule` here

### Requirements
- `.planning/REQUIREMENTS.md` §Booking — BOOK-01 through BOOK-06
- `.planning/REQUIREMENTS.md` §Admin — ADMIN-04, ADMIN-05
- `.planning/ROADMAP.md` §Phase 3 — 5 success criteria (available slots, blocked slots, full booking flow, atomic reservation, owner schedule management)

### Stack conventions
- `CLAUDE.md` §Stack Patterns — Server Actions for booking submission, Server Components for slot fetching, Client Components for interactive picker
- `CLAUDE.md` §Conventions — `src/proxy.ts` pattern, Drizzle session-mode port 5432
- `.planning/STATE.md` §Accumulated Context — `formatDateGregorian` utility required for Thai date display; `calendar:'gregory'` always required

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — shadcn Button; use for slot grid buttons and wizard CTAs
- `src/components/ui/card.tsx` — shadcn Card; use for service selection cards in step 3
- `src/components/ui/sheet.tsx` — shadcn Sheet (bottom drawer); available if any mobile overlay is needed
- `src/lib/utils/formatDate.ts` — `formatDateGregorian` utility — MUST use for all date display (Thai locale + Gregorian calendar)
- `src/db/index.ts` — lazy Drizzle proxy; import for all DB queries in Server Components and Server Actions

### Established Patterns
- App Router Server Components for data fetching (services list, slot availability)
- Server Actions for mutations (booking submission, admin schedule updates)
- Client Components for interactive UI (date strip, slot grid, service selector)
- `app/[locale]/` routing — all pages under locale prefix
- Admin routes protected by session gate in `src/app/[locale]/admin/layout.tsx`

### Integration Points
- `bookings.userId` → `users.id` (FK) — Server Action reads `session.user.id` from Better Auth to set this
- `bookings.serviceId` → `services.id` (FK) — service chosen in Step 3 of wizard
- `bookings.scheduledAt` — timestamp with timezone; store as UTC, display with `formatDateGregorian`
- `bookings_scheduled_at_idx` — index already exists for availability queries
- StickyMandateBar "Book Now" CTA (currently `href="#"`) — wire to `/[locale]/book` in this phase (D-12 from Phase 1 CONTEXT)

</code_context>

<deferred>
## Deferred Ideas

- Slot-level blocking (ADMIN-05 partial) — data model ready, full UI deferred to v2 or Phase 6
- Booking history / "your bookings" page (CLIENT-01) — explicitly v2
- Reschedule or cancel by client (CLIENT-02) — v2
- Time zone display for international clients — out of scope for Thai-market v1
- Waitlist for full days — out of scope per REQUIREMENTS.md

</deferred>

---

*Phase: 03-booking-core*
*Context gathered: 2026-03-23*
