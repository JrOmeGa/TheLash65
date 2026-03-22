# Feature Research

**Domain:** Lash extension / beauty service booking website — solo operator, Thailand market
**Researched:** 2026-03-22
**Confidence:** HIGH (core features), MEDIUM (Thailand-specific integrations)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Service menu with prices | Clients won't book without knowing what they're getting and what it costs | LOW | Fixed menu (Classic, Hybrid, Volume) with set prices; no configuration needed |
| Portfolio / work gallery | Lash work is visual — clients judge quality by seeing results before booking | LOW | Grid of before/after or finished-look photos; no special tech needed |
| Calendar-based slot selection | Online booking means choosing time, not calling for availability | MEDIUM | Show available vs blocked slots; recurring weekly schedule with exception handling |
| Booking confirmation | Clients need proof their appointment was accepted | LOW | Email confirmation + LINE message; includes date, time, service, price |
| Contact / about page | Clients need to know who they're booking with and how to reach the owner | LOW | Location, phone/LINE handle, brief bio |
| Mobile-first layout | Thai beauty clients book primarily from phones | LOW | Responsive design; large tap targets; no horizontal scroll |
| Bilingual support (TH/EN) | Thai clients + expat clients; both audiences are real | MEDIUM | Language toggle; all UI strings externalized; date/currency format awareness |
| Admin dashboard for owner | Owner must see, manage, and confirm bookings | MEDIUM | List of upcoming bookings; ability to confirm/cancel; schedule management |
| Owner receives new booking alert | Solo operator cannot monitor a dashboard continuously | LOW | LINE notification to owner when new booking is placed |

### Differentiators (Competitive Advantage)

Features that set this product apart from generic platforms. Aligned with Thailand solo-operator context.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| PromptPay QR at checkout | Standard Thai payment method — clients expect it; avoids gateway friction and fees | MEDIUM | Generate static or dynamic QR at booking step; owner manually confirms payment received; no API integration required for MVP |
| LINE Login (SSO) | LINE has 46M MAU in Thailand — using an existing account reduces sign-up friction significantly | MEDIUM | OAuth 2.0 / OpenID Connect via LINE Login API; return user profile (name, avatar) for prefilling booking form |
| LINE notification to client | Confirmation delivered where clients already are — not email they may ignore | MEDIUM | LINE Messaging API; reply messages (free); push messages count against free tier (200/month on free plan) |
| Manual payment confirmation flow | Matches how solo Thai operators actually run their business; no gateway fees; owner keeps control | LOW | Admin marks booking "paid/confirmed"; triggers confirmation messages to client |
| Recurring schedule with date-block exceptions | Solo operator reality — standard weekly hours with occasional days off or holidays | MEDIUM | Weekly template + exception overrides (full day or specific slot blocks) |
| Client auth required before booking | Ties booking to a real identity; reduces ghost bookings without requiring a deposit system | LOW | SSO login gate before the final booking step; no email/password to manage |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but create problems for this specific context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Automated payment verification (slip upload + OCR or banking API) | Clients want instant confirmation; owner wants less manual work | Requires integration with Thai banking APIs (complex, expensive, regulated); OCR for slip images is error-prone; creates false confidence in payment state | Owner manually confirms in admin panel — fast enough for solo volume; LINE notification makes the workflow clear |
| Online payment gateway (Stripe / Omise / Promptpay API) | Modern, instant payment processing | Adds gateway fees per transaction; setup complexity; Omise/Stripe require business registration docs; unnecessary for solo operator managing 4-8 bookings/day | PromptPay QR (static or dynamic) with manual owner confirmation |
| Real-time chat / in-app messaging | Clients want to ask questions | Adds significant complexity; creates support obligation; duplicates LINE which clients already use | Prominent LINE handle / LINE QR on contact page — clients message directly |
| Loyalty points / rewards system | Client retention incentive | High complexity for negligible benefit at solo-operator scale; clients come back for quality, not points | Excellent service + easy rebooking flow |
| Review / rating system | Social proof | Requires moderation; negative reviews create owner stress; for a solo operator, word-of-mouth and Instagram portfolio carry more weight | Portfolio gallery + optional testimonial section (static, curated by owner) |
| Waitlist management | Fill cancellation slots | Overkill for solo operator volume; adds booking state complexity | Owner manually reaches out via LINE when a slot opens |
| Multi-staff scheduling | Scalability | Solo technician; unnecessary now; adds schema and UI complexity that has no current value | Single calendar tied to one technician |
| Native mobile app (iOS/Android) | Better mobile experience | Development and maintenance cost; mobile-first web covers the use case for a booking site | Mobile-first responsive web |
| SMS reminders | Broader reach than LINE | LINE penetration in Thailand is effectively universal (46M MAU / ~70M population); SMS adds cost with minimal benefit for this market | LINE notifications only |
| Deposit collection via card | No-show prevention | Requires payment gateway; adds friction; cultural fit in Thai market is lower than Western markets | LINE notification reminders + clear cancellation policy displayed at booking |

---

## Feature Dependencies

```
[Service Menu]
    └──required-by──> [Slot Selection / Calendar]
                          └──required-by──> [Booking Flow]
                                                └──required-by──> [PromptPay QR Display]
                                                └──required-by──> [Booking Confirmation]
                                                └──required-by──> [Admin Dashboard]

[Line Login SSO]
    └──gates──> [Booking Flow]
                    (client must be authenticated before confirming booking)

[Admin: Schedule Management]
    └──feeds──> [Calendar / Slot Availability]

[Admin: Payment Confirmation]
    └──triggers──> [LINE Notification to Client]
    └──triggers──> [Email Confirmation to Client]

[LINE Messaging API]
    └──powers──> [Owner alert: new booking]
    └──powers──> [Client alert: booking confirmed]

[Bilingual TH/EN]
    └──applies-to──> [ALL user-facing features]
```

### Dependency Notes

- **Booking Flow requires Service Menu:** Client must select a service (and see its price) before a time slot can be shown — price affects session duration, which affects calendar availability.
- **Booking Flow requires Calendar:** Slot selection depends on the owner's configured schedule and any blocked dates.
- **LINE Login gates Booking Flow:** Authentication must be complete before a booking is submitted — this ties a real identity to each reservation.
- **Admin Confirmation triggers Client Notification:** The LINE message to the client is sent after the owner marks payment as received — not automatically on booking submission. This reflects the manual PromptPay flow.
- **Schedule Management feeds Calendar:** The admin recurring-schedule + exception system is the source of truth for what slots appear as available.
- **Bilingual support is cross-cutting:** Every feature that renders user-facing text must support TH/EN toggle — this is a constraint on every component, not a standalone feature.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to replace manual scheduling over LINE chat.

- [ ] Service menu with prices — clients need to know what they're booking
- [ ] Portfolio gallery — visual trust signal; without it, new clients won't book
- [ ] About + contact page — who is this technician, how do I reach them
- [ ] Weekly schedule configuration with date-block exceptions — owner defines availability
- [ ] Calendar-based slot selection — core booking interaction
- [ ] LINE Login (SSO) — identity gate before booking confirmation
- [ ] PromptPay QR display at checkout — payment instruction
- [ ] Admin booking list — owner sees all upcoming bookings
- [ ] Admin payment confirmation — owner marks booking as paid
- [ ] LINE notification to owner on new booking — owner is alerted immediately
- [ ] LINE notification to client on confirmation — client gets proof of booking
- [ ] Email confirmation to client — secondary confirmation channel
- [ ] Bilingual TH/EN toggle — serves both Thai and expat clients
- [ ] Mobile-first responsive design — primary access device is phone

### Add After Validation (v1.x)

Features to add once core booking flow is working and real users have tested it.

- [ ] Appointment reminders (LINE message 24h before) — reduces no-shows; requires Messaging API push (counts against free tier limit)
- [ ] Cancellation / rescheduling by client — reduces admin friction for owner; requires booking state management
- [ ] Facebook / Google SSO as additional login options — expands access for clients without LINE accounts
- [ ] Client notes field at booking — allows client to specify preferences (e.g., "sensitive eyes")

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Instagram-connected gallery auto-sync — eliminates manual portfolio updates; requires Instagram Graph API
- [ ] Static testimonials section — social proof beyond portfolio; low complexity but not blocking
- [ ] Booking analytics for owner — busiest days, popular services; useful once data exists
- [ ] Google Business Profile integration (Reserve with Google button) — discoverability boost; requires Google Business verification

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Service menu + pricing | HIGH | LOW | P1 |
| Portfolio gallery | HIGH | LOW | P1 |
| Calendar slot selection | HIGH | MEDIUM | P1 |
| LINE Login SSO | HIGH | MEDIUM | P1 |
| PromptPay QR at checkout | HIGH | MEDIUM | P1 |
| Admin booking dashboard | HIGH | MEDIUM | P1 |
| Admin payment confirmation | HIGH | LOW | P1 |
| LINE notification to owner | HIGH | MEDIUM | P1 |
| LINE notification to client | HIGH | MEDIUM | P1 |
| Email confirmation to client | MEDIUM | LOW | P1 |
| Recurring schedule + date blocks | HIGH | MEDIUM | P1 |
| Bilingual TH/EN | HIGH | MEDIUM | P1 |
| Mobile-first layout | HIGH | LOW | P1 |
| About + contact page | MEDIUM | LOW | P1 |
| Appointment reminders (LINE) | HIGH | MEDIUM | P2 |
| Client cancellation / rescheduling | MEDIUM | MEDIUM | P2 |
| Facebook / Google SSO | LOW | MEDIUM | P2 |
| Client notes at booking | MEDIUM | LOW | P2 |
| Testimonials section | LOW | LOW | P3 |
| Booking analytics | LOW | MEDIUM | P3 |
| Google Reserve button | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Fresha / Booksy (generic platforms) | GoWabi (Thailand marketplace) | Our Approach |
|---------|-------------------------------------|-------------------------------|--------------|
| Payment | Card, gateway, deposits | PromptPay + multiple wallets | PromptPay QR, manual confirmation — no gateway fees |
| Notifications | Email + SMS | Email | LINE primary (Thai market fit) + email |
| Auth | Email/password or social | Platform account | LINE Login + optional Facebook/Google |
| Scheduling | Real-time availability sync | Real-time | Recurring weekly + manual block exceptions |
| Portfolio | Basic photo upload | Salon photos | Dedicated gallery section, mobile-optimized |
| Language | English-centric | Thai + English | Thai/English toggle, Thai-first |
| Multi-staff | Yes (not needed) | Yes (not needed) | No — solo operator only |
| Marketplace listing | Yes (takes commission) | Yes (takes commission) | No marketplace — direct bookings only |
| Admin complexity | High — feature-rich platforms | Platform-managed | Low — optimized for solo operator daily workflow |

**Key insight:** Generic platforms (Fresha, Booksy) are built for multi-staff salons with Western payment norms. GoWabi is a marketplace (commission model, not a self-hosted site). Neither addresses the solo Thai technician who wants a branded site, PromptPay QR flow, and LINE-native notifications. This is the gap the product fills.

---

## Sources

- Goldie lash artist features: https://heygoldie.com/customers/lash-artists
- Lash booking platform comparison 2025: https://www.appointo.me/blog/best-appointment-booking-apps-for-lashes-studios
- Must-have beauty salon app features: https://www.digittrix.com/blogs/must-have-features-for-beauty-salon-apps-in-2025
- LINE Messaging API pricing: https://developers.line.biz/en/docs/messaging-api/pricing/
- LINE Login integration docs: https://developers.line.biz/en/docs/line-login/integrate-line-login/
- LINE Notify sunset (migrated to Messaging API): https://ke2b.com/en/line-notify-closing-alt/
- PromptPay Thailand market overview: https://knowledge.antom.com/guide-to-promptpay-in-thailand
- PromptPay for business checkout: https://tazapay.com/blog/promptpay-for-business-thailand-checkout-success
- Thailand payment methods 2025: https://www.shoplazza.com/blog/payment-methods-in-thailand
- GoWabi Thailand booking platform: https://www.gowabi.com/en/places/face-treatments-salons
- TimeTailor salon software Thailand: https://www.timetailor.com/country-availability/salon-software-thailand
- No-show prevention and automated reminders: https://www.prospyrmed.com/blog/post/how-automated-reminders-reduce-no-shows
- Lash salon cancellation policy patterns: https://www.bllashes.com/blogs/blog/how-to-set-up-a-fair-cancellation-policy
- Fresha vs Booksy comparison: https://www.goodcall.com/appointment-scheduling-software/fresha-vs-booksy
- LINE Official Account guide: https://sphereagency.com/articles/line-official-account

---

*Feature research for: lash extension booking website — solo operator, Thailand market*
*Researched: 2026-03-22*
