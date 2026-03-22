---
phase: 2
slug: authentication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | AUTH-01 | unit | `npm run test -- --run src/lib/auth` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | AUTH-02 | unit | `npm run test -- --run src/lib/auth` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 2 | AUTH-03 | manual | See Manual-Only Verifications | N/A | ⬜ pending |
| 2-01-04 | 01 | 2 | AUTH-04 | unit | `npm run test -- --run src/middleware` | ❌ W0 | ⬜ pending |
| 2-01-05 | 01 | 2 | ADMIN-06 | unit | `npm run test -- --run src/app/admin` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/auth/__tests__/auth.test.ts` — stubs for AUTH-01, AUTH-02 (Better Auth instance setup, provider config)
- [ ] `src/middleware.test.ts` — stubs for AUTH-04 (unauthenticated redirect to login)
- [ ] `src/app/[locale]/admin/__tests__/layout.test.ts` — stubs for ADMIN-06 (non-owner 403/redirect)
- [ ] `vitest.config.ts` — if not already installed from Phase 1

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google SSO round-trip (sign in → redirect back → authenticated session) | AUTH-01 | Requires live OAuth credentials and browser interaction; cannot be mocked in unit tests | 1. Navigate to /th/login. 2. Click "Sign in with Google". 3. Complete OAuth in browser. 4. Verify redirect back to site and user session is active. |
| Facebook SSO round-trip (sign in → redirect back → authenticated session) | AUTH-02 | Requires live Facebook OAuth and Facebook app in Live mode | 1. Navigate to /th/login. 2. Click "Sign in with Facebook". 3. Complete OAuth in browser. 4. Verify redirect back to site and user session is active. |
| Session persistence across tab close/reopen | AUTH-03 | Browser tab lifecycle cannot be automated in vitest | 1. Sign in with Google. 2. Close tab completely. 3. Reopen /th and verify still logged in without re-auth prompt. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
