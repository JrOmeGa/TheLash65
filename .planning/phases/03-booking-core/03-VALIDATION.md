---
phase: 3
slug: booking-core
status: draft
nyquist_compliant: true
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
| 3-01-01 | 01 | 1 | BOOK-01, BOOK-02, BOOK-06 | unit | `npx vitest run src/lib/date-utils.test.ts --reporter=verbose` | W0 | pending |
| 3-01-02 | 01 | 1 | BOOK-06 | unit | `npx vitest run src/lib/actions/booking.test.ts --reporter=verbose` | W0 | pending |
| 3-02-01 | 02 | 2 | BOOK-01, BOOK-02, BOOK-03 | compile | `npx tsc --noEmit 2>&1 \| head -30` | n/a | pending |
| 3-02-02 | 02 | 2 | BOOK-03, BOOK-06 | compile | `npx tsc --noEmit 2>&1 \| head -30` | n/a | pending |
| 3-03-01 | 03 | 2 | ADMIN-04, ADMIN-05 | unit | `npx vitest run tests/unit/schedule.test.ts --reporter=verbose` | W0 | pending |
| 3-03-02 | 03 | 2 | ADMIN-04 | compile | `npx tsc --noEmit 2>&1 \| head -30` | n/a | pending |
| 3-04-01 | 04 | 3 | BOOK-03, BOOK-01 | compile | `npx tsc --noEmit 2>&1 \| head -30` | n/a | pending |
| 3-04-02 | 04 | 3 | all | manual | checkpoint:human-verify | n/a | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/date-utils.test.ts` — tests for `generateSlotsForDate` covering BOOK-01 (slot generation from rules), BOOK-02 (blocked dates produce zero slots), and booked-slot unavailability
- [ ] `src/lib/actions/booking.test.ts` — tests for `createBooking` conflict path (BOOK-06 atomic reservation: onConflictDoNothing returns [] triggers slot_unavailable error)
- [ ] `tests/unit/schedule.test.ts` — tests for ADMIN-04 (upsert rules produce correct slots via generateSlotsForDate) and ADMIN-05 (blocked date causes zero slots)
- [ ] `vitest.config.ts` — if not already configured in project

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin schedule blocks correctly reflect on client calendar | ADMIN-04, BOOK-02 | Cross-component visual verification across admin and client flows | 1. As admin, navigate to /admin/schedule. 2. Block a specific date. 3. Open client booking flow at /book. 4. Verify the blocked date appears grayed out and is not tappable in the date strip. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
