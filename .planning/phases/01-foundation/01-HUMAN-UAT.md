---
status: partial
phase: 01-foundation
source: [01-VERIFICATION.md]
started: 2026-03-22T22:00:00Z
updated: 2026-03-22T22:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Confirm Vercel deployment is live
expected: Visiting the production Vercel URL returns HTTP 200 on /th/ and /en/ with correct bilingual content and layout
result: [pending]

### 2. Confirm Supabase schema is deployed
expected: Supabase Studio shows 5 tables: users, services, bookings, schedule_rules, schedule_exceptions
result: [pending]

### 3. Service cards with seeded data on live site
expected: After db:push and seed, /th/services shows คลาสสิค (฿800), ไฮบริด (฿1,100), วอลลุ่ม (฿1,400)
result: [pending]

### 4. Gallery lightbox final sign-off on live site
expected: On live /th/portfolio, clicking an image opens a fullscreen dark overlay with white X close button; X and Escape both close it
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
