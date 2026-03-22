# Pitfalls Research

**Domain:** Mobile-first bilingual appointment booking website — Thai market (lash extension solo operator)
**Researched:** 2026-03-22
**Confidence:** HIGH (critical pitfalls verified against official LINE Developers docs, auth0 docs, and multiple corroborating sources)

---

## Critical Pitfalls

### Pitfall 1: LINE Notify Was Shut Down — Using It Instead of Messaging API

**What goes wrong:**
A developer builds the booking notification system using LINE Notify (the simple token-based approach), deploys it, and the notifications silently stop working. LINE Notify was shut down on March 31, 2025. All API endpoints and personal pages ceased functioning on April 1, 2025.

**Why it happens:**
Many tutorials, Stack Overflow answers, and Thai developer blog posts from 2022–2024 demonstrate LINE Notify because it required only a single token — far simpler than the Messaging API. Developers find these older resources and follow them without checking the current service status.

**How to avoid:**
Use the LINE Messaging API exclusively for all notification sending. The Messaging API requires a channel access token and the recipient's LINE user ID or group ID, but it is the officially supported path. Do not reference any LINE Notify documentation or tutorials.

**Warning signs:**
- Tutorial references `notify-bot.line.me` in any URL
- Code uses a single bearer token to send notifications with no channel concept
- Any library or package name containing "line-notify"

**Phase to address:** Notification integration phase (when shop owner and client LINE notifications are built)

---

### Pitfall 2: LINE Login Channel Left in "Developing" Status at Launch

**What goes wrong:**
The app is deployed to production but real clients cannot log in via LINE. They receive an authorization error or are blocked. Only users with Admin or Tester roles on the LINE Developers Console can authenticate when the channel status is "Developing."

**Why it happens:**
LINE channels are created in "Developing" status by default. During local development and testing this is invisible because the developer is an admin on the channel. The issue only surfaces when a real user attempts to log in after launch.

**How to avoid:**
Change the LINE Login channel status to "Published" before going live. Note: this transition is irreversible — a Published channel cannot be reverted to Developing. Verify this step in your launch checklist. If testing with a staging environment, add testers explicitly to the channel via the LINE Developers Console.

**Warning signs:**
- Login works for the developer but fails for a friend or test user
- LINE returns an authorization error on the login callback
- No "Published" status visible in LINE Developers Console channel overview

**Phase to address:** SSO/auth phase (at the end, as a launch gate item)

---

### Pitfall 3: Double Booking via Race Condition — Two Clients Reserve the Same Slot

**What goes wrong:**
Two clients open the booking page simultaneously, both see the 2:00 PM slot as available, both complete the booking flow, and both receive confirmation. The shop owner now has two clients arriving at the same time.

**Why it happens:**
Availability checks and booking creation are two separate operations. Without an atomic lock between "check available" and "write booking," concurrent requests pass the availability check before either has written to the database. For a solo lash technician, even one double booking destroys the service experience.

**How to avoid:**
Use a database-level unique constraint or pessimistic lock (`SELECT ... FOR UPDATE`) on the slot record. The write operation must be atomic: check availability and create booking in a single transaction with a row-level lock. An alternative is optimistic locking with a version field — if two writes race, one will fail the version check and must retry or show an error to the user. For a low-traffic solo operator site, pessimistic locking is simpler and sufficient.

**Warning signs:**
- Booking creation is two separate queries (SELECT then INSERT) without a transaction
- No unique constraint on `(date, time_slot)` in the bookings table
- Availability endpoint is separate from booking endpoint with no coordination

**Phase to address:** Calendar/booking core phase (when the slot reservation system is first built)

---

### Pitfall 4: PromptPay QR Code Exposes Owner's Personal Phone Number

**What goes wrong:**
A static PromptPay QR code is generated using the shop owner's personal phone number as the PromptPay ID. Any client who scans it — or anyone who saves a screenshot — can extract the owner's personal phone number directly from the QR payload. The EMVCo payload format stores the PromptPay ID in plaintext.

**Why it happens:**
For a solo operator, the simplest path is to generate a QR using their personal phone/citizen ID. Libraries like `promptpay-qr` (npm) make this trivial. The privacy implication of the number being readable from the QR data is not obvious.

**How to avoid:**
Accept this tradeoff consciously and document it as a known limitation. If privacy is a concern, the owner should use a dedicated business phone number for PromptPay rather than their primary personal number. Do not use citizen ID as the PromptPay identifier. Inform the shop owner of this during setup so the decision is intentional.

**Warning signs:**
- QR code generated using citizen ID number (13 digits)
- No discussion with the owner about which identifier to use

**Phase to address:** Payment/QR display phase

---

### Pitfall 5: OAuth State Parameter Omitted — CSRF Vulnerability in SSO Flow

**What goes wrong:**
The LINE/Google/Facebook OAuth flow is implemented without generating or validating the `state` parameter. An attacker can craft a link that forces a victim's browser to complete an OAuth flow with an attacker-controlled authorization code, potentially logging the victim into the attacker's account or hijacking the victim's session (OAuth CSRF).

**Why it happens:**
The `state` parameter is sometimes treated as optional in tutorials because the happy path works without it. Developers skip it to simplify the implementation and do not realize it is a security requirement, not a convenience feature.

**How to avoid:**
Generate a cryptographically random `state` value (at minimum 128 bits of entropy) for every authorization request. Store it server-side in the session (not only in a cookie without signing). Reject any callback where the returned `state` does not exactly match the stored value. Also generate a `nonce` for ID token replay protection. Use an established auth library (NextAuth.js/Auth.js) rather than rolling this manually — it handles state and nonce correctly by default.

**Warning signs:**
- OAuth callback handler does not check `req.query.state`
- State value is a timestamp, user ID, or any predictable value
- Auth implemented without a library

**Phase to address:** SSO/auth phase (at implementation, not retrofittable)

---

### Pitfall 6: Buddhist Era (พ.ศ.) Year Displayed as Gregorian — Or Vice Versa — Breaking Date Trust

**What goes wrong:**
A date displayed as "2026" or a date picker showing "2026" is read by Thai users expecting พ.ศ. 2569. Or the opposite: code converts a Gregorian date to Buddhist era (+543) and displays "2569" to English-language users expecting 2026. The 543-year gap creates dates that look like the far future or ancient history. Date pickers using browser locale detection for Thai (`th-TH`) may automatically render BE years in UI components while storing Gregorian internally, creating an off-by-543-years bug in the database.

**Why it happens:**
JavaScript's `Intl.DateTimeFormat` with `locale: 'th-TH'` defaults to the Buddhist calendar, outputting BE years. Developers assume date display is consistent across locales. The Canvas LMS bug documented this exact issue: the picker shows the current Gregorian year on open, but on selection converts to BE, and repeated interactions compound the 543-year error.

**How to avoid:**
Store all dates in UTC Gregorian format in the database — never store BE dates. Display conversion is a rendering concern only. For the Thai locale, explicitly pass `calendar: 'gregory'` to `Intl.DateTimeFormat` unless you intentionally want BE output (e.g., for formal Thai documents). Test date display with `navigator.language` forced to `th-TH`. Use `day.js` with the `buddhistEra` plugin only when explicitly rendering BE for Thai users, not as a general date format.

**Warning signs:**
- Date rendering using `toLocaleDateString('th-TH')` without `calendar: 'gregory'`
- Any year displayed in UI that is 543 years off
- Date picker component not tested with browser language set to Thai

**Phase to address:** i18n/localization phase

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Static PromptPay QR (same image for every booking) | Zero backend generation work | Impossible to correlate payments to bookings; owner must manually cross-check every transfer notification | Never for production; acceptable only in proof-of-concept |
| Hardcoding Thai/English strings in components instead of i18n keys | Faster initial build | Language toggle cannot work; every UI change requires hunting through source files | Never |
| Storing booking state in client-side session only (no server-side record) | Simpler state management | Lost bookings if user closes browser mid-flow; no recovery path | Never |
| Using LINE long-lived channel access tokens instead of stateless tokens | One-time setup, no rotation logic needed | Security risk if token is leaked; no expiry protection | Only for internal/development tooling, not production |
| Building admin dashboard as public route with no auth | Faster to demo | Any user can view and modify all bookings | Never — even in development, use at minimum a basic check |
| No buffer time between appointments in schedule | Maximizes bookable slots | Back-to-back bookings with no travel/cleanup time; burnout for solo operator | Never — build buffer into the slot model from day one |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| LINE Login | Callback URL in `.env` does not exactly match the URL registered in LINE Developers Console (including trailing slash, http vs https) | Register the exact production URL in the console; use a separate channel for development with `localhost` callback |
| LINE Login | Requesting the `email` scope without prior approval from LINE | Do not request `email` scope unless you have submitted an approval application to LINE; use the `profile` and `openid` scopes for identity |
| LINE Login | Assuming auto-login works in private/incognito browsers | Implement a fallback manual login button; do not depend on SSO auto-login for all users |
| LINE Messaging API | Sending push messages to a user ID obtained from LINE Login without first verifying the user has added the bot as a friend | Check `friendshipStatusChanged` or use the friendship status API; messages to non-friend users will fail silently or return an error |
| LINE Messaging API | Not verifying the webhook signature (`X-Line-Signature`) before processing | Always validate the HMAC-SHA256 signature of every incoming webhook request before trusting the payload |
| LINE Messaging API | Restricting incoming webhook traffic by IP address | LINE Platform IPs are undisclosed and change without notice; use signature validation only |
| PromptPay QR | Generating a dynamic QR with amount pre-filled but displaying it as a static reusable image | Each booking needs a freshly generated QR or explicit UX that the amount must be manually entered |
| Google/Facebook OAuth | Redirect URI not whitelisted in Google Cloud Console / Facebook App settings | Register all environment URIs (localhost dev, staging, production) before starting integration work |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all bookings client-side and filtering in JS | Admin dashboard is slow to load; large JSON payloads | Paginate and filter server-side from the start | ~500+ bookings |
| Loading Thai font (Sarabun) without `font-display: swap` | Flash of invisible text (FOIT) on mobile; perceived slow load | Add `font-display: swap` to `@font-face`; preload the font file | Every page load on slow mobile connections — immediate |
| Loading full Thai font character set instead of subsetting | Font file is 300-500KB; kills mobile load time | Use Google Fonts with `subset=thai,latin` or Fontsource with explicit character subsets; never blindly subset Thai — use the full Thai Unicode block (U+0E00–U+0E7F) intact | Every mobile user on 4G or slower |
| Availability query scanning full bookings table per slot check | Calendar rendering is slow; each date click triggers a full table scan | Index on `(scheduled_date, status)`; compute available slots with a single set-based query | ~1,000+ bookings |
| Regenerating PromptPay QR on every page render server-side | Unnecessary CPU work; QR appears after visible delay | Generate QR at booking creation time and cache/store the image; or generate client-side with `promptpay-qr` + `qrcode` npm packages | Noticeable on mobile at any traffic level |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Admin dashboard accessible to any authenticated user (any SSO login = admin access) | Any client who books an appointment can access, modify, or delete all bookings | Admin role must be explicitly assigned; check `user.id === OWNER_ID` (env var) on every admin route, not just role flags from the token |
| Booking confirmation endpoint with no auth check — any POST confirms any booking | Malicious client can confirm their own unconfirmed booking without payment | Booking confirmation must be admin-only; verify session role server-side, not just client-side UI gating |
| PromptPay QR displayed before booking is written to the database | User pays but booking record does not exist; unrecoverable payment with no booking | Write the pending booking record first, then show the QR — never show payment instructions before the booking exists |
| LINE webhook endpoint publicly accessible with no signature validation | Fake webhook events can trigger booking confirmations or notifications | Validate `X-Line-Signature` HMAC-SHA256 on every incoming request before processing |
| Storing LINE channel secret in client-side code or public environment variables | Secret exposed; attacker can forge webhook signatures or issue tokens | Channel secret must only exist in server-side environment variables; never in `NEXT_PUBLIC_*` or any client bundle |
| Trusting user-supplied `userId` in booking requests | Client can book on behalf of another user or enumerate bookings | Always derive `userId` from the verified server-side session, never from request body/query parameters |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Date/time picker using desktop-style dropdowns or small click targets | Thai mobile users cannot select dates accurately; high drop-off on mobile | Use a mobile-native date picker component with large touch targets (minimum 44x44px); test on real devices |
| Booking confirmation screen only shows text — no downloadable payment reference | Client cannot find their booking details later; increased WhatsApp/Line support requests | Show booking summary, QR code, and provide a screenshot-friendly layout; include a "Save to photos" affordance for the QR |
| Language toggle resets booking progress | Bilingual users who switch mid-flow lose their selected service and date | Persist booking state across language changes in component state or URL params |
| Admin notification only via Line — no fallback when app is closed | Shop owner misses new bookings if Line message is delayed or not checked | Show pending bookings prominently on admin dashboard home; do not rely on push notifications alone |
| Available time slots shown in 24-hour format only | Thai users are accustomed to mixed formats; elderly clients may find 24h confusing | Display as 9:00 น. / 14:00 น. (or 2:00 PM for EN); support both locale conventions |
| No explicit "slot is taken" error feedback when a race condition occurs | User completes entire booking flow, submits, gets a generic error with no explanation | Show a specific "This time slot was just taken by another customer — please choose a different time" message and redirect to calendar |
| Admin dashboard requires multiple taps to confirm a payment | Solo operator using mobile for admin tasks finds it slow; friction leads to delayed confirmations | Place pending bookings requiring confirmation as the first visible item; one-tap confirmation with an immediate visual feedback |
| No empty state on calendar showing why all slots are blocked | Clients see an entirely greyed-out calendar with no explanation | If all slots in a week are blocked, show a brief message: "No availability this week — check next week" |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **LINE Login:** Test with a user account that is NOT an admin or tester on the channel — verify authentication works end-to-end before declaring the channel ready
- [ ] **LINE Notifications:** Verify the client has added the bot as a LINE friend before attempting to send a push message — friend status is a prerequisite for push delivery
- [ ] **LINE Channel Status:** Confirm channel status is "Published" in LINE Developers Console before launch — "Developing" blocks all non-admin users
- [ ] **PromptPay QR:** Verify the generated QR code scans successfully in at least two Thai banking apps (KBank, SCB) on a real mobile device — emulators do not reliably test QR scanning
- [ ] **Double Booking Protection:** Test by opening two browser tabs simultaneously, selecting the same slot in both, and submitting concurrently — only one should succeed
- [ ] **Date Display — Buddhist Era:** Test the entire booking flow with browser language set to `th-TH` and verify no dates display 543 years off
- [ ] **Thai Font Loading:** Test on a throttled mobile connection (Chrome DevTools: "Slow 3G") — verify text is visible before font loads (FOIT check)
- [ ] **Admin Route Protection:** Test that visiting `/admin` as a non-owner authenticated user returns 403, not the admin UI
- [ ] **Recurring Schedule Exceptions:** Block a specific date that falls within a recurring weekly schedule — verify blocked date shows as unavailable to clients while surrounding dates remain bookable
- [ ] **Language Toggle Persistence:** Switch language mid-booking (after selecting service, before confirming) — verify selected service and date are preserved

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| LINE Notify built into notification system (deprecated) | MEDIUM | Replace all LINE Notify calls with Messaging API push messages; update environment variables; requires LINE Messaging API channel setup from scratch |
| Double booking discovered after both clients arrive | HIGH (relationship damage) | Implement compensation policy (discount/priority rebooking); add retroactive database constraint; audit all existing bookings for conflicts |
| LINE channel stuck in "Developing" at launch | LOW | Publish the channel in LINE Developers Console (irreversible); no code change required; 5-minute fix |
| Buddhist era date bug discovered in production | MEDIUM | Audit all stored dates for corruption; fix rendering layer (not data layer if stored as Gregorian); regression test all date-related UI |
| Admin dashboard accessed by non-admin user | HIGH (data breach) | Rotate all secrets; invalidate all sessions; audit access logs; add server-side role check immediately |
| PromptPay QR not scanning on client devices | LOW | Test with `promptpay-qr` library at default error correction level (M); reduce QR density; provide manual payment details as fallback text |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| LINE Notify is deprecated — use Messaging API | Notification integration phase | Zero references to `notify-bot.line.me` in codebase; notifications tested with a non-admin LINE account |
| LINE channel in "Developing" status at launch | SSO/auth phase (launch gate) | Channel status confirmed "Published" before first real user test |
| Double booking race condition | Calendar/booking core phase | Concurrent booking test: two simultaneous submissions for same slot — only one succeeds |
| PromptPay QR exposes owner's phone number | Payment/QR display phase | Owner briefed and has chosen their PromptPay identifier intentionally |
| OAuth state parameter omitted | SSO/auth phase | Auth library (Auth.js) used; manual OAuth flow not implemented; state validation confirmed in library source |
| Buddhist era year display bug | i18n/localization phase | Date display tested with `th-TH` locale forced; no 543-year offset observed anywhere |
| Admin route accessible to non-admin users | Admin dashboard phase | Automated test or manual test: authenticated non-owner session receives 403 on all `/admin` routes |
| Thai font FOIT on slow mobile | Frontend foundation phase | Lighthouse mobile audit passes; `font-display: swap` present; tested on throttled connection |
| LINE webhook without signature validation | Notification integration phase | Webhook handler rejects requests with invalid or missing `X-Line-Signature` |
| No buffer time in slot model | Calendar/booking core phase | Slot model reviewed: buffer time baked into slot duration, not an afterthought |

---

## Sources

- [LINE Developers: Integrating LINE Login with your web app](https://developers.line.biz/en/docs/line-login/integrate-line-login/) — official docs, HIGH confidence
- [LINE Developers: Messaging API receiving messages (webhook)](https://developers.line.biz/en/docs/messaging-api/receiving-messages/) — official docs, HIGH confidence
- [LINE Developers: LINE Login development guidelines](https://developers.line.biz/en/docs/line-login/development-guidelines/) — official docs, HIGH confidence
- [LINE Notify closing announcement](https://notify-bot.line.me/closing-announce) — official announcement (service ended March 31, 2025), HIGH confidence
- [ke2b.com: LINE Notify to End in 2025: Messaging API Alternatives](https://ke2b.com/en/line-notify-closing-alt/) — corroborating source, HIGH confidence
- [Auth0: Prevent Attacks with OAuth 2.0 State Parameters](https://auth0.com/docs/secure/attack-protection/state-parameters) — official docs, HIGH confidence
- [Auth0: Demystifying OAuth Security — State vs. Nonce vs. PKCE](https://auth0.com/blog/demystifying-oauth-security-state-vs-nonce-vs-pkce/) — HIGH confidence
- [PortSwigger: OAuth 2.0 authentication vulnerabilities](https://portswigger.net/web-security/oauth) — HIGH confidence
- [Canvas LMS known issue: Date changes from Gregorian to Buddhist calendar](https://community.canvaslms.com/t5/Known-Issues/Date-changes-from-Gregorian-to-Buddhist-calendar-in-the-date/ta-p/606786) — documented real-world bug, MEDIUM confidence
- [Day.js: BuddhistEra plugin docs](https://day.js.org/docs/en/plugin/buddhist-era) — official library docs, HIGH confidence
- [dtinth/promptpay-qr on GitHub](https://github.com/dtinth/promptpay-qr) — widely used Thai OSS library, MEDIUM confidence
- [knowledge.antom.com: Guide to PromptPay in Thailand](https://knowledge.antom.com/guide-to-promptpay-in-thailand) — MEDIUM confidence
- [HackerNoon: How to Solve Race Conditions in a Booking System](https://hackernoon.com/how-to-solve-race-conditions-in-a-booking-system) — MEDIUM confidence
- [itnext.io: Solving Double Booking at Scale](https://itnext.io/solving-double-booking-at-scale-system-design-patterns-from-top-tech-companies-4c5a3311d8ea) — MEDIUM confidence
- [Fontsource: @fontsource/sarabun](https://www.npmjs.com/package/@fontsource/sarabun) — MEDIUM confidence
- [ExpertBeacon: Complete Guide to Thai Google Fonts](https://expertbeacon.com/the-complete-guide-to-using-thai-google-fonts-on-your-website/) — MEDIUM confidence
- [Baymard Institute: Mobile UX Trends 2025](https://baymard.com/blog/mobile-ux-ecommerce) — MEDIUM confidence

---
*Pitfalls research for: lash extension booking website — Thai market, solo operator, bilingual (TH/EN)*
*Researched: 2026-03-22*
