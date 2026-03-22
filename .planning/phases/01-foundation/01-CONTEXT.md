# Phase 1: Foundation - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

A deployed, publicly accessible site with bilingual routing, the full public content, and the database schema ready for business logic. Auth, booking, and payment are out of scope — this phase delivers the shell the rest of the app will be built inside.

</domain>

<decisions>
## Implementation Decisions

### Portfolio Gallery (SITE-01)
- **D-01:** 2-column grid on mobile, 3-column on tablet/desktop
- **D-02:** Tap/click on photo opens a lightbox modal (full-screen image view)
- **D-03:** Launch with placeholder images — real lash photos dropped in by owner before go-live
- **D-04:** No lazy-loading complexity for v1 — standard Next.js `<Image>` with `loading="lazy"`

### Service Menu (SITE-02)
- **D-05:** Flat card list — one card per service (no category grouping for v1)
- **D-06:** Each card shows: service name, short description, duration, price in THB
- **D-07:** Price displayed as plain number with "฿" symbol — no "from" pricing or ranges
- **D-08:** Cards stacked vertically on mobile (full width), 2-column grid on desktop

### About Page & Contact (SITE-03)
- **D-09:** Owner photo + short bio paragraph
- **D-10:** Contact methods: Line ID and phone number (no physical address — home studio privacy)
- **D-11:** Shop hours displayed as static text (not linked to schedule system — that's Phase 3)
- **D-12:** Booking CTA button on about page links to booking flow (will be wired in Phase 3)

### Language Toggle (I18N-01, I18N-02)
- **D-13:** Default locale is Thai (`th`) — primary market
- **D-14:** No browser auto-detection — always start on Thai
- **D-15:** Toggle placed in the site header (visible on all pages)
- **D-16:** Simple text switcher: "TH | EN" — no flags or dropdown
- **D-17:** Locale stored in URL prefix: `/th/...` and `/en/...` (next-intl prefix strategy)

### Date Display (I18N-03)
- **D-18:** All dates pass `calendar: 'gregory'` explicitly when formatting with Thai locale
- **D-19:** Store all dates as UTC in the database — no Buddhist Era in persistence layer

### Database Schema
- **D-20:** Schema covers all v1 tables in one migration: `users`, `services`, `bookings`, `schedule_rules`, `schedule_exceptions`
- **D-21:** Services seeded with placeholder data (3 services: Classic, Hybrid, Volume) so the menu renders at launch
- **D-22:** Supabase connection uses session-mode port 5432 (not transaction-mode 6543) for Drizzle compatibility

### Claude's Discretion
- Exact lightbox implementation (shadcn Dialog or custom)
- Drizzle schema column types and constraints
- Navigation structure and mobile menu pattern
- Footer content and layout
- Loading/skeleton states for images

</decisions>

<specifics>
## Specific Ideas

- Site is mobile-first — the primary user is a Thai client booking from their phone
- Owner has existing logo and branding to be applied; design system will be formalized in UI-SPEC phases
- "TH | EN" toggle should feel native to the header, not bolted on

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements and stack
- `.planning/REQUIREMENTS.md` — Full v1 requirement list; Phase 1 covers SITE-01–04 and I18N-01–03
- `.planning/ROADMAP.md` §Phase 1 — Success criteria (5 verifiable conditions)
- `CLAUDE.md` §Technology Stack — Full stack with versions, compatibility notes, and what NOT to use
- `CLAUDE.md` §Stack Patterns — Patterns for i18n setup, Server Components vs. Client Components, next-intl config

### Key constraints from research
- `.planning/STATE.md` §Blockers/Concerns — Buddhist Era date bug, Supabase connection mode, LINE Login publish requirement
- `.planning/research/STACK.md` — Stack research (if exists — may not yet for Phase 1)
- `.planning/research/ARCHITECTURE.md` — Architecture research (if exists)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project, no existing source code

### Established Patterns
- None yet — patterns will be established in this phase

### Integration Points
- Drizzle schema created here is consumed by Phase 2 (Better Auth user table), Phase 3 (bookings/schedule), Phase 4 (payment)
- `app/[locale]/` routing structure established here must be respected by all future phases
- next-intl message files (`messages/th.json`, `messages/en.json`) start here; every future phase adds keys

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (user skipped gray area discussion; defaults applied)

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-22*
