# Phase 4: Payment Display - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

After confirming a booking, the client sees a PromptPay QR code for the exact service amount, generated server-side so the owner's phone number never appears in client code. Client can download the QR as an image file. The confirmation page at `/book/confirmation/[id]` already exists from Phase 3 — this phase replaces its QR placeholder with the real implementation.

</domain>

<decisions>
## Implementation Decisions

### PromptPay configuration
- **D-01:** PromptPay ID is a **phone number: `0897776261`** — stored in `PROMPTPAY_ID` env var, read server-side only (PAY-03)
- **D-02:** Account display name is **"TheLash65"** — shown below the QR image on the confirmation page
- **D-03:** QR encodes the **exact `service.priceTHB` integer** — no rounding, no decimals, no modifications

### QR generation approach
- **D-04:** QR is generated in the **confirmation page Server Component** — no API route needed; Server Components run server-side only, satisfying PAY-03 without an extra endpoint
- **D-05:** Generation pipeline: `promptpay-qr` (EMVCo payload string) → `qrcode` (PNG base64 data URL) → inline `<img>` tag
- **D-06:** QR output format is **PNG base64 data URL** (`data:image/png;base64,...`) — same value used for both display and download

### Page layout (replaces QR placeholder)
The old `confirmationNextSteps` copy ("Please wait for the owner to send payment details via email") is **removed entirely** — it is now incorrect and redundant. The QR section replaces it.

Layout order after the booking summary card:
1. **Section heading:** "สแกน QR เพื่อชำระเงิน / Scan QR to pay"
2. **QR image** (`<img src={dataUrl} alt="PromptPay QR" />`)
3. **Account name:** "TheLash65"
4. **Amount:** "฿{priceTHB}" (e.g. ฿800)
5. **Download button** (see D-07 below)
6. **After-transfer note** at the bottom

- **D-07:** Download CTA is a **full styled button** (brown gradient, matching site style) labeled **"บันทึก QR / Save QR"**, implemented as `<a href={dataUrl} download="thelash65-payment.png">` — no separate API route needed
- **D-08:** Download button placement is **below the account name + amount block**, above the after-transfer note

### Copy / i18n
- **D-09:** QR section heading — `th`: `"สแกน QR เพื่อชำระเงิน"` / `en`: `"Scan QR to pay"`
- **D-10:** After-transfer note — `th`: `"โอนเงินแล้วรอการยืนยันจากร้าน"` / `en`: `"After transferring, the owner will confirm your booking"`
- **D-11:** Download button label — `th`: `"บันทึก QR"` / `en`: `"Save QR"`
- **D-12:** Amount displayed as `"฿{priceTHB}"` — no locale formatting needed (integer, Thai Baht symbol prefix)

### Claude's Discretion
- QR image size (px) and padding within its container
- Exact card/container styling for the QR section (consistent with existing confirmation page style)
- Loading/error state if `promptpay-qr` or `qrcode` throws (e.g. invalid PROMPTPAY_ID)
- Whether to add `PROMPTPAY_ID` to `.env.example` with a placeholder value

</decisions>

<specifics>
## Specific Ideas

- The QR section should visually feel like a dedicated payment card — distinct from the booking summary above it
- "TheLash65" and the amount should be clearly legible below the QR without requiring the client to scroll
- The "Save QR" button uses the same brown gradient (`linear-gradient(135deg, #755944 0%, #9c7660 100%)`) as the "Confirm Booking" button from Phase 3

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Confirmation page (integration target)
- `src/app/[locale]/book/confirmation/[id]/page.tsx` — Server Component to modify; contains the QR placeholder div to replace and the existing booking summary card
- `src/lib/actions/booking.ts` §getBookingById — already joins `bookings` + `services`, returns `service.priceTHB`; no schema changes needed

### Requirements
- `.planning/REQUIREMENTS.md` §Payment — PAY-01, PAY-02, PAY-03 (all three covered by this phase)
- `.planning/ROADMAP.md` §Phase 4 — 3 success criteria (QR shown with correct amount, downloadable, owner phone not in client bundle)

### i18n messages
- `messages/en.json` — add keys: `payment.scanHeading`, `payment.afterTransfer`, `payment.saveQr` (or under `booking` namespace — follow existing pattern)
- `messages/th.json` — same keys, Thai values
- Remove `booking.confirmationNextSteps` and `booking.qrPlaceholder` from both files

### Stack conventions
- `CLAUDE.md` §Thai Market Integrations — `promptpay-qr` (payload) + `qrcode` (render), `toDataURL()` for inline + download
- `CLAUDE.md` §Stack Patterns — Server Components for data fetching; QR generation happens at page render time, not in a Client Component

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/[locale]/book/confirmation/[id]/page.tsx` — existing Server Component; `service.priceTHB` already available; QR placeholder div at line 192–212 is the exact replacement target
- `src/components/ui/button.tsx` — shadcn Button; use as wrapper for the styled download `<a>` tag (or style the `<a>` directly to match)
- `src/lib/date-utils.ts` — `formatDateGregorian`; already imported in confirmation page; no changes needed for this phase

### Established Patterns
- Server Components read env vars directly (`process.env.PROMPTPAY_ID`) — no client exposure risk
- All pages under `app/[locale]/` — confirmation page already locale-aware
- i18n via `getTranslations('booking')` — follow same namespace or use `'payment'` namespace if cleaner

### Integration Points
- `service.priceTHB` (integer) → `promptpay-qr(PROMPTPAY_ID, priceTHB)` → payload string → `qrcode.toDataURL(payload)` → base64 PNG
- Download: `<a href={dataUrl} download="thelash65-payment.png">` — same `dataUrl` variable, no extra fetch
- `PROMPTPAY_ID` must be added to `.env.local` (and Vercel environment variables for production)

</code_context>

<deferred>
## Deferred Ideas

- Showing the registered PromptPay account holder name fetched from the bank (requires banking API — out of scope; "TheLash65" hardcoded display name is sufficient)
- Payment slip upload by client (automated verification) — explicitly out of scope per REQUIREMENTS.md
- QR expiry / regeneration — PromptPay QR with a fixed amount does not expire; no TTL needed

</deferred>

---

*Phase: 04-payment-display*
*Context gathered: 2026-03-23*
