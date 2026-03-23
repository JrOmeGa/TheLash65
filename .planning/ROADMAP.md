# Roadmap: Lash Booking

## Overview

Build a mobile-first, bilingual (Thai/English) online booking site for a solo lash extension technician in Thailand. The project starts by laying an unbreakable foundation — i18n routing and the public site — then adds authentication, the booking core (the highest-complexity phase), payment display, notifications, and finally the admin dashboard. Each phase delivers a coherent, verifiable capability. Every v1 requirement is covered.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Running Next.js app with bilingual routing, public pages, and database schema deployed (completed 2026-03-22)
- [x] **Phase 2: Authentication** - Clients can sign in via Google/Facebook SSO and stay authenticated (completed 2026-03-22)
- [ ] **Phase 3: Booking Core** - Clients can browse slots and reserve appointments; double-booking is impossible
- [ ] **Phase 4: Payment Display** - Clients see a PromptPay QR code with the correct amount after booking
- [ ] **Phase 5: Notifications** - Owner and client both receive alerts at the right booking lifecycle events
- [ ] **Phase 6: Admin Dashboard** - Owner can manage all bookings, confirm payments, and control schedule

## Phase Details

### Phase 1: Foundation
**Goal**: A deployed, publicly accessible site with bilingual routing, the full public content, and the database schema ready for business logic
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, I18N-01, I18N-02, I18N-03
**Success Criteria** (what must be TRUE):
  1. Visitor can browse the portfolio gallery, service menu, and about page on a mobile device without horizontal scrolling
  2. Visitor can switch between Thai and English from any page and the entire page content updates to the selected language
  3. Dates displayed on the site show the correct Gregorian year (not Buddhist Era) regardless of browser locale
  4. The site is live on a public URL (Vercel deployment) and all public routes load without errors
  5. Database schema is deployed to Supabase with all tables for users, bookings, schedules, and services
**Plans**: TBD

### Phase 2: Authentication
**Goal**: Clients can create accounts and stay logged in via Google or Facebook SSO; the admin route is protected from non-owners
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, ADMIN-06
**Success Criteria** (what must be TRUE):
  1. Client can sign in with a Google account and is redirected back to the site as an authenticated user
  2. Client can sign in with a Facebook account and is redirected back to the site as an authenticated user
  3. Client's login state persists after closing and reopening the browser tab (session survives refresh)
  4. An unauthenticated client who tries to submit a booking is redirected to the login page
  5. Navigating to any admin route as a non-owner returns a 403 or redirect — never shows admin content
**Plans:** 2/2 plans complete

Plans:
- [x] 02-01-PLAN.md — Auth infrastructure: Better Auth + Drizzle schema + API route + proxy.ts
- [x] 02-02-PLAN.md — Auth UI: booking page stub, header avatar, admin protection, E2E tests

### Phase 3: Booking Core
**Goal**: Clients can browse real available slots driven by the owner's schedule and reserve an appointment atomically — two clients can never book the same slot
**Depends on**: Phase 2
**Requirements**: BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, ADMIN-04, ADMIN-05
**Success Criteria** (what must be TRUE):
  1. Client can see available time slots on a calendar that reflect the shop's recurring weekly hours
  2. Slots the owner has blocked (specific date or time) do not appear as available to any client
  3. Client can select a service, see its price, choose a date and time, and submit a confirmed booking
  4. If two clients attempt to book the same slot simultaneously, exactly one succeeds and the other receives an "unavailable" response
  5. Owner can set weekly recurring open hours and block specific dates or time slots via the admin interface
**Plans:** 3/4 plans executed

Plans:
- [x] 03-01-PLAN.md — Data layer: schema migration (unique constraint), slot engine, Zustand store, Server Actions, i18n messages
- [x] 03-02-PLAN.md — Booking wizard UI: DateStrip, TimeSlotGrid, ServiceSelector, ConfirmStep, BookingWizard orchestrator
- [x] 03-03-PLAN.md — Admin schedule management: WeeklyHoursForm, BlockDateForm, admin nav link
- [ ] 03-04-PLAN.md — Confirmation page, StickyMandateBar wiring, visual integration verification

### Phase 4: Payment Display
**Goal**: After confirming a booking, the client sees a PromptPay QR code for the exact service amount, generated server-side so the owner's phone number never appears in client code
**Depends on**: Phase 3
**Requirements**: PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):
  1. Client sees a PromptPay QR code displaying the correct service amount immediately after booking confirmation
  2. Client can download the QR code as an image file from the confirmation page
  3. The owner's PromptPay phone number cannot be found in any client-side JavaScript bundle or network response
**Plans**: TBD

### Phase 5: Notifications
**Goal**: The owner receives an alert when a new booking is placed; the client receives confirmation when payment is verified — delivered via email
**Depends on**: Phase 4
**Requirements**: NOTIF-01, NOTIF-02
**Success Criteria** (what must be TRUE):
  1. Owner receives an email alert within minutes of a new booking being placed, including the client name, service, and appointment time
  2. Client receives an email confirmation after the owner marks payment as received, including booking details and appointment time
**Plans**: TBD

### Phase 6: Admin Dashboard
**Goal**: The owner has a single dashboard to view all bookings by status, confirm payments, and cancel bookings — covering the complete post-booking management workflow
**Depends on**: Phase 5
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03
**Success Criteria** (what must be TRUE):
  1. Owner can view all bookings grouped by status (upcoming, pending payment, past) in the admin dashboard
  2. Owner can tap a single action on a pending booking to mark payment as received and finalize it
  3. Owner can cancel any booking from the dashboard
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-22 |
| 2. Authentication | 2/2 | Complete   | 2026-03-22 |
| 3. Booking Core | 3/4 | In Progress|  |
| 4. Payment Display | 0/TBD | Not started | - |
| 5. Notifications | 0/TBD | Not started | - |
| 6. Admin Dashboard | 0/TBD | Not started | - |
