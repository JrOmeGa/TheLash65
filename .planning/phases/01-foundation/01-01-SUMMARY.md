---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [next.js, tailwind, shadcn, next-intl, typescript, biome, i18n, thai, fonts]

# Dependency graph
requires: []
provides:
  - Next.js 16 App Router project scaffold with TypeScript
  - Tailwind v4 CSS-first configuration with Champagne Minimalist design tokens
  - shadcn/ui components: Dialog, Card, Button, Sheet (copied into project)
  - next-intl bilingual routing — /th/ (default) and /en/ routes
  - Three-font stack: Noto Serif (heading), Manrope (body), Sarabun (Thai fallback)
  - Translation message files with full Copywriting Contract keys (th.json, en.json)
  - src/proxy.ts middleware for locale routing
  - Biome linter/formatter configuration
affects: [01-02, 01-03, 01-04, all subsequent plans]

# Tech tracking
tech-stack:
  added:
    - Next.js 16.2.1 (App Router, Turbopack)
    - React 19.2.4
    - TypeScript 5.9.3
    - Tailwind CSS 4.2.2 (CSS-first, @import "tailwindcss")
    - next-intl 4.8.3
    - Drizzle ORM 0.45.1
    - drizzle-kit 0.31.10
    - @supabase/supabase-js 2.99.3
    - postgres 3.4.8
    - zod 4.3.6
    - date-fns 4.1.0
    - clsx + tailwind-merge (shadcn utils)
    - class-variance-authority (shadcn CVA)
    - @radix-ui/react-dialog (shadcn Dialog/Sheet)
    - @radix-ui/react-slot (shadcn Button)
    - @biomejs/biome 2.4.8
    - @playwright/test 1.58.2
    - vitest 4.1.0
  patterns:
    - CSS-first Tailwind v4 with @theme block for design tokens
    - shadcn/ui components copied into src/components/ui/ (no package lock-in)
    - next-intl App Router pattern: proxy.ts + i18n/routing.ts + i18n/request.ts + i18n/navigation.ts
    - Locale layout with generateStaticParams + setRequestLocale for static generation
    - Font variables on <html> element, applied via CSS custom properties in body

key-files:
  created:
    - package.json — project manifest with all Phase 1 dependencies and scripts
    - tsconfig.json — TypeScript config for Next.js App Router
    - next.config.ts — Next.js config with createNextIntlPlugin
    - postcss.config.mjs — Tailwind v4 PostCSS plugin
    - biome.json — Biome linter/formatter config
    - src/app/globals.css — Tailwind v4 CSS-first with design tokens
    - src/proxy.ts — next-intl createMiddleware (Next.js 16 naming)
    - src/i18n/routing.ts — defineRouting with locales and defaultLocale th
    - src/i18n/request.ts — getRequestConfig for Server Components
    - src/i18n/navigation.ts — createNavigation exports
    - src/app/[locale]/layout.tsx — Root locale layout with fonts and NextIntlClientProvider
    - src/app/[locale]/page.tsx — Placeholder home page with translation key usage
    - messages/th.json — Thai translations (full Copywriting Contract)
    - messages/en.json — English translations (full Copywriting Contract)
    - src/components/ui/dialog.tsx — shadcn Dialog (lightbox-ready)
    - src/components/ui/card.tsx — shadcn Card with design system tokens
    - src/components/ui/button.tsx — shadcn Button with gradient CTA variant
    - src/components/ui/sheet.tsx — shadcn Sheet (mobile nav drawer)
    - src/lib/utils.ts — cn() utility using clsx + tailwind-merge
    - .env.example — Environment variable template
    - .gitignore — Excludes .env.local, .next/, drizzle/meta/
  modified:
    - tsconfig.json — Updated by Next.js build (jsx: react-jsx, target: ES2017)

key-decisions:
  - "src/proxy.ts used instead of middleware.ts per Next.js 16 convention"
  - "localeDetection: false — Thai default always, no browser auto-detection (D-14)"
  - "localePrefix: always — explicit /th/ and /en/ URL prefixes on all routes (D-17)"
  - "shadcn components created manually (not via CLI) to work in pre-existing git repo"
  - "clsx + tailwind-merge + class-variance-authority installed as required shadcn dependencies"

patterns-established:
  - "Pattern 1: next-intl routing — import routing from i18n/routing in both proxy.ts and layout.tsx"
  - "Pattern 2: Locale layout — await params, hasLocale check, setRequestLocale before any rendering"
  - "Pattern 3: Translation — useTranslations() in Client/Server components, messages loaded dynamically"
  - "Pattern 4: Design tokens — all colors/fonts via CSS custom properties in globals.css @theme block"

requirements-completed: [I18N-01, I18N-02, SITE-04]

# Metrics
duration: 6min
completed: 2026-03-22
---

# Phase 01 Plan 01: Project Scaffold Summary

**Next.js 16 project with Tailwind v4 CSS-first design tokens, next-intl /th/ and /en/ bilingual routing, three-font stack (Noto Serif + Manrope + Sarabun), and shadcn/ui Dialog/Card/Button/Sheet components**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-22T13:23:16Z
- **Completed:** 2026-03-22T13:29:31Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments

- Next.js 16 app builds and serves /th/ and /en/ as static SSG routes; visiting / redirects to /th/ via middleware
- Tailwind v4 CSS-first design system configured with all Champagne Minimalist tokens (surface #fff8f5, accent #755944, on-surface #1F1B18, font stacks)
- next-intl bilingual routing scaffolded with proxy.ts middleware, defineRouting, getRequestConfig, and createNavigation
- Three-font stack loaded via next/font/google with CSS variable injection on <html> element
- shadcn/ui Dialog, Card, Button, Sheet components installed in src/components/ui/ aligned with UI-SPEC

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js 16 project with Tailwind v4, Biome, and shadcn/ui** - `0c165a8` (feat)
2. **Task 2: Configure next-intl bilingual routing and locale layout with fonts** - `b75743b` (feat)

## Files Created/Modified

- `src/proxy.ts` — next-intl createMiddleware (Next.js 16: proxy.ts, not middleware.ts)
- `src/i18n/routing.ts` — defineRouting with locales ['th','en'], defaultLocale 'th', localePrefix 'always', localeDetection false
- `src/i18n/request.ts` — getRequestConfig with dynamic message imports
- `src/i18n/navigation.ts` — createNavigation exports (Link, redirect, useRouter, usePathname, getPathname)
- `next.config.ts` — createNextIntlPlugin wrapping nextConfig with Supabase image remote patterns
- `src/app/[locale]/layout.tsx` — Root locale layout with Noto_Serif/Manrope/Sarabun fonts and NextIntlClientProvider
- `src/app/[locale]/page.tsx` — Placeholder home page with setRequestLocale and translation key usage
- `messages/th.json` — Full Thai copywriting contract (nav, stickyBar, portfolio, services, about, footer)
- `messages/en.json` — Full English copywriting contract
- `src/app/globals.css` — Tailwind v4 with @theme design tokens, shadow utilities, scroll-behavior: smooth
- `src/components/ui/dialog.tsx` — shadcn Dialog (lightbox-ready, 44px close button tap target)
- `src/components/ui/card.tsx` — shadcn Card with design system tokens (white background, ambient shadow)
- `src/components/ui/button.tsx` — shadcn Button with gradient CTA variant and active:scale-[0.98]
- `src/components/ui/sheet.tsx` — shadcn Sheet with glassmorphic treatment (mobile nav drawer)
- `src/lib/utils.ts` — cn() utility
- `package.json` — All Phase 1 dependencies with npm scripts
- `biome.json` — Biome recommended rules with space indent
- `postcss.config.mjs` — @tailwindcss/postcss plugin
- `tsconfig.json` — Next.js 16 App Router TypeScript configuration
- `.env.example` / `.env.local` — Supabase environment variable template
- `.gitignore` — Excludes .env.local, .next/, drizzle/meta/

## Decisions Made

- Used `src/proxy.ts` instead of `middleware.ts` — Next.js 16 convention confirmed in RESEARCH.md Pattern 1
- Set `localeDetection: false` per D-14 decision — Thai market always starts on Thai
- Created shadcn components manually rather than running `npx shadcn@latest init` — the CLI requires interactive prompts and would conflict with the pre-existing git history; manual creation gives identical output
- Installed `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-dialog`, and `@radix-ui/react-slot` as the underlying dependencies shadcn components require (Rule 3 - blocking)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed shadcn peer dependencies manually**
- **Found during:** Task 1 (shadcn/ui component creation)
- **Issue:** shadcn CLI requires interactive terminal; components need clsx, tailwind-merge, class-variance-authority, @radix-ui packages that are not listed in the plan's npm install commands
- **Fix:** Installed missing packages via npm; created components by writing them directly rather than running the CLI in a non-interactive environment
- **Files modified:** package.json, package-lock.json
- **Verification:** TypeScript check passes, build succeeds
- **Committed in:** 0c165a8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix was necessary for correct operation. No scope creep.

## Issues Encountered

None beyond the shadcn CLI deviation above.

## User Setup Required

None - no external service configuration required for this plan. Supabase will be configured in a later plan when the database schema is deployed.

## Next Phase Readiness

- Next.js 16 App Router foundation is complete and builds without errors
- /th/ and /en/ routes both render and are statically generated
- All three fonts available via CSS variables — subsequent plans can use var(--font-noto-serif), var(--font-manrope), var(--font-sarabun)
- shadcn/ui Dialog and Sheet components ready for use in portfolio lightbox and mobile nav (Plans 01-02 and 01-03)
- Tailwind v4 design tokens ready — subsequent plans use Tailwind utility classes with the design system colors
- Translation keys established — all subsequent plans must add their copy to messages/th.json and messages/en.json

---
*Phase: 01-foundation*
*Completed: 2026-03-22*
