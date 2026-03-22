---
phase: 2
slug: authentication
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E), grep-based structural checks (unit-level) |
| **Config file** | playwright.config.ts |
| **Quick run command** | `npx playwright test --reporter=list` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run task-specific `<automated>` verify command
- **After every plan wave:** Run `npx tsc --noEmit && npm run build`
- **Before `/gsd:verify-work`:** Full Playwright suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | AUTH-01, AUTH-02 | structural | `grep -c "pgTable('accounts'" src/db/schema.ts && grep "better-auth" package.json` | N/A (grep) | pending |
| 2-01-02 | 01 | 1 | AUTH-01, AUTH-02, AUTH-03 | structural | `grep "betterAuth" src/lib/auth.ts && grep "toNextJsHandler" "src/app/api/auth/[...all]/route.ts" && test "$(grep -c 'cookieCache' src/lib/auth.ts)" = "0"` | N/A (grep) | pending |
| 2-02-01 | 02 | 2 | AUTH-01, AUTH-02, AUTH-04 | structural | `grep "google-signin-button" src/components/auth/SignInButtons.tsx && grep "SignInButtons" src/app/[locale]/book/page.tsx` | N/A (grep) | pending |
| 2-02-02 | 02 | 2 | D-09, D-10, D-11, D-12 | structural | `grep "UserAvatar" src/components/layout/Header.tsx && grep "router.refresh" src/components/layout/Header.tsx && grep "lucide-react" src/components/layout/Header.tsx` | N/A (grep) | pending |
| 2-02-03 | 02 | 2 | ADMIN-06 | structural + E2E | `grep "ADMIN_EMAIL" src/app/[locale]/admin/layout.tsx && npx playwright test tests/admin-protection.spec.ts` | tests/*.spec.ts created in this task | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No Wave 0 test stubs needed because:

1. **Plan 01 (Wave 1)** uses grep-based structural verification — checks that files exist and contain expected patterns. This is appropriate for infrastructure setup where the code cannot be exercised without live OAuth credentials.
2. **Plan 02 (Wave 2)** creates E2E test files (`tests/auth.spec.ts`, `tests/admin-protection.spec.ts`) alongside the source code they test. These are Wave 2 artifacts, not Wave 0 fixtures.
3. **AUTH-03 (session persistence)** is verified structurally by confirming `cookieCache` is absent from `auth.ts` — the actual persistence behavior requires a live OAuth round-trip and is covered in Manual-Only Verifications below.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google SSO round-trip (sign in -> redirect back -> authenticated session) | AUTH-01 | Requires live OAuth credentials and browser interaction; cannot be mocked in structural tests | 1. Navigate to /th/book. 2. Click "Continue with Google". 3. Complete OAuth in browser. 4. Verify redirect back to /th/book and authenticated welcome message appears. |
| Facebook SSO round-trip (sign in -> redirect back -> authenticated session) | AUTH-02 | Requires live Facebook OAuth and Facebook app in Live mode | 1. Navigate to /th/book. 2. Click "Continue with Facebook". 3. Complete OAuth in browser. 4. Verify redirect back to /th/book and authenticated welcome message appears. |
| Session persistence across tab close/reopen | AUTH-03 | Browser tab lifecycle cannot be automated in Playwright without complex session management | 1. Sign in with Google. 2. Close tab completely. 3. Reopen /th/book and verify still logged in without re-auth prompt. |
| Avatar sign-out + unmount | D-10 | Requires authenticated session state | 1. Sign in with Google. 2. Observe avatar in header. 3. Click avatar. 4. Verify avatar disappears and page reflects logged-out state without manual refresh. |
| Avatar fallback icon | D-12 | Requires a user with no profile photo (edge case) | 1. Sign in with an account that has no profile photo. 2. Verify header shows a generic person icon (lucide User), not a letter initial or broken image. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (grep-based structural checks)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 not needed — structural checks run inline, E2E tests created in Wave 2
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
