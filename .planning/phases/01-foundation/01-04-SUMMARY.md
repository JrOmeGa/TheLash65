---
phase: 01-foundation
plan: 04
subsystem: ui

tags: [portfolio, gallery, lightbox, services, service-cards, about, bilingual, next-intl, shadcn, next-image, drizzle]

# Dependency graph
requires:
  - 01-02  # DB schema (services table) and seed
  - 01-03  # Layout shell (Header + Footer wired); locale layout renders pages inside it
provides:
  - Portfolio gallery page at /[locale]/portfolio with 2-col/3-col responsive grid and Dialog lightbox
  - Service menu page at /[locale]/services querying active services from DB
  - About page at /[locale]/about with owner photo, bio, contact info, hours, CTA
  - GalleryGrid, GalleryLightbox, ServiceCard, ServiceList, AboutContent, ContactInfo components
affects: [all subsequent plans — these are the three primary public content pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component pages call setRequestLocale() + getTranslations() — standard next-intl App Router pattern"
    - "Client Component GalleryGrid uses useState for lightbox open/image state"
    - "shadcn Dialog used as full-screen lightbox (bg-black/90, object-contain, no default padding)"
    - "Lazy DB proxy in src/db/index.ts — defers postgres() URL parsing until first query to prevent build-time failure"
    - "Services page: try/catch around db.select() — renders error state card on DB failure"
    - "generateStaticParams on all three pages — SSG for both locales at build time"
    - "Image with fill + aspect-ratio wrapper — all gallery and owner photo images"

# Key files
key-files:
  created:
    - src/app/[locale]/portfolio/page.tsx
    - src/components/gallery/GalleryGrid.tsx
    - src/components/gallery/GalleryLightbox.tsx
    - src/app/[locale]/services/page.tsx
    - src/components/services/ServiceCard.tsx
    - src/components/services/ServiceList.tsx
    - src/app/[locale]/about/page.tsx
    - src/components/about/AboutContent.tsx
    - src/components/about/ContactInfo.tsx
    - public/images/portfolio/placeholder-1.jpg through placeholder-6.jpg
    - public/images/about/owner.jpg
  modified:
    - src/db/index.ts  # lazy proxy to prevent build-time URL parse error

# Decisions
decisions:
  - "Lazy DB proxy in src/db/index.ts: postgres() now deferred to first query — fixes build failure when DATABASE_URL has placeholder values"
  - "Gallery tiles implemented as <button> for keyboard accessibility and correct semantics"
  - "GalleryLightbox uses custom close button (not the default DialogContent close) for full control over positioning and white-on-dark styling"
  - "ServiceCard category label hardcoded as 'Lash Extension' / 'ต่อขนตา' — will be DB-driven if categories are added in a future phase"
  - "AboutContent bio is hardcoded placeholder text — owner replaces before go-live"
  - "Services page uses try/catch around entire db.select() chain — shows error state card on any DB/connection failure"

# Metrics
metrics:
  duration: "~5 minutes"
  completed_date: "2026-03-22"
  tasks_completed: 3
  files_created: 11
  files_modified: 1
---

# Phase 01 Plan 04: Public Pages (Portfolio, Services, About) Summary

Three fully bilingual, responsive public-facing pages — Portfolio gallery with Dialog lightbox, Service menu with DB-backed cards, and About page with owner photo and contact info — completing the pre-booking content experience for /th/ and /en/ locales.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Portfolio gallery page, GalleryGrid, GalleryLightbox, 6 placeholder images | 3997577 | 3 created, 6 images |
| 2 | Service menu page, ServiceCard, ServiceList; lazy DB proxy fix | c689453 | 3 created, 1 modified |
| 3 | About page, AboutContent, ContactInfo, owner placeholder photo | 2ba179b | 3 created, 1 image |

## What Was Built

**GalleryGrid** (`src/components/gallery/GalleryGrid.tsx`):
- `'use client'` — needs `useState` for lightbox open/image tracking
- `data-testid="gallery-grid"`, `grid grid-cols-2 md:grid-cols-3`, `gap-2 md:gap-[12px]`
- Each tile: `aspect-[4/5]`, `rounded-xl`, `loading="lazy"`, `hover:scale-[1.02]`, `active:scale-[0.98]`
- Empty state: 120px min-height card with centered text at 60% opacity
- Opens GalleryLightbox on click with selected image

**GalleryLightbox** (`src/components/gallery/GalleryLightbox.tsx`):
- shadcn Dialog with full-screen DialogContent: `bg-black/90`, `p-0`, `max-w-none`
- `<Image fill className="object-contain" />` — fill mode, contain fit
- Custom DialogClose: top-right, white, `min-h-[44px] min-w-[44px]`, `aria-label={closeLabel}` (i18n)

**Portfolio page** (`src/app/[locale]/portfolio/page.tsx`):
- Server Component — `setRequestLocale`, `getTranslations('portfolio')`, `generateStaticParams`
- 6 placeholder images from `/images/portfolio/placeholder-{1-6}.jpg`
- Noto Serif 30px heading, `bg-[var(--color-surface)]` background

**ServiceCard** (`src/components/services/ServiceCard.tsx`):
- `data-testid` on card, name, price, duration, category
- Noto Serif 20px service name, accent `#755944` price, clock icon + duration label
- `shadow-ambient`, `hover:shadow-elevated`, `active:scale-[0.98]`, `rounded-xl`
- No border (No-Line Rule) — containment via shadow only
- `uppercase tracking-[0.2em]` micro-label for category

**ServiceList** (`src/components/services/ServiceList.tsx`):
- `grid-cols-1 md:grid-cols-2 gap-6`
- Locale-based field selection: `nameTh`/`nameEn`, `descriptionTh`/`descriptionEn`
- Duration formatted by replacing `{minutes}` in the translation template
- Empty state card: 120px min-height, centered text

**Services page** (`src/app/[locale]/services/page.tsx`):
- `setRequestLocale`, `getTranslations('services')`, `generateStaticParams`
- `await db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder))`
- try/catch: renders error state card on DB failure

**ContactInfo** (`src/components/about/ContactInfo.tsx`):
- `data-testid="contact-info"`, chat icon + Line ID, phone icon + number
- Icon color `#755944`, each row `min-h-[44px]`
- No physical address (D-10 privacy)

**AboutContent** (`src/components/about/AboutContent.tsx`):
- `max-w-[640px] mx-auto` layout
- Owner photo: `aspect-[4/5]`, `rounded-xl`, `w-full md:w-80`
- Bio placeholder text, bilingual
- Contact and Hours sections with `uppercase tracking-[0.2em]` micro-labels
- Book CTA: `data-testid="book-cta"`, `linear-gradient(135deg, #755944, #9c7660)`, `active:scale-[0.98]`, links to `#`

**About page** (`src/app/[locale]/about/page.tsx`):
- `setRequestLocale`, `getTranslations('about')`, `generateStaticParams`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Lazy DB proxy to prevent build-time URL parse failure**
- **Found during:** Task 2 build verification
- **Issue:** `src/db/index.ts` called `postgres(process.env.DATABASE_URL!)` at module evaluation time. With a placeholder DATABASE_URL (`postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`), `postgres()` threw `ERR_INVALID_URL` during Next.js static page collection, failing the entire build.
- **Fix:** Replaced the eager `postgres()` call with a lazy proxy. The actual connection is only established on the first query, so importing `@/db` during build no longer fails. The singleton pattern re-uses the connection once established.
- **Files modified:** `src/db/index.ts`
- **Commit:** c689453 (included with Task 2)

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| Book CTA href="#" | `src/components/about/AboutContent.tsx` | Per D-12 — booking flow wired in Phase 3 |
| Owner photo is a 1-pixel placeholder JPEG | `public/images/about/owner.jpg` | Real photo added by owner before go-live |
| Portfolio images are 1-pixel placeholder JPEGs | `public/images/portfolio/placeholder-1..6.jpg` | Real lash photos added by owner before go-live (D-03) |
| Bio text is hardcoded placeholder | `src/components/about/AboutContent.tsx` | Owner replaces bio before go-live |
| ServiceCard category label hardcoded | `src/components/services/ServiceCard.tsx` | No category table in v1 schema; to be wired if categories added later |
| ContactInfo uses placeholder Line ID and phone | `src/components/about/ContactInfo.tsx` | Owner sets real values before go-live |

These stubs are intentional per D-03 (gallery placeholders), D-12 (CTA), and the About page spec. They do not prevent the plan's goal (public pages render correctly) from being achieved.

## Self-Check: PASSED
