---
phase: 3
slug: booking-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (Jest-compatible, Next.js 16 default) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | BOOK-01 | unit | `npx vitest run src/lib/availability` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | BOOK-02 | unit | `npx vitest run src/lib/availability` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | BOOK-03 | unit | `npx vitest run src/lib/booking` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | BOOK-04 | unit | `npx vitest run src/lib/booking` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | BOOK-05 | integration | `npx vitest run src/app/api/bookings` | ❌ W0 | ⬜ pending |
| 3-03-02 | 03 | 2 | BOOK-06 | integration | `npx vitest run src/app/api/bookings` | ❌ W0 | ⬜ pending |
| 3-04-01 | 04 | 2 | ADMIN-04 | unit | `npx vitest run src/app/admin/schedule` | ❌ W0 | ⬜ pending |
| 3-04-02 | 04 | 2 | ADMIN-05 | unit | `npx vitest run src/app/admin/schedule` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/availability.test.ts` — stubs for BOOK-01, BOOK-02
- [ ] `src/lib/__tests__/booking.test.ts` — stubs for BOOK-03, BOOK-04
- [ ] `src/app/api/bookings/__tests__/route.test.ts` — stubs for BOOK-05, BOOK-06
- [ ] `src/app/admin/schedule/__tests__/schedule.test.ts` — stubs for ADMIN-04, ADMIN-05
- [ ] `vitest.config.ts` — if not already configured in project

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PromptPay QR renders correctly and is scannable | BOOK-05 | Requires physical device scan | Open booking confirmation page, scan QR with Thai banking app, verify amount matches service price |
| LINE push notification delivered to owner | BOOK-06 | Requires LINE Messaging API webhook | Submit booking, verify owner receives LINE message with booking details within 60s |
| Admin schedule blocks correctly reflect on client calendar | ADMIN-04, BOOK-02 | Cross-component visual verification | Add block in admin, open client booking flow, verify blocked slot not selectable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
