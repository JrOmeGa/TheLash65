# Requirements: Lash Booking

**Defined:** 2026-03-22
**Core Value:** Clients can book lash extension appointments online and pay via PromptPay, replacing manual scheduling over chat.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: Client can sign up and log in via Google SSO
- [ ] **AUTH-02**: Client can sign up and log in via Facebook SSO
- [ ] **AUTH-03**: Client session persists across browser refresh
- [ ] **AUTH-04**: Only authenticated clients can submit a booking

### Booking

- [ ] **BOOK-01**: Client can view available date and time slots on a calendar picker
- [ ] **BOOK-02**: Client can select a service type and see its cost before booking
- [ ] **BOOK-03**: Client can confirm a booking after selecting date, time, and service
- [ ] **BOOK-04**: Available slots reflect the shop's recurring weekly schedule
- [ ] **BOOK-05**: Blocked dates/times do not appear as available to clients
- [ ] **BOOK-06**: Two clients cannot book the same time slot (atomic reservation)

### Payment

- [ ] **PAY-01**: Client sees PromptPay QR code with the correct service amount after booking
- [ ] **PAY-02**: Client can download the PromptPay QR code as an image
- [ ] **PAY-03**: PromptPay QR is generated server-side (owner phone number not exposed in client code)

### Admin

- [ ] **ADMIN-01**: Owner can view all bookings in a dashboard (upcoming, past, pending payment)
- [ ] **ADMIN-02**: Owner can confirm payment received to finalize a booking
- [ ] **ADMIN-03**: Owner can cancel a booking
- [ ] **ADMIN-04**: Owner can set recurring weekly availability (open hours per day)
- [ ] **ADMIN-05**: Owner can block specific dates or time slots (exceptions)
- [ ] **ADMIN-06**: Admin pages are protected — only the owner can access them

### Public Site

- [ ] **SITE-01**: Client can view a portfolio gallery of lash work photos
- [ ] **SITE-02**: Client can view the full service menu with descriptions and prices
- [ ] **SITE-03**: Client can view the about page with owner info and contact details
- [ ] **SITE-04**: Site is mobile-first with responsive design across all screen sizes

### Notifications

- [ ] **NOTIF-01**: Client receives an email confirmation when their booking is confirmed (payment verified)
- [ ] **NOTIF-02**: Owner receives an email alert when a new booking is placed

### Internationalization

- [ ] **I18N-01**: Site supports Thai and English languages
- [ ] **I18N-02**: User can toggle between Thai and English from any page
- [ ] **I18N-03**: Dates display correctly in both locales (Gregorian calendar, no Buddhist Era offset)

## v2 Requirements

### LINE Integration

- **LINE-01**: Client can sign up and log in via LINE Login SSO
- **LINE-02**: Client receives LINE message when booking is confirmed
- **LINE-03**: Owner receives LINE notification when new booking is placed
- **LINE-04**: Booking confirmation includes deep link back to booking details

### Enhanced Notifications

- **NOTIF-03**: Client receives email reminder 24 hours before appointment
- **NOTIF-04**: Owner receives daily summary email of next day's bookings

### Client Experience

- **CLIENT-01**: Client can view their booking history
- **CLIENT-02**: Client can cancel or request reschedule of upcoming booking
- **CLIENT-03**: Client can rebook a previous service with one tap

## Out of Scope

| Feature | Reason |
|---------|--------|
| Online payment gateway (Stripe/Omise) | PromptPay QR with manual confirmation sufficient for solo operator; no gateway fees |
| Automated payment verification (slip OCR/banking API) | Complex, expensive, regulated; manual confirmation fast enough for solo volume |
| Real-time chat | Duplicates LINE; clients can message owner directly via LINE handle on contact page |
| Loyalty points / rewards | Overkill at solo-operator scale; clients return for quality |
| Review / rating system | Requires moderation; portfolio gallery serves as social proof |
| Multi-staff scheduling | Solo technician — single calendar only |
| Native mobile app | Mobile-first responsive web covers the booking use case |
| SMS reminders | Email sufficient for v1; LINE covers Thai market in v2 |
| Deposit collection via card | Requires payment gateway; cultural friction in Thai market |
| Waitlist management | Overkill for solo operator volume |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| BOOK-01 | Phase 3 | Pending |
| BOOK-02 | Phase 3 | Pending |
| BOOK-03 | Phase 3 | Pending |
| BOOK-04 | Phase 3 | Pending |
| BOOK-05 | Phase 3 | Pending |
| BOOK-06 | Phase 3 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| ADMIN-04 | Phase 3 | Pending |
| ADMIN-05 | Phase 3 | Pending |
| ADMIN-06 | Phase 2 | Pending |
| SITE-01 | Phase 1 | Pending |
| SITE-02 | Phase 1 | Pending |
| SITE-03 | Phase 1 | Pending |
| SITE-04 | Phase 1 | Pending |
| NOTIF-01 | Phase 5 | Pending |
| NOTIF-02 | Phase 5 | Pending |
| I18N-01 | Phase 1 | Pending |
| I18N-02 | Phase 1 | Pending |
| I18N-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after roadmap creation — all 28 requirements mapped*
