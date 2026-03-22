# Phase 3: Booking Core - Research

**Researched:** 2026-03-23
**Domain:** Booking wizard (multi-step Client Component), slot availability engine (Server Components + Server Actions), atomic reservation (PostgreSQL unique constraint), admin schedule management
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Step order is **Date → Time → Service → Confirm** (client picks when first, then what)
- **D-02:** Date picker is a horizontal scrollable date strip, not a full month calendar
- **D-03:** Look-ahead window is **60 days** from today
- **D-04:** After picking a date, available time slots appear as **tappable buttons in a grid** (e.g. `[10:00]  [12:00]  [14:00]`)
- **D-05:** Slots are **fixed 120-min blocks** — slot duration does not change based on service selected
- **D-06:** All slot timing is derived from `scheduleRules` (`openTime`, `closeTime`, `slotDurationMinutes`) — nothing hardcoded
- **D-07:** Already-booked slots are shown **grayed out and untappable** ("Unavailable") — not hidden
- **D-08:** Days with zero open slots are **grayed out and not tappable** in the date strip (no message shown)
- **D-09:** Weekly hours UI is a **simple table** — 7 rows (Mon–Sun), each with an On/Off toggle + open time + close time inputs
- **D-10:** Date blocking scope is **full day only** in this phase — data model stays ready for slot-level blocking later (ADMIN-05 partial)
- **D-11:** Owner adds a blocked date via **date picker → "Block this day" button** — tap date, confirm, done
- **D-12:** Admin schedule lives at **`/admin/schedule`** — a separate page, linked from admin nav
- **D-13:** After submitting, client is redirected to **`/book/confirmation/[id]`** — a persistent, auth-gated page
- **D-14:** Confirmation page shows: **booking summary** (service, date, time, price) + **next steps copy** + a QR placeholder for Phase 4
- **D-15:** Page is **persistent** — accessible any time the client is logged in
- **D-16:** No booking history or account page in this phase — CLIENT-01 is v2

### Claude's Discretion
- Atomic reservation mechanism (unique constraint vs advisory lock vs optimistic retry)
- Exact loading/skeleton states during slot fetch
- Error state copy and handling
- Mobile layout spacing and typography details

### Deferred Ideas (OUT OF SCOPE)
- Slot-level blocking (ADMIN-05 partial) — data model ready, full UI deferred to v2 or Phase 6
- Booking history / "your bookings" page (CLIENT-01) — explicitly v2
- Reschedule or cancel by client (CLIENT-02) — v2
- Time zone display for international clients — out of scope for Thai-market v1
- Waitlist for full days — out of scope per REQUIREMENTS.md
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BOOK-01 | Client can view available date and time slots on a calendar picker | Date strip (D-02) + slot grid (D-04) + slot generation algorithm |
| BOOK-02 | Client can select a service type and see its cost before booking | Step 3 of wizard: services query from `services` table, display `priceTHB` |
| BOOK-03 | Client can confirm a booking after selecting date, time, and service | Server Action: `createBooking` inserts into `bookings` with atomic conflict handling |
| BOOK-04 | Available slots reflect the shop's recurring weekly schedule | Slot engine reads `scheduleRules` — `dayOfWeek`, `openTime`, `closeTime`, `slotDurationMinutes` |
| BOOK-05 | Blocked dates/times do not appear as available to clients | Slot engine cross-checks `scheduleExceptions` (`isClosed = true`) before returning slots |
| BOOK-06 | Two clients cannot book the same time slot (atomic reservation) | DB-level unique constraint on `(scheduledAt)` + `onConflictDoNothing` |
| ADMIN-04 | Owner can set recurring weekly availability (open hours per day) | `/admin/schedule` page — 7-row table, Server Action `upsertScheduleRule` |
| ADMIN-05 | Owner can block specific dates or time slots (exceptions) | Full-day blocking only in Phase 3 — `scheduleExceptions` insert via Server Action |
</phase_requirements>

---

## Summary

Phase 3 is the most complex phase of the project. It adds three major capabilities: (1) a multi-step booking wizard for clients, (2) a slot availability engine driven by `scheduleRules` and `scheduleExceptions`, and (3) admin tools for managing the weekly schedule and blocked dates.

The key architectural challenge is that the wizard is a stateful Client Component tree that accumulates selections across four steps, but all data fetches and mutations happen server-side. State flows one-way from Server Components (services list, slot availability) down into Client Components (wizard), then back up via Server Actions (booking submission). Zustand is the right holder for wizard step state — selections live in memory per-session, never in the database until the final confirm step fires the Server Action.

The atomic reservation problem is solved cleanly at the database layer: a unique constraint on `bookings.scheduledAt` plus `INSERT ... ON CONFLICT DO NOTHING` guarantees exactly-once booking with no application-level retry logic needed. If the constraint fires, the Server Action returns a "slot unavailable" error to the client in a single round-trip. This is simpler, faster, and more correct than advisory locks or optimistic retry loops.

**Primary recommendation:** Build the slot engine as a pure TypeScript function (`generateSlots(rule, exceptions, existingBookings, date)`), test it with Vitest unit tests, and call it from a Server Component. All mutations go through Server Actions with Zod validation. Use the existing `db` Drizzle proxy throughout — no new DB infrastructure needed.

---

## Standard Stack

### Core (all already installed in package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^16.2.1 | Server Components + Server Actions | Pattern established in Phases 1–2 |
| Drizzle ORM | ^0.45.1 | DB queries; `onConflictDoNothing` for atomic insert | Already wired via `src/db/index.ts` lazy proxy |
| Zod | ^4.3.6 | Validate booking form input in Server Action | Already in package.json |
| date-fns | ^4.1.0 | Date arithmetic for slot generation and strip rendering | Already installed; v4 is ESM-first, no breaking API for core date math |
| next-intl | ^4.8.3 | i18n for all new booking + admin copy | Already wired; `useTranslations` in Client Components, `getTranslations` in Server Components |
| Zustand | not yet installed | Wizard step state (selections across 4 steps) | Lightweight, no Provider boilerplate, per-session only |
| react-hook-form | not yet installed | Admin schedule form (weekly hours table) | Already in CLAUDE.md recommended stack; pairs with Zod |
| @hookform/resolvers | not yet installed | Zod adapter for react-hook-form | Required when using react-hook-form + Zod together |

### Not needed in Phase 3

| Library | Why Not |
|---------|---------|
| react-day-picker / shadcn Calendar | D-02 mandates a custom horizontal date strip, not a month calendar picker — build a simple scroll container with date pills |
| @supabase/supabase-js | Already installed but not used for DB queries — Drizzle is the only DB access layer per established pattern |

### Installation (packages not yet in package.json)

```bash
npm install zustand react-hook-form @hookform/resolvers
```

**Version verification (as of 2026-03-23):**
- `zustand` — v5.x current (major since Oct 2024, no Provider pattern needed)
- `react-hook-form` — v7.x current (stable, wide ecosystem)
- `@hookform/resolvers` — v3.x current (Zod v4 resolver included)

> Note: Zod v4 (^4.3.6) is installed. Confirm `@hookform/resolvers` v3.x supports Zod v4 — the resolver package tracks Zod releases closely. If a mismatch exists, pin `@hookform/resolvers@3.x` and verify the Zod import path (`zod/v4` vs `zod`).

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/[locale]/
│   ├── book/
│   │   ├── page.tsx                  # Server Component — replaces stub; fetches initial data, renders wizard
│   │   ├── confirmation/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Server Component — auth-gated, reads booking by id
│   │   └── _components/
│   │       ├── BookingWizard.tsx     # Client Component — Zustand state, 4 steps
│   │       ├── DateStrip.tsx         # Client Component — horizontal scroll of day pills
│   │       ├── TimeSlotGrid.tsx      # Client Component — tappable slot buttons
│   │       ├── ServiceSelector.tsx   # Client Component — service cards
│   │       └── ConfirmStep.tsx       # Client Component — summary before submit
│   └── admin/
│       ├── page.tsx                  # Add nav link to /admin/schedule
│       └── schedule/
│           └── page.tsx              # Server Component — renders admin schedule form
│           └── _components/
│               ├── WeeklyHoursForm.tsx   # Client Component — 7-row table
│               └── BlockDateForm.tsx    # Client Component — date picker + block button
├── lib/
│   ├── date-utils.ts                 # Add: generateSlots(), getDayAvailability() pure functions
│   └── actions/
│       ├── booking.ts                # Server Actions: createBooking, getAvailableSlots
│       └── schedule.ts              # Server Actions: upsertScheduleRule, blockDate, unblockDate
└── db/
    └── schema.ts                     # Add: unique constraint on bookings.scheduledAt
```

### Pattern 1: Slot Generation Algorithm

**What:** Pure TypeScript function that takes a `scheduleRule` + `exceptions` + `existingBookings` for a date and returns an array of `{ time: string; available: boolean }`.

**When to use:** Called server-side in a Server Component or Server Action. Never call from client.

```typescript
// src/lib/date-utils.ts  (extend existing file)
// Source: algorithmic — verified against D-05, D-06, D-07

type SlotStatus = { time: string; startsAt: Date; available: boolean };

export function generateSlots(
  rule: { openTime: string; closeTime: string; slotDurationMinutes: number },
  blockedDates: Date[],
  bookedTimestamps: Date[],
  forDate: Date, // UTC midnight of the target date
): SlotStatus[] {
  // 1. If date is in blockedDates → return [] (no slots, day grayed out per D-08)
  // 2. Parse openTime/closeTime "HH:MM" into absolute timestamps for forDate
  // 3. Walk from openTime to closeTime in slotDurationMinutes increments
  // 4. For each slot: available = !bookedTimestamps.includes(slotStart)
  // 5. Return all slots (D-07: booked slots grayed, not hidden)
  const slots: SlotStatus[] = [];
  // ... implementation detail for planner
  return slots;
}
```

**Key gotcha:** `scheduleRules.openTime` is stored as `"HH:MM"` text (e.g., `"10:00"`). To convert to an absolute UTC timestamp for a given date: parse the date in Thailand timezone (UTC+7), combine with HH:MM, then convert to UTC for storage comparison. Use `date-fns` `setHours`, `setMinutes`, and `getTime()` for arithmetic.

### Pattern 2: Wizard State with Zustand

**What:** A single Zustand store holds the wizard's accumulated selections across all 4 steps. The store is reset on wizard mount to prevent stale state between sessions.

```typescript
// src/lib/stores/bookingStore.ts
// Source: Zustand docs pattern, zustand v5

import { create } from 'zustand';

type BookingStore = {
  selectedDate: Date | null;
  selectedTime: string | null;  // "HH:MM"
  selectedServiceId: number | null;
  step: 1 | 2 | 3 | 4;
  setDate: (d: Date) => void;
  setTime: (t: string) => void;
  setService: (id: number) => void;
  setStep: (s: 1 | 2 | 3 | 4) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingStore>((set) => ({
  selectedDate: null,
  selectedTime: null,
  selectedServiceId: null,
  step: 1,
  setDate: (selectedDate) => set({ selectedDate, selectedTime: null, step: 2 }),
  setTime: (selectedTime) => set({ selectedTime, step: 3 }),
  setService: (selectedServiceId) => set({ selectedServiceId, step: 4 }),
  setStep: (step) => set({ step }),
  reset: () => set({ selectedDate: null, selectedTime: null, selectedServiceId: null, step: 1 }),
}));
```

**Note:** Zustand v5 no longer requires a `Provider` wrapper — call `useBookingStore()` directly inside any Client Component.

### Pattern 3: Atomic Booking Reservation (DB-Level)

**What:** Add a unique constraint on `bookings.scheduledAt`. The Server Action uses Drizzle's `onConflictDoNothing`, checks the returned result, and surfaces a user-friendly error if the slot was taken.

**Schema change required** — `bookings` table needs a unique constraint (not currently in `schema.ts`):

```typescript
// src/db/schema.ts — extend bookings table definition
export const bookings = pgTable(
  'bookings',
  {
    // ... existing columns unchanged ...
  },
  (table) => [
    index('bookings_user_id_idx').on(table.userId),
    index('bookings_scheduled_at_idx').on(table.scheduledAt),
    unique('bookings_scheduled_at_unique').on(table.scheduledAt), // NEW — enables atomic reservation
  ],
);
```

**Server Action pattern:**

```typescript
// src/lib/actions/booking.ts
'use server';
// Source: Drizzle ORM insert docs — https://orm.drizzle.team/docs/insert

export async function createBooking(input: BookingInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'unauthorized' };

  const validated = bookingSchema.safeParse(input);
  if (!validated.success) return { error: 'invalid_input' };

  const { serviceId, scheduledAt } = validated.data;

  const result = await db
    .insert(bookings)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      serviceId,
      scheduledAt: new Date(scheduledAt), // UTC timestamp
      status: 'pending',
    })
    .onConflictDoNothing({ target: bookings.scheduledAt })
    .returning({ id: bookings.id });

  // onConflictDoNothing returns [] if the row was not inserted (slot taken)
  if (result.length === 0) return { error: 'slot_unavailable' };

  return { bookingId: result[0].id };
}
```

**Why this works:** PostgreSQL's `INSERT ... ON CONFLICT DO NOTHING` is atomic at the row level under `READ COMMITTED` isolation (the default). Two concurrent inserts for the same `scheduledAt` will serialize at the constraint — exactly one will succeed, the other will silently do nothing and return an empty result set. No application-level retry, advisory lock, or transaction wrapper is needed.

### Pattern 4: Availability Query (Server Component)

```typescript
// src/app/[locale]/book/page.tsx — Server Component fetch
// Source: Drizzle ORM select docs

async function getAvailabilityData(windowStart: Date, windowEnd: Date) {
  const [rules, exceptions, booked] = await Promise.all([
    db.select().from(scheduleRules).where(eq(scheduleRules.isActive, true)),
    db.select().from(scheduleExceptions).where(
      and(
        gte(scheduleExceptions.exceptionDate, windowStart),
        lte(scheduleExceptions.exceptionDate, windowEnd),
        eq(scheduleExceptions.isClosed, true),
      )
    ),
    db.select({ scheduledAt: bookings.scheduledAt }).from(bookings).where(
      and(
        gte(bookings.scheduledAt, windowStart),
        lte(bookings.scheduledAt, windowEnd),
        ne(bookings.status, 'cancelled'),
      )
    ),
  ]);
  return { rules, exceptions, booked };
}
```

Pass this data as props to the Client Component `BookingWizard`. The client does not re-fetch on date selection — it uses the pre-loaded 60-day window.

### Pattern 5: Admin Schedule Server Actions

```typescript
// src/lib/actions/schedule.ts
'use server';

// Upsert a schedule rule for a day of week
export async function upsertScheduleRule(input: ScheduleRuleInput) {
  // Validate admin session — check session.user.email === process.env.ADMIN_EMAIL
  // Use db.insert(scheduleRules).values(...).onConflictDoUpdate(...)
  // Conflict target: dayOfWeek (one rule per day)
}

// Add a full-day block
export async function blockDate(dateStr: string) {
  // Insert into scheduleExceptions with isClosed = true
}

// Remove a full-day block
export async function unblockDate(exceptionId: number) {
  // Delete from scheduleExceptions by id
}
```

### Anti-Patterns to Avoid

- **Client-side slot calculation:** Never compute slot availability in the browser. A client could send an arbitrary `scheduledAt` to the Server Action — the DB constraint is the only authoritative gate.
- **Advisory locks for simple unique slot booking:** Advisory locks require explicit lock/unlock pairs and are error-prone under serverless cold starts. The unique constraint approach is stateless and always correct.
- **Passing `Date` objects through Server Action boundaries:** `Date` objects are not serializable in RSC/Server Action payloads. Pass ISO strings (`string`) and convert to `Date` inside the Server Action.
- **Buddhist Era year in Thai date display:** Always use `formatDateGregorian` from `src/lib/date-utils.ts` with `calendar: 'gregory'`. Never use `Intl.DateTimeFormat` directly without the `calendar` override.
- **Using the `pages/` router or `middleware.ts`:** All new routes follow the established `app/[locale]/` pattern. Admin protection is inherited from `src/app/[locale]/admin/layout.tsx`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Double-booking prevention | Application-level lock, mutex, retry loop | `unique()` constraint + `onConflictDoNothing` | DB constraint is atomic under concurrent load; app-level locks fail under serverless |
| Form validation in Server Action | Manual if/else type checks | Zod `safeParse` | Reuses the same schema from the client form; surfaces structured errors |
| Wizard state across steps | Custom React context, `useState` chain, URL params | Zustand store | URL params expose partial booking state; prop drilling is fragile across 4 steps |
| Date arithmetic for slot windows | Hand-rolled date math | `date-fns` `addDays`, `startOfDay`, `isSameDay`, `format` | Edge cases with DST transitions, month boundaries, leap years |
| Thai date display | Raw `Intl.DateTimeFormat` calls | `formatDateGregorian` (already in `src/lib/date-utils.ts`) | Existing utility enforces `calendar: 'gregory'` — prevents Buddhist Era year bug |
| Admin form state | Raw `useState` for each field | `react-hook-form` + Zod | Weekly hours form has 21 fields (7 days × 3 inputs); RHF handles dirty state, submit, and reset cleanly |

**Key insight:** The bookings schema has no unique constraint on `scheduledAt` yet — this must be added in Wave 0 (schema migration step). Without it, `onConflictDoNothing` has no constraint to target and will not prevent double-booking.

---

## Common Pitfalls

### Pitfall 1: Missing Unique Constraint — Silent Double Booking
**What goes wrong:** `onConflictDoNothing` is called but `bookings.scheduledAt` has no unique constraint. Both concurrent inserts succeed. Two bookings exist for the same slot.
**Why it happens:** The existing schema only has an index (`bookings_scheduled_at_idx`), not a unique constraint. An index speeds up lookups; a unique constraint enforces uniqueness.
**How to avoid:** Add `unique('bookings_scheduled_at_unique').on(table.scheduledAt)` to the `bookings` table definition and run `drizzle-kit push` in Wave 0 before any booking logic is written.
**Warning signs:** Look for `UNIQUE` keyword in Supabase table inspector for the `bookings` table. If it shows only `INDEX`, the constraint is missing.

### Pitfall 2: scheduleExceptions.exceptionDate Timezone Mismatch
**What goes wrong:** Admin blocks "March 25". The stored timestamp is `2025-03-25T17:00:00Z` (midnight Bangkok = UTC-7). When the slot engine queries for March 25, it uses UTC midnight, missing the exception.
**Why it happens:** `exceptionDate` is stored as `timestamp with timezone`. Inserting a local midnight without timezone conversion stores the wrong UTC value.
**How to avoid:** When blocking a date, always convert to UTC from Bangkok time (UTC+7). Use `date-fns` `startOfDay` in the Bangkok timezone context, or simply store the date as `YYYY-MM-DD` text and compare dates only. Recommend adding a `exceptionDateStr text` column or using `date` type for clarity — but since the schema is already deployed with `timestamp`, ensure the insert always uses noon UTC (12:00:00Z) as the canonical representation for a full-day block, then compare with `DATE_TRUNC('day', ...)` in queries.
**Warning signs:** Owner blocks a date and clients still see slots available that day.

### Pitfall 3: Passing Date Objects Across Server Action Boundary
**What goes wrong:** Client sends `{ scheduledAt: new Date('2025-03-25T10:00:00') }` to the Server Action. `Date` objects are not serializable — Next.js Server Actions serialize arguments as JSON. The date arrives as a string or `undefined`.
**Why it happens:** RSC payload serialization converts `Date` to string automatically in some contexts but not all. Behavior is inconsistent.
**How to avoid:** Always pass dates as ISO 8601 strings from Client Components to Server Actions: `{ scheduledAt: selectedDate.toISOString() }`. Convert back to `Date` inside the Server Action after Zod validation.
**Warning signs:** `scheduledAt` arriving as `undefined` or as an unexpected string format.

### Pitfall 4: Buddhist Era Year in Date Strip
**What goes wrong:** Date strip shows "พ.ศ. 2568" (Buddhist Era) in Thai locale for 2025 Gregorian.
**Why it happens:** `Intl.DateTimeFormat` with `th-TH` locale defaults to Buddhist Era calendar.
**How to avoid:** Use `formatDateGregorian` from `src/lib/date-utils.ts` for all date display. For the date strip pill labels (short day/date format), pass `{ month: 'short', day: 'numeric', calendar: 'gregory' }`.
**Warning signs:** Year displayed is 543 greater than expected.

### Pitfall 5: Zustand Store Persists Between User Sessions
**What goes wrong:** User A books, logs out. User B logs in on the same browser. Zustand store still holds User A's wizard selections. User B sees wrong pre-filled state.
**Why it happens:** Zustand store is module-level — it persists for the lifetime of the browser tab.
**How to avoid:** Call `reset()` from the Zustand store in `BookingWizard`'s `useEffect` on mount, or whenever the session user changes.

### Pitfall 6: scheduleRules dayOfWeek Convention
**What goes wrong:** Schema comment says `0 = Sunday, 6 = Saturday`. `date-fns getDay()` also uses `0 = Sunday`. JavaScript `Date.getDay()` uses `0 = Sunday`. All three agree — but if admin UI labels days as Mon–Sun starting at index 1, an off-by-one error in the lookup will cause Sunday slots to appear on Monday.
**How to avoid:** The weekly hours table (D-09) shows Mon–Sun visually but stores `dayOfWeek` as 1–7 or 0–6 per schema. Map display order to storage values explicitly in the form. Use the schema comment convention (0=Sunday, 6=Saturday) throughout — no custom mapping.

---

## Code Examples

### Slot Generation (pure function)

```typescript
// src/lib/date-utils.ts — add to existing file
import { addMinutes, isSameDay, startOfDay, getHours, getMinutes, setHours, setMinutes } from 'date-fns';

export function generateSlotsForDate(params: {
  rule: { openTime: string; closeTime: string; slotDurationMinutes: number } | undefined;
  blockedDates: Date[];
  bookedTimestamps: Date[];
  targetDate: Date;
}): { time: string; startsAt: Date; available: boolean }[] {
  const { rule, blockedDates, bookedTimestamps, targetDate } = params;

  // No rule for this day of week → no slots
  if (!rule) return [];

  // Day is blocked → no slots (D-08: day grayed out entirely)
  const isBlocked = blockedDates.some((d) => isSameDay(d, targetDate));
  if (isBlocked) return [];

  const [openH, openM] = rule.openTime.split(':').map(Number);
  const [closeH, closeM] = rule.closeTime.split(':').map(Number);

  const dayBase = startOfDay(targetDate);
  let cursor = setMinutes(setHours(dayBase, openH), openM);
  const closeTime = setMinutes(setHours(dayBase, closeH), closeM);

  const slots: { time: string; startsAt: Date; available: boolean }[] = [];

  while (cursor < closeTime) {
    const isBooked = bookedTimestamps.some(
      (b) => Math.abs(b.getTime() - cursor.getTime()) < 60_000 // within 1 minute
    );
    slots.push({
      time: `${String(getHours(cursor)).padStart(2, '0')}:${String(getMinutes(cursor)).padStart(2, '0')}`,
      startsAt: cursor,
      available: !isBooked,
    });
    cursor = addMinutes(cursor, rule.slotDurationMinutes);
  }

  return slots;
}
```

### Booking Server Action

```typescript
// src/lib/actions/booking.ts
'use server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const bookingSchema = z.object({
  serviceId: z.number().int().positive(),
  scheduledAt: z.string().datetime(), // ISO 8601 string from client
});

export async function createBooking(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'unauthorized' as const };

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { error: 'invalid_input' as const };

  const result = await db
    .insert(bookings)
    .values({
      userId: session.user.id,
      serviceId: parsed.data.serviceId,
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: 'pending',
    })
    .onConflictDoNothing({ target: bookings.scheduledAt })
    .returning({ id: bookings.id });

  if (result.length === 0) return { error: 'slot_unavailable' as const };
  return { bookingId: result[0].id };
}
```

### Date Strip (horizontal scroll, tappable day pills)

```tsx
// src/app/[locale]/book/_components/DateStrip.tsx
'use client';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { formatDateGregorian } from '@/lib/date-utils';
import { useBookingStore } from '@/lib/stores/bookingStore';

type Props = {
  availableDays: Date[];   // days in 60-day window that have >= 1 slot
  locale: string;
};

export function DateStrip({ availableDays, locale }: Props) {
  const { selectedDate, setDate } = useBookingStore();
  const today = startOfDay(new Date());
  const days = Array.from({ length: 60 }, (_, i) => addDays(today, i));

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
      {days.map((day) => {
        const isAvailable = availableDays.some((d) => isSameDay(d, day));
        const isSelected = selectedDate && isSameDay(selectedDate, day);
        return (
          <button
            key={day.toISOString()}
            disabled={!isAvailable}
            onClick={() => setDate(day)}
            className={[
              'shrink-0 snap-start flex flex-col items-center px-3 py-2 rounded-xl text-sm',
              isSelected ? 'bg-[#755944] text-white' : '',
              !isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <span>{format(day, 'EEE')}</span>
            <span>{format(day, 'd')}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### Admin Schema Upsert

```typescript
// src/lib/actions/schedule.ts
'use server';
import { db } from '@/db';
import { scheduleRules, scheduleExceptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

async function assertAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('unauthorized');
  }
}

const scheduleRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean(),
});

export async function upsertScheduleRule(input: unknown) {
  await assertAdmin();
  const parsed = scheduleRuleSchema.safeParse(input);
  if (!parsed.success) return { error: 'invalid_input' as const };

  await db
    .insert(scheduleRules)
    .values({ ...parsed.data, slotDurationMinutes: 120 })
    .onConflictDoUpdate({
      target: scheduleRules.dayOfWeek,
      set: {
        openTime: parsed.data.openTime,
        closeTime: parsed.data.closeTime,
        isActive: parsed.data.isActive,
      },
    });

  return { ok: true };
}
```

> Note: `onConflictDoUpdate` on `scheduleRules.dayOfWeek` requires a unique constraint on `dayOfWeek` — add `unique('schedule_rules_day_of_week_unique').on(table.dayOfWeek)` to `scheduleRules` table definition. This is a Wave 0 schema task.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Advisory locks for booking atomicity | DB unique constraint + `ON CONFLICT DO NOTHING` | Postgres 9.5+ (2016) — always the right approach for stateless serverless | Simpler, no lock cleanup needed |
| `useState` chains for multi-step forms | Zustand store (v4/v5) | 2021–2024 | No Provider, direct store access, resets cleanly |
| `middleware.ts` for Next.js routing | `proxy.ts` pattern | Phase 1 decision, maintained through Phase 2 | All routing logic stays in `src/proxy.ts` |
| Zustand v4 `Provider` wrapping | Zustand v5 (no Provider) | Oct 2024 | Create store with `create()`, use directly in any Client Component |
| `Intl.DateTimeFormat` raw for Thai | `formatDateGregorian` with `calendar: 'gregory'` | Phase 1 decision | Mandatory; prevents Buddhist Era year display |

**Note on scheduleRules upsert:** The current `scheduleRules` table has no unique constraint on `dayOfWeek`. The table only has a primary key `id`. A unique constraint on `dayOfWeek` must be added before the admin upsert pattern works. Alternatively, use a `SELECT` + conditional `INSERT` or `UPDATE` — but the unique constraint + `onConflictDoUpdate` pattern is cleaner and atomic.

---

## Open Questions

1. **scheduleRules: is one row per dayOfWeek enforced or multiple rows per day allowed?**
   - What we know: The schema has no unique constraint on `dayOfWeek`. Multiple rows with the same `dayOfWeek` are currently possible.
   - What's unclear: Is the intent one active rule per day (upsert pattern) or multiple rules per day (multiple time windows)?
   - Recommendation: D-09 specifies "one row per day" (Mon–Sun table). Add unique constraint on `dayOfWeek` + add schema migration in Wave 0. The admin UI should reflect one row per day.

2. **scheduleExceptions: what is the canonical time for a full-day block?**
   - What we know: `exceptionDate` is `timestamp with timezone`. The admin picks a date; no time component is meaningful for a full-day block.
   - What's unclear: Store as midnight UTC? noon UTC? or use a `date`-type column?
   - Recommendation: Since the schema is already deployed, store as noon UTC (12:00:00Z) for the blocked date. Query with `DATE_TRUNC('day', exception_date AT TIME ZONE 'UTC+7') = target_date` or simply compare day/month/year fields. Document the convention in a code comment.

3. **StickyMandateBar "Book Now" href**
   - What we know: `src/components/layout/StickyMandateBar.tsx` has `href="#"` per Phase 1 D-12.
   - What's unclear: Wire to `/[locale]/book` — the locale is not available in this Client Component directly.
   - Recommendation: Use next-intl's `Link` from `@/i18n/navigation` (already used in the component) and change `href="#"` to `href="/book"` — next-intl's `Link` automatically prepends the current locale prefix.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (unit) + Playwright 1.58.x (E2E) |
| Unit config | `vitest.config.ts` — tests in `tests/unit/**/*.test.ts` |
| E2E config | `playwright.config.ts` — tests in `tests/*.spec.ts`, runs on Mobile Chrome (Pixel 5) |
| Quick run (unit) | `npx vitest run tests/unit/` |
| Full suite (E2E) | `npx playwright test` (requires `next dev` running) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOOK-01 | Date strip renders 60 days; grayed days are untappable | E2E | `npx playwright test tests/booking.spec.ts` | ❌ Wave 0 |
| BOOK-02 | Service selector shows name and price | E2E | `npx playwright test tests/booking.spec.ts` | ❌ Wave 0 |
| BOOK-03 | Full booking flow completes and redirects to confirmation | E2E | `npx playwright test tests/booking.spec.ts` | ❌ Wave 0 |
| BOOK-04 | Slot engine returns slots matching scheduleRules | Unit | `npx vitest run tests/unit/slot-engine.test.ts` | ❌ Wave 0 |
| BOOK-05 | Blocked date returns no slots | Unit | `npx vitest run tests/unit/slot-engine.test.ts` | ❌ Wave 0 |
| BOOK-06 | Second insert for same slot returns `slot_unavailable` | Unit (mock DB) | `npx vitest run tests/unit/booking-action.test.ts` | ❌ Wave 0 |
| ADMIN-04 | Weekly hours table saves and persists | E2E | `npx playwright test tests/admin-schedule.spec.ts` | ❌ Wave 0 |
| ADMIN-05 | Blocked date prevents client from seeing slots | E2E | `npx playwright test tests/admin-schedule.spec.ts` | ❌ Wave 0 |

**Sampling rate:**
- Per task commit: `npx vitest run tests/unit/` (< 5s, no server needed)
- Per wave merge: `npx vitest run tests/unit/ && npx playwright test`
- Phase gate: Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/unit/slot-engine.test.ts` — covers BOOK-04, BOOK-05; pure function, no DB needed
- [ ] `tests/unit/booking-action.test.ts` — covers BOOK-06; mock `db.insert` to simulate conflict
- [ ] `tests/booking.spec.ts` — covers BOOK-01, BOOK-02, BOOK-03 (E2E; requires seeded DB)
- [ ] `tests/admin-schedule.spec.ts` — covers ADMIN-04, ADMIN-05 (E2E; requires admin session mock or real owner login)
- [ ] Schema migration: unique constraint on `bookings.scheduledAt` and `scheduleRules.dayOfWeek` — run `drizzle-kit push` before any test

---

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` — bookings, scheduleRules, scheduleExceptions column definitions and indexes confirmed by direct file read
- `package.json` — confirmed installed versions: date-fns ^4.1.0, drizzle-orm ^0.45.1, zod ^4.3.6, next-intl ^4.8.3, Playwright ^1.58.2, vitest ^4.1.0
- [Drizzle ORM Insert docs](https://orm.drizzle.team/docs/insert) — `onConflictDoNothing` and `onConflictDoUpdate` syntax verified by WebFetch
- [Drizzle ORM Indexes & Constraints docs](https://orm.drizzle.team/docs/indexes-constraints) — `unique().on()` multi-column syntax verified by WebFetch
- [PostgreSQL docs: INSERT ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html) — atomicity guarantee confirmed
- `03-CONTEXT.md` — all D-01 through D-16 decisions read directly

### Secondary (MEDIUM confidence)
- [date-fns v4.0 announcement blog](https://blog.date-fns.org/v40-with-time-zone-support/) — v4 is ESM-first; no major breaking changes to core date math functions used here
- [WebSearch: react-hook-form + Zod + Server Actions pattern](https://medium.com/@ctrlaltmonique/how-to-use-react-hook-form-zod-with-next-js-server-actions-437aaca3d72d) — verified pattern consistent across multiple sources
- Zustand v5 no-Provider pattern — confirmed via Zustand GitHub releases knowledge (Oct 2024)

### Tertiary (LOW confidence — flag for validation)
- `@hookform/resolvers` Zod v4 compatibility — Zod v4 (^4.3.6) is installed; resolver v3 may need `zod/v4` import path. Verify before implementing admin form.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all core packages confirmed in package.json; only Zustand/RHF need installation
- Architecture: HIGH — patterns derived from existing Phase 1–2 codebase and confirmed Drizzle docs
- Slot algorithm: HIGH — pure TypeScript, no external dependencies beyond date-fns
- Atomic reservation: HIGH — PostgreSQL unique constraint + onConflictDoNothing verified from official docs
- Pitfalls: HIGH for Buddhist Era / timezone issues (observed in Phase 1); MEDIUM for Zustand session persistence (common pattern issue)

**Research date:** 2026-03-23
**Valid until:** 2026-04-22 (30 days — stable stack)
