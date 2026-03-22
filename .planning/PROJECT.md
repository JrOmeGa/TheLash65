# Lash Booking

## What This Is

A mobile-first, bilingual (Thai/English) website for a solo eyelash extension technician. Clients can browse the portfolio, view services and pricing, and book appointments online. The booking flow uses PromptPay QR payment with manual confirmation by the shop owner. Includes an admin dashboard for managing schedule and bookings.

## Core Value

Clients can book lash extension appointments online and pay via PromptPay, replacing manual scheduling over chat.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Client can view portfolio/gallery of lash work
- [ ] Client can view about page and contact information
- [ ] Client can view full service menu with prices
- [ ] Client can select available date and time slot from calendar
- [ ] Client can select service type and see cost
- [ ] Client must log in via SSO (Facebook/Google/Line) to confirm booking
- [ ] Client sees PromptPay QR code and can download the image
- [ ] Shop owner can confirm payment received to finalize booking
- [ ] Client receives email confirmation of booking
- [ ] Client receives Line notification of booking confirmation
- [ ] Shop owner receives Line notification of new booking
- [ ] Shop owner can view all bookings in admin dashboard
- [ ] Shop owner can manage weekly recurring schedule with exception blocking
- [ ] Site supports Thai and English with language toggle
- [ ] Site is mobile-first with responsive design

### Out of Scope

- Online payment gateway (Stripe, Omise) — PromptPay QR with manual confirmation is sufficient for solo operator
- Real-time chat — clients can use Line/phone for direct contact
- Multi-staff scheduling — solo technician, one calendar
- Native mobile app — mobile-first web is sufficient
- Automated payment verification — manual confirmation by shop owner

## Context

- Solo lash technician operating in Thailand
- Target audience: Thai clients, primarily booking from mobile devices
- PromptPay is the standard Thai payment method — QR code displayed, client pays via banking app
- Line is the dominant messaging platform in Thailand — critical for notifications
- SSO via Line is important alongside Facebook/Google for Thai market
- Owner has existing logo and design system ready to apply
- Services are a fixed menu (e.g., Classic, Hybrid, Volume) with set prices
- Schedule is recurring weekly hours with ability to block off specific dates/times

## Constraints

- **Market**: Thailand — PromptPay, Line integration, Thai language support are non-negotiable
- **Payment**: Manual confirmation flow (no payment gateway integration)
- **Operator**: Single person — admin UX must be simple and fast
- **Design**: Mobile-first, existing branding to be applied via UI-SPEC later

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PromptPay QR (manual) over payment gateway | Solo operator, simpler setup, no gateway fees | — Pending |
| SSO-only auth (no email/password) | Reduces friction, leverages existing accounts, Line SSO for Thai market | — Pending |
| Fixed service menu over customizable options | Simpler for v1, matches how solo techs typically operate | — Pending |
| Bilingual TH/EN | Serves both Thai and expat clients | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-22 after initialization*
