---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E) + Vitest (unit) |
| **Config file** | `playwright.config.ts` + `vitest.config.ts` — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx playwright test && npx vitest run` |
| **Estimated runtime** | ~15 seconds (unit: <5s, E2E: ~10s) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx playwright test && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds (unit), 15 seconds (full)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-gallery-01 | TBD | TBD | SITE-01 | E2E smoke | `npx playwright test tests/gallery.spec.ts` | ❌ W0 | ⬜ pending |
| 1-gallery-02 | TBD | TBD | SITE-01 | E2E | `npx playwright test tests/gallery.spec.ts` | ❌ W0 | ⬜ pending |
| 1-services-01 | TBD | TBD | SITE-02 | E2E smoke | `npx playwright test tests/services.spec.ts` | ❌ W0 | ⬜ pending |
| 1-about-01 | TBD | TBD | SITE-03 | E2E smoke | `npx playwright test tests/about.spec.ts` | ❌ W0 | ⬜ pending |
| 1-responsive-01 | TBD | TBD | SITE-04 | E2E | `npx playwright test tests/responsive.spec.ts` | ❌ W0 | ⬜ pending |
| 1-i18n-01 | TBD | TBD | I18N-01 | E2E smoke | `npx playwright test tests/i18n.spec.ts` | ❌ W0 | ⬜ pending |
| 1-i18n-02 | TBD | TBD | I18N-02 | E2E | `npx playwright test tests/i18n.spec.ts` | ❌ W0 | ⬜ pending |
| 1-date-01 | TBD | TBD | I18N-03 | Unit | `npx vitest run tests/unit/date-format.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/gallery.spec.ts` — stubs for SITE-01 (grid render + lightbox open)
- [ ] `tests/services.spec.ts` — stubs for SITE-02 (service card: name, price, duration)
- [ ] `tests/about.spec.ts` — stubs for SITE-03 (about page content + contact info)
- [ ] `tests/responsive.spec.ts` — stubs for SITE-04 (375px viewport, no horizontal scroll)
- [ ] `tests/i18n.spec.ts` — stubs for I18N-01, I18N-02 (locale routing + switcher navigation)
- [ ] `tests/unit/date-format.test.ts` — stubs for I18N-03 (Buddhist Era guard, Gregorian year)
- [ ] `playwright.config.ts` — Playwright project configuration
- [ ] `vitest.config.ts` — Vitest configuration
- [ ] Framework installs: `npm install -D @playwright/test vitest @vitejs/plugin-react`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase schema deployed (all 5 tables) | DB schema | Requires live Supabase credentials | Run `npx drizzle-kit push` and verify tables in Supabase Studio |
| Vercel deployment live on public URL | SITE-04 | Requires Vercel project + DNS | Visit deployed URL, confirm no 404/500 on `/th/` and `/en/` |
| Sarabun font loads correctly on mobile | SITE-04 | Visual check | Open site on real device or devtools mobile emulation; confirm Thai characters render |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
