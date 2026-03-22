---
phase: 01-foundation
plan: 03
subsystem: ui

tags: [layout, header, footer, navigation, locale-switcher, mobile-drawer, sticky-bar, next-intl, shadcn, tailwind, glassmorphic, responsive]

# Dependency graph
requires:
  - 01-01  # Next.js scaffold, shadcn Sheet/Button, next-intl routing, message files
provides:
  - Fixed glassmorphic Header with desktop nav, LocaleSwitcher (TH|EN), Book CTA, mobile Sheet drawer
  - LocaleSwitcher wired to next-intl useRouter/usePathname for locale switching
  - Footer with surface-container-low (#f5ede6) background, Line/Phone icons, copyright
  - StickyMandateBar: floating pill on mobile only (md:hidden), accent background #755944
  - locale layout shell renders Header + Footer + StickyMandateBar on all pages
affects: [01-04, all subsequent plans — layout shell visible on every page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "'use client' on interactive layout components (LocaleSwitcher, MobileDrawer, Header, StickyMandateBar)"
    - "shadcn Sheet with side=bottom for mobile navigation drawer"
    - "CSS-in-style glassmorphic treatment: rgba(255,248,245,0.80) + backdrop-blur(12px) + 1px rgba white border"
    - "linear-gradient(135deg, #755944, #9c7660) for primary CTA fills"
    - "active:scale-[0.98] transition-transform duration-100 universal tap feedback"
    - "Hover underline: position absolute bottom-2, width transitions 0->full on group-hover"
    - "md:hidden for mobile-only elements; hidden md:flex for desktop-only elements"

# Key files
key-files:
  created:
    - src/components/layout/LocaleSwitcher.tsx
    - src/components/layout/MobileDrawer.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/Footer.tsx
    - src/components/layout/StickyMandateBar.tsx
  modified:
    - src/app/[locale]/layout.tsx  # wired Header + Footer + StickyMandateBar into layout shell

# Decisions
decisions:
  - "Header and all interactive layout components are Client Components ('use client') — they use hooks (useLocale, useRouter, usePathname, useTranslations)"
  - "Footer is a Server Component — static content, no client interactivity needed"
  - "StickyMandateBar links to '#' placeholder per D-12 — will be wired to booking flow in Phase 3"
  - "NavLink active state derived from usePathname() comparison — no additional state needed"
  - "glassmorphic border (1px solid rgba(255,255,255,0.2)) applied via inline style to avoid Tailwind v4 arbitrary value issues"

# Metrics
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-22"
  tasks_completed: 2
  files_created: 5
  files_modified: 1
---

# Phase 01 Plan 03: Layout Shell Summary

Fixed glassmorphic header with TH|EN locale switcher, mobile Sheet drawer, desktop nav/CTA, plus footer and mobile-only sticky mandate bar pill — all wired into the locale layout so every page inherits the full layout shell.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Header, LocaleSwitcher, MobileDrawer | fad8745 | 3 created |
| 2 | Footer, StickyMandateBar, locale layout wiring | f8d15e7 | 2 created, 1 modified |

## What Was Built

**LocaleSwitcher** (`src/components/layout/LocaleSwitcher.tsx`):
- `'use client'` component using `useLocale`, `usePathname`, `useRouter` from `@/i18n/navigation`
- TH and EN buttons; active locale styled with `#755944` font-semibold, inactive at 50% opacity
- `router.replace({ pathname }, { locale: newLocale })` — no page reload animation
- Both buttons `min-h-[44px] min-w-[44px]` tap targets

**MobileDrawer** (`src/components/layout/MobileDrawer.tsx`):
- shadcn `Sheet` with `side="bottom"` bottom drawer
- Hamburger trigger with `aria-label` from `nav.openMenu` translation
- Glassmorphic SheetContent: `rgba(255,248,245,0.80)` + `backdrop-blur-[12px]`
- Nav links using `Link` from `@/i18n/navigation`, close sheet on click

**Header** (`src/components/layout/Header.tsx`):
- Fixed, `z-50`, height `h-14` (56px)
- Glassmorphic: `rgba(255,248,245,0.80)` + `backdrop-blur(12px)` + `border: 1px solid rgba(255,255,255,0.2)`
- Desktop: Logo | centered nav links | LocaleSwitcher + Book CTA
- Book CTA: `linear-gradient(135deg, #755944 0%, #9c7660 100%)`, `active:scale-[0.98]`, `hover:brightness-[1.08]`
- Nav links: underline slides from left on hover via position-absolute span
- Mobile: Logo | LocaleSwitcher | MobileDrawer (hamburger)

**Footer** (`src/components/layout/Footer.tsx`):
- Server Component (no `'use client'`)
- Background `#f5ede6` (surface-container-low), no border-top (No-Line Rule)
- Desktop single row: logo left | copyright center | Line+Phone icons right
- Copyright: `© {year} Lash Booking. {t('footer.copyright')}`

**StickyMandateBar** (`src/components/layout/StickyMandateBar.tsx`):
- `md:hidden` — mobile only
- Fixed bottom 16px, centered, pill shape: 52px height, border-radius 26px
- Background `#755944`, shadow-floating, `active:scale-[0.98]`
- Label from `stickyBar.label` translation (`จองคิวออนไลน์` / `Book Online`)
- Circular 36px white action button with arrow icon

**Layout shell** (`src/app/[locale]/layout.tsx`):
- `<Header />`, `<Footer />`, `<StickyMandateBar />` rendered inside `NextIntlClientProvider`
- `<main className="min-h-screen pt-14 pb-20 md:pb-0">` — pt-14 for fixed header, pb-20 for mobile sticky bar

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| Book CTA href="#" in Header | `src/components/layout/Header.tsx` | Per D-12, booking flow wired in Phase 3 |
| StickyMandateBar links to "#" | `src/components/layout/StickyMandateBar.tsx` | Per D-12, booking flow wired in Phase 3 |
| About page Book CTA placeholder | Footer Line/Phone contact icons | Actual Line ID / phone number added by owner before go-live |

These stubs are intentional per D-12 and the UI-SPEC Phase 1 notes. They do not prevent the plan's goal (layout shell visible on all pages) from being achieved.

## Self-Check: PASSED
