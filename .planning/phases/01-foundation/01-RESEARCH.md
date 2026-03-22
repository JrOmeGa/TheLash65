# Phase 1: Foundation - Research

**Researched:** 2026-03-22
**Domain:** Next.js 16 App Router, next-intl v4, Tailwind CSS v4, Drizzle ORM + Supabase, shadcn/ui
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Portfolio Gallery (SITE-01)
- **D-01:** 2-column grid on mobile, 3-column on tablet/desktop
- **D-02:** Tap/click on photo opens a lightbox modal (full-screen image view)
- **D-03:** Launch with placeholder images — real lash photos dropped in by owner before go-live
- **D-04:** No lazy-loading complexity for v1 — standard Next.js `<Image>` with `loading="lazy"`

#### Service Menu (SITE-02)
- **D-05:** Flat card list — one card per service (no category grouping for v1)
- **D-06:** Each card shows: service name, short description, duration, price in THB
- **D-07:** Price displayed as plain number with "฿" symbol — no "from" pricing or ranges
- **D-08:** Cards stacked vertically on mobile (full width), 2-column grid on desktop

#### About Page & Contact (SITE-03)
- **D-09:** Owner photo + short bio paragraph
- **D-10:** Contact methods: Line ID and phone number (no physical address — home studio privacy)
- **D-11:** Shop hours displayed as static text (not linked to schedule system — that's Phase 3)
- **D-12:** Booking CTA button on about page links to booking flow (will be wired in Phase 3)

#### Language Toggle (I18N-01, I18N-02)
- **D-13:** Default locale is Thai (`th`) — primary market
- **D-14:** No browser auto-detection — always start on Thai
- **D-15:** Toggle placed in the site header (visible on all pages)
- **D-16:** Simple text switcher: "TH | EN" — no flags or dropdown
- **D-17:** Locale stored in URL prefix: `/th/...` and `/en/...` (next-intl prefix strategy)

#### Date Display (I18N-03)
- **D-18:** All dates pass `calendar: 'gregory'` explicitly when formatting with Thai locale
- **D-19:** Store all dates as UTC in the database — no Buddhist Era in persistence layer

#### Database Schema
- **D-20:** Schema covers all v1 tables in one migration: `users`, `services`, `bookings`, `schedule_rules`, `schedule_exceptions`
- **D-21:** Services seeded with placeholder data (3 services: Classic, Hybrid, Volume) so the menu renders at launch
- **D-22:** Supabase connection uses session-mode port 5432 (not transaction-mode 6543) for Drizzle compatibility

### Claude's Discretion
- Exact lightbox implementation (shadcn Dialog or custom)
- Drizzle schema column types and constraints
- Navigation structure and mobile menu pattern
- Footer content and layout
- Loading/skeleton states for images

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope (user skipped gray area discussion; defaults applied)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-01 | Client can view a portfolio gallery of lash work photos | shadcn Dialog lightbox pattern, Next.js Image component with responsive grid |
| SITE-02 | Client can view the full service menu with descriptions and prices | Static data rendering via Server Components, Drizzle seed query |
| SITE-03 | Client can view the about page with owner info and contact details | Static page, no external integrations |
| SITE-04 | Site is mobile-first with responsive design across all screen sizes | Tailwind v4 responsive utilities, mobile-first breakpoints |
| I18N-01 | Site supports Thai and English languages | next-intl v4 routing + messages files |
| I18N-02 | User can toggle between Thai and English from any page | next-intl useRouter + usePathname locale switcher pattern |
| I18N-03 | Dates display correctly in both locales (Gregorian calendar, no Buddhist Era offset) | Intl.DateTimeFormat with `calendar: 'gregory'`, next-intl useFormatter |
</phase_requirements>

---

## Summary

Phase 1 establishes the full project skeleton: Next.js 16 App Router with `app/[locale]/` routing, Tailwind CSS v4 (CSS-first, no config file), next-intl v4 for bilingual Thai/English routing, and the Drizzle ORM schema deployed to Supabase. The public pages (portfolio gallery, service menu, about) are Server-Component-rendered static content seeded from the database.

The most critical setup decisions are all confirmed in CONTEXT.md: `proxy.ts` (Next.js 16 renamed `middleware.ts`), `localePrefix: 'always'` with `localeDetection: false`, session-mode port 5432 for Supabase, and explicit `calendar: 'gregory'` for all Thai date formatting. These are not optional — each has a known failure mode if skipped.

The database schema must cover all v1 tables in a single migration (D-20) so later phases can build on it without schema migrations mid-phase. The services table must be seeded immediately (D-21) so the service menu renders at launch without a Phase 3 dependency.

**Primary recommendation:** Scaffold `app/[locale]/` routing with next-intl v4 first — it is the hardest to retrofit and every other page depends on it. Then schema, then pages.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Full-stack framework, App Router | Turbopack default, React 19.2, proxy.ts, async params required |
| React | 19.2 (bundled) | UI rendering | Bundled with Next.js 16 — do NOT install separately |
| TypeScript | 5.x | Type safety | Required by Next.js 16 (min 5.1) |
| Tailwind CSS | 4.2.2 | Utility CSS | CSS-first via `@import "tailwindcss"`, no config file needed |
| next-intl | 4.8.3 | Thai/English i18n routing | Purpose-built for App Router, Server Components native |
| Drizzle ORM | 0.45.1 | Database access | Serverless-optimized, edge-compatible, TypeScript-first |
| drizzle-kit | 0.31.10 | DB migrations | Schema push + migration generation |
| @supabase/supabase-js | 2.99.3 | Supabase client for Storage (Phase 1: schema only) | Official client |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | 4.1.0 (CLI) | Dialog, Card, Button components | Lightbox, service cards — components are copied into project |
| Biome | latest | Linting + formatting | Replaces ESLint + Prettier; `next lint` removed in Next.js 16 |
| postgres (postgres-js) | 3.x | Drizzle postgres driver | Required by Drizzle for Node.js/Vercel serverless |
| date-fns | 4.1.0 | Date formatting | `th` locale for date-fns; pairs with react-day-picker (Phase 3) |
| Zod | 4.3.6 | Schema validation | Env var validation, future form use |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Dialog for lightbox | yet-another-react-lightbox | shadcn Dialog is already in stack; avoids extra dep for v1 simple use case |
| Drizzle session-mode (5432) | Transaction-mode (6543) | Transaction mode requires `prepare: false`; session mode is simpler for Drizzle |
| next-intl `localePrefix: 'always'` | `localePrefix: 'as-needed'` | `always` keeps URLs explicit and consistent with D-17 decision |

**Installation:**
```bash
# Core
npm install next@latest react@latest react-dom@latest
npm install typescript @types/node @types/react @types/react-dom

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Supabase
npm install @supabase/supabase-js

# i18n
npm install next-intl

# Styling (Tailwind v4)
npm install tailwindcss @tailwindcss/postcss postcss

# Utilities
npm install zod date-fns

# Dev tools
npm install -D @biomejs/biome
```

**shadcn/ui components (added via CLI, not npm install):**
```bash
npx shadcn@latest init
npx shadcn@latest add dialog card button
```

**Version verification (confirmed 2026-03-22):**
- next: 16.2.1
- next-intl: 4.8.3
- drizzle-orm: 0.45.1
- drizzle-kit: 0.31.10
- tailwindcss: 4.2.2
- @supabase/supabase-js: 2.99.3
- date-fns: 4.1.0
- zod: 4.3.6

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── [locale]/          # All locale-aware pages live here
│   │   ├── layout.tsx     # Root layout with NextIntlClientProvider
│   │   ├── page.tsx       # Home page (redirects to /gallery or landing)
│   │   ├── gallery/
│   │   │   └── page.tsx   # Portfolio gallery (SITE-01)
│   │   ├── services/
│   │   │   └── page.tsx   # Service menu (SITE-02)
│   │   └── about/
│   │       └── page.tsx   # About + contact (SITE-03)
│   └── api/               # API routes (Phase 2+, reserved)
├── components/
│   ├── ui/                # shadcn copied components
│   ├── gallery/           # GalleryGrid, LightboxModal
│   ├── services/          # ServiceCard, ServiceList
│   ├── layout/            # Header, Footer, LocaleSwitcher, Nav
│   └── about/             # AboutHero, ContactInfo
├── db/
│   ├── schema.ts          # Drizzle table definitions (all v1 tables)
│   ├── index.ts           # DB connection (postgres-js + drizzle)
│   └── seed.ts            # Services seed data (3 placeholder services)
├── i18n/
│   ├── routing.ts         # defineRouting({ locales, defaultLocale })
│   ├── request.ts         # getRequestConfig for Server Components
│   └── navigation.ts      # createNavigation exports (Link, useRouter, etc.)
├── proxy.ts               # next-intl createMiddleware (Next.js 16 name)
└── messages/
    ├── th.json            # Thai translations (default locale)
    └── en.json            # English translations
drizzle/                   # Generated migrations output
drizzle.config.ts          # Drizzle Kit config
next.config.ts             # Next.js config (with next-intl plugin)
postcss.config.mjs         # @tailwindcss/postcss plugin
biome.json                 # Biome lint + format config
```

### Pattern 1: next-intl Routing Setup (proxy.ts)
**What:** Next.js 16 uses `proxy.ts` instead of `middleware.ts`. next-intl's `createMiddleware` works identically — only the filename and export name change.
**When to use:** Required for locale-prefixed routing

```typescript
// src/proxy.ts
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

### Pattern 2: next-intl Routing Configuration
**What:** Define locales, default locale, disable browser detection, always-prefix strategy.
**When to use:** Once, at project setup.

```typescript
// src/i18n/routing.ts
// Source: https://next-intl.dev/docs/routing/middleware
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
  localePrefix: 'always',    // /th/... and /en/... always present
  localeDetection: false     // D-14: no browser auto-detection
});
```

### Pattern 3: Locale Layout with Static Rendering
**What:** `generateStaticParams` + `setRequestLocale` enables static generation per locale. Must be called in EVERY layout and page before any next-intl hook.
**When to use:** Every `app/[locale]/` layout and page file.

```typescript
// src/app/[locale]/layout.tsx
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Next.js 16: params is always async
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Pattern 4: Thai Date Formatting Without Buddhist Era (I18N-03)
**What:** `th-TH` locale defaults to Buddhist Era calendar (BE 2567 instead of 2024). Force Gregorian by passing `calendar: 'gregory'` to `Intl.DateTimeFormat` or next-intl's `useFormatter`.
**When to use:** Any date display on the site.

```typescript
// Using next-intl useFormatter (recommended, works in Client Components)
// Source: MDN Intl.DateTimeFormat + next-intl docs
import { useFormatter } from 'next-intl';

const format = useFormatter();
const displayDate = format.dateTime(date, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  calendar: 'gregory'  // CRITICAL: prevents Buddhist Era offset
});

// Using Intl.DateTimeFormat directly (Server Component / utility)
const formatted = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(date);
// Equivalent: pass 'u-ca-gregory' extension to locale string
```

### Pattern 5: Locale Switcher Component
**What:** Client Component that replaces the current page's locale while keeping the same pathname.
**When to use:** Header component (visible on all pages, D-15/D-16).

```typescript
// src/components/layout/LocaleSwitcher.tsx
// Source: https://next-intl.dev/docs/routing/navigation
'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();

  const switchLocale = (next: 'th' | 'en') => {
    router.replace({ pathname, params } as any, { locale: next });
  };

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => switchLocale('th')}
        className={locale === 'th' ? 'text-foreground' : 'text-muted-foreground'}
      >
        TH
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={() => switchLocale('en')}
        className={locale === 'en' ? 'text-foreground' : 'text-muted-foreground'}
      >
        EN
      </button>
    </div>
  );
}
```

### Pattern 6: Drizzle ORM Schema Definition
**What:** All v1 tables defined in a single `schema.ts`. Uses `uuid` PKs for user-facing tables and `integer` identity for internal tables.
**When to use:** D-20 requires all tables in one migration.

```typescript
// src/db/schema.ts
// Source: https://orm.drizzle.team/docs/sql-schema-declaration
import {
  pgTable, text, varchar, integer, timestamp,
  boolean, uuid, pgEnum, index
} from 'drizzle-orm/pg-core';

// Shared timestamp helper
const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

export const users = pgTable('users', {
  id: text('id').primaryKey(),              // Better Auth compatible (string ID)
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  ...timestamps,
});

export const services = pgTable('services', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  nameTh: text('name_th').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionTh: text('description_th'),
  descriptionEn: text('description_en'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceTHB: integer('price_thb').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
});

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', 'confirmed', 'cancelled'
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id),
  serviceId: integer('service_id').notNull().references(() => services.id),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
  paymentConfirmedAt: timestamp('payment_confirmed_at', { withTimezone: true }),
  notes: text('notes'),
  ...timestamps,
}, (t) => [
  index('bookings_user_idx').on(t.userId),
  index('bookings_scheduled_idx').on(t.scheduledAt),
]);

// Day of week: 0=Sunday, 6=Saturday
export const scheduleRules = pgTable('schedule_rules', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6
  openTime: text('open_time').notNull(),        // "09:00"
  closeTime: text('close_time').notNull(),      // "18:00"
  slotDurationMinutes: integer('slot_duration_minutes').notNull().default(120),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export const scheduleExceptions = pgTable('schedule_exceptions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  exceptionDate: timestamp('exception_date', { withTimezone: true }).notNull(),
  isClosed: boolean('is_closed').notNull().default(true),
  reason: text('reason'),
  ...timestamps,
});
```

### Pattern 7: Drizzle DB Connection (session-mode, Supabase)
**What:** postgres-js client with session-mode connection string (port 5432). Do NOT use `prepare: false` — that is only needed for transaction-mode (6543).
**When to use:** Single shared DB instance, imported by all server-side code.

```typescript
// src/db/index.ts
// Source: https://supabase.com/docs/guides/database/drizzle
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Uses session-mode connection string (port 5432) per D-22
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

```typescript
// drizzle.config.ts
// Source: https://orm.drizzle.team/docs/drizzle-config-file
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Pattern 8: Tailwind CSS v4 Setup
**What:** No `tailwind.config.js` — configuration lives in `globals.css` via `@theme`. Single `@import` replaces v3's three-line setup.
**When to use:** Initial project setup.

```css
/* app/globals.css */
/* Source: https://tailwindcss.com/docs/guides/nextjs */
@import "tailwindcss";

/* Thai font + custom theme tokens */
@theme {
  --font-sans: 'Sarabun', sans-serif;
  /* Brand colors added here when UI-SPEC phase runs */
}
```

```javascript
// postcss.config.mjs — required for v4
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### Pattern 9: shadcn Dialog as Lightbox (SITE-01, Claude's Discretion)
**What:** shadcn `Dialog` wrapping a full-screen `next/image`. Triggered by clicking gallery grid item. shadcn has an official "Dialog Image Preview" block.
**When to use:** Portfolio gallery lightbox (D-02). Recommended over third-party lightbox for v1 simplicity.

```typescript
// Simplified lightbox pattern using shadcn Dialog
// Source: https://www.shadcn.io/blocks/dialog-image-preview
'use client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';

export function GalleryLightbox({ src, alt, open, onClose }: LightboxProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-screen-lg p-0 bg-black">
        <Image src={src} alt={alt} fill className="object-contain" />
      </DialogContent>
    </Dialog>
  );
}
```

### Anti-Patterns to Avoid
- **Using `middleware.ts` in Next.js 16:** The file must be named `proxy.ts`. next-intl's `createMiddleware` works unchanged — only the filename and export change.
- **Forgetting `setRequestLocale` in pages:** Falls back to dynamic rendering silently. Call it at the top of every `[locale]/` page and layout before any `useTranslations` or `getTranslations`.
- **Async params accessed synchronously:** Next.js 16 requires `await params` — synchronous access throws at runtime.
- **`th-TH` locale without `calendar: 'gregory'`:** Produces Buddhist Era years (BE 2568 instead of 2025). Always pass explicitly (D-18).
- **Supabase transaction-mode port (6543) with Drizzle:** Causes prepared statement errors. Use session-mode (5432) per D-22.
- **Installing shadcn/ui as a package:** shadcn components are copied into `src/components/ui/` via CLI. There is no `npm install shadcn-ui` package.
- **Using `pages/` router:** All features and phase integrations require App Router.
- **Using `next lint`:** Removed in Next.js 16. Use `biome check` directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale routing + middleware | Custom locale-detection in proxy.ts | `next-intl createMiddleware` | Handles cookie, header, prefix detection; redirect logic is complex |
| Locale switcher navigation | Manual `window.location` manipulation | `next-intl useRouter.replace({ locale })` | Preserves pathname, handles locale prefix stripping correctly |
| Thai date formatting guard | Custom year offset logic (+543 correction) | `Intl.DateTimeFormat` with `calendar: 'gregory'` | Platform API; custom logic breaks with DST/timezone edge cases |
| DB migrations | Manual SQL files | `drizzle-kit push` (dev) / `drizzle-kit generate && migrate` (prod) | Schema drift, type mismatch between TS and DB |
| Image optimization | Manual sharp calls | `next/image` | Automatic WebP conversion, responsive `srcset`, lazy loading, blur placeholders |
| Modal/dialog accessibility | Custom DOM overlay | `shadcn Dialog` (Radix UI) | Focus trapping, escape key, scroll lock, ARIA roles — 50+ edge cases |

**Key insight:** Thai locale calendar behavior is a browser-native issue, not a library issue. Every date format call touching Thai locale must explicitly opt into Gregorian — there is no "set it once globally" escape hatch in Intl.

---

## Common Pitfalls

### Pitfall 1: Buddhist Era Year in Thai Locale
**What goes wrong:** `new Intl.DateTimeFormat('th-TH').format(date)` or `date.toLocaleDateString('th-TH')` displays year as 2568 (Buddhist Era) instead of 2025 (Gregorian).
**Why it happens:** `th-TH` locale defaults to the Buddhist calendar per Unicode CLDR spec. Browsers implement this correctly — it is not a bug.
**How to avoid:** Always pass `calendar: 'gregory'` in options, or use the `u-ca-gregory` Unicode extension tag: `'th-TH-u-ca-gregory'`.
**Warning signs:** Year displays as a 4-digit number 543 higher than expected. Easy to miss in dev if browser is set to `en-US`.

### Pitfall 2: proxy.ts vs middleware.ts Confusion
**What goes wrong:** next-intl i18n routing silently stops working, or build errors occur about unknown export names.
**Why it happens:** Next.js 16 renamed `middleware.ts` to `proxy.ts`. The exported function should also be renamed from `middleware` to `proxy`, though default export still works.
**How to avoid:** File must be at `src/proxy.ts`. Named export should be `proxy`. next-intl's `createMiddleware` output is used as a default export — no changes to the middleware logic itself.
**Warning signs:** Locale routing redirects stop working; visiting `/` doesn't redirect to `/th/`.

### Pitfall 3: setRequestLocale Omission (Silent Dynamic Rendering)
**What goes wrong:** Routes fall back to dynamic rendering silently. Build times increase; pages that should be static are not.
**Why it happens:** next-intl needs `setRequestLocale(locale)` called before any `useTranslations` / `getTranslations` to enable the async rendering pipeline for static generation.
**How to avoid:** Call `setRequestLocale(locale)` at the very top of every `app/[locale]/*/page.tsx` and `layout.tsx`, before any other code.
**Warning signs:** `next build` output shows routes as `λ` (dynamic) instead of `○` (static) for pages that should be pre-rendered.

### Pitfall 4: Supabase Connection Mode Mismatch
**What goes wrong:** Drizzle queries throw `prepared statement "xyz" already exists` errors in production.
**Why it happens:** Transaction-mode pooler (port 6543) does not support persistent connections or named prepared statements. Drizzle uses prepared statements by default.
**How to avoid:** Use session-mode connection string (port 5432) from Supabase Connect panel. Do not add `prepare: false` to the postgres-js client when using session mode — that option is only needed for transaction mode.
**Warning signs:** Works locally (direct connection) but fails on Vercel with prepared statement errors.

### Pitfall 5: Next.js 16 Async params Access
**What goes wrong:** Runtime error: "Route params should be awaited before accessing".
**Why it happens:** Next.js 16 fully removes synchronous `params` access that was deprecated in v15. `params` prop in layouts, pages, and route handlers is now `Promise<{...}>`.
**How to avoid:** Always `await params` in async Server Components. For Client Components, use `use(params)` from React 19.
**Warning signs:** Works in development with a warning in v15, throws hard error in v16 production build.

### Pitfall 6: Tailwind v4 PostCSS Not Configured
**What goes wrong:** Tailwind classes compile to empty CSS; styles don't apply.
**Why it happens:** Tailwind v4 requires explicit `@tailwindcss/postcss` PostCSS plugin. It is NOT auto-configured by Next.js.
**How to avoid:** Always create `postcss.config.mjs` with `"@tailwindcss/postcss": {}` plugin. Verify `globals.css` uses `@import "tailwindcss"` (not `@tailwind base/components/utilities`).
**Warning signs:** All Tailwind classes render but no styles appear in browser.

### Pitfall 7: shadcn init Overwrites globals.css
**What goes wrong:** Running `npx shadcn@latest init` rewrites `globals.css` with CSS variables that may not be v4-compatible or conflict with existing setup.
**Why it happens:** shadcn CLI generates its own globals.css with Tailwind v4 CSS variables for the component color system.
**How to avoid:** Run `npx shadcn@latest init` before adding any custom theme tokens to `globals.css`. Review the generated file — it should include `@import "tailwindcss"` and `@theme` block. Let shadcn establish the baseline.
**Warning signs:** Existing custom styles disappear after `shadcn init`.

---

## Code Examples

### next.config.ts with next-intl plugin
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,  // Optional but recommended for auto-memoization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',  // For Supabase Storage (Phase 1+)
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

### messages/th.json structure (starter)
```json
{
  "nav": {
    "gallery": "ผลงาน",
    "services": "บริการ",
    "about": "เกี่ยวกับเรา",
    "book": "จองคิว"
  },
  "gallery": {
    "title": "ผลงานของเรา",
    "altText": "รูปต่อขนตา"
  },
  "services": {
    "title": "บริการของเรา",
    "duration": "ระยะเวลา {minutes} นาที",
    "price": "฿{amount}"
  },
  "about": {
    "title": "เกี่ยวกับเรา",
    "contactLine": "LINE ID",
    "contactPhone": "โทรศัพท์",
    "hours": "เวลาทำการ",
    "bookCta": "จองคิวเลย"
  }
}
```

### Services seed (db/seed.ts)
```typescript
// Source: Drizzle ORM docs + D-21 decision
import { db } from './index';
import { services } from './schema';

async function seed() {
  await db.insert(services).values([
    {
      nameTh: 'คลาสสิค',
      nameEn: 'Classic',
      descriptionTh: 'ต่อขนตาแบบเส้นต่อเส้น ดูเป็นธรรมชาติ',
      descriptionEn: 'One extension per natural lash for a natural look',
      durationMinutes: 90,
      priceTHB: 800,
      sortOrder: 1,
    },
    {
      nameTh: 'ไฮบริด',
      nameEn: 'Hybrid',
      descriptionTh: 'ผสมระหว่างคลาสสิคและวอลลุ่ม',
      descriptionEn: 'Mix of classic and volume for added texture',
      durationMinutes: 120,
      priceTHB: 1100,
      sortOrder: 2,
    },
    {
      nameTh: 'วอลลุ่ม',
      nameEn: 'Volume',
      descriptionTh: 'ขนตาเต็มหนาดูอลังการ',
      descriptionEn: 'Full, dramatic lashes with mega volume fans',
      durationMinutes: 150,
      priceTHB: 1400,
      sortOrder: 3,
    },
  ]);
}

seed().then(() => process.exit(0));
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 (Oct 2025) | Rename required; edge runtime no longer supported in proxy |
| Synchronous `params` access | `await params` | Next.js 16 (breaking) | All page/layout components must be async |
| `tailwind.config.js` | `@theme {}` in `globals.css` | Tailwind v4 (Jan 2025) | No config file generated; CSS-first configuration |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 (Jan 2025) | Single import line |
| `next lint` command | `biome check` | Next.js 16 (`next lint` removed) | Must configure Biome or ESLint CLI directly |
| `serverRuntimeConfig` / `publicRuntimeConfig` | Direct `process.env` + `NEXT_PUBLIC_` prefix | Next.js 16 (removed) | Simplifies config access |
| `experimental.turbopack` config | `turbopack` top-level config | Next.js 16 | Config location change |
| Auth.js / NextAuth.js (new projects) | Better Auth | Sept 2025 (Auth.js team joined Better Auth) | Better Auth recommended for all new projects |

**Deprecated/outdated:**
- `next lint`: Removed in Next.js 16. Use `biome check` or `eslint` CLI.
- `middleware.ts` / `export function middleware()`: Renamed to `proxy.ts` / `export function proxy()`.
- `images.domains`: Deprecated, replaced by `images.remotePatterns`.
- `next/legacy/image`: Deprecated, use `next/image`.
- `pages/` router: Legacy — not for new features.

---

## Open Questions

1. **Supabase region selection**
   - What we know: Research confirms Singapore (ap-southeast-1) is lowest latency from Thailand
   - What's unclear: Whether the free tier project must be manually set to Singapore or if there's a default
   - Recommendation: Verify region during Supabase project creation in Phase 1; cannot change after project creation

2. **Sarabun font via next/font vs self-hosted**
   - What we know: CLAUDE.md recommends `next/font/google` for Sarabun; Thai fonts load well in Thailand via Google CDN
   - What's unclear: Whether Vercel edge caching of Google Fonts is sufficient for Thai mobile users or if self-hosting is materially faster
   - Recommendation: Use `next/font/google` for Phase 1; measure Core Web Vitals in Phase 1 review; self-host if needed

3. **Placeholder image source for portfolio gallery**
   - What we know: D-03 says launch with placeholder images; real photos added by owner before go-live
   - What's unclear: Whether placeholders should be local static files or Supabase Storage blobs
   - Recommendation: Local static placeholder images for Phase 1 (avoids Storage setup dependency). Supabase Storage integration deferred to when owner provides real photos.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) + Vitest (unit) |
| Config file | `playwright.config.ts` + `vitest.config.ts` — Wave 0 gap |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx playwright test && npx vitest run` |

**Rationale for framework choice:** Phase 1 is UI-heavy (gallery, service cards, locale switcher, date formatting). The highest-value tests are:
1. **E2E smoke (Playwright):** Verify pages load at `/th/` and `/en/` without errors — covers SITE-01..04 and I18N-01/02 in one pass
2. **Unit (Vitest):** Date formatting utility — the Buddhist Era pitfall is a pure function, easy to unit test without a browser

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| SITE-01 | Portfolio gallery renders images in grid | E2E smoke | `npx playwright test tests/gallery.spec.ts` | ❌ Wave 0 |
| SITE-01 | Lightbox opens on image click | E2E | `npx playwright test tests/gallery.spec.ts` | ❌ Wave 0 |
| SITE-02 | Service cards render with name, price, duration | E2E smoke | `npx playwright test tests/services.spec.ts` | ❌ Wave 0 |
| SITE-03 | About page renders with contact info | E2E smoke | `npx playwright test tests/about.spec.ts` | ❌ Wave 0 |
| SITE-04 | No horizontal scroll on 375px viewport | E2E | `npx playwright test tests/responsive.spec.ts` | ❌ Wave 0 |
| I18N-01 | `/th/` and `/en/` routes load without 404 | E2E smoke | `npx playwright test tests/i18n.spec.ts` | ❌ Wave 0 |
| I18N-02 | Locale toggle navigates from `/th/` to `/en/` same page | E2E | `npx playwright test tests/i18n.spec.ts` | ❌ Wave 0 |
| I18N-03 | Date formatted with Gregorian year (not BE+543) | Unit | `npx vitest run tests/unit/date-format.test.ts` | ❌ Wave 0 |
| DB schema | All 5 tables created in Supabase migration | Manual | `drizzle-kit push && drizzle-kit check` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run` (unit tests only, < 5 seconds)
- **Per wave merge:** `npx playwright test && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/gallery.spec.ts` — covers SITE-01 (grid render + lightbox)
- [ ] `tests/services.spec.ts` — covers SITE-02 (service card data)
- [ ] `tests/about.spec.ts` — covers SITE-03 (about page content)
- [ ] `tests/responsive.spec.ts` — covers SITE-04 (375px no horizontal scroll)
- [ ] `tests/i18n.spec.ts` — covers I18N-01, I18N-02 (locale routing + switcher)
- [ ] `tests/unit/date-format.test.ts` — covers I18N-03 (Buddhist Era guard)
- [ ] `playwright.config.ts` — Playwright configuration
- [ ] `vitest.config.ts` — Vitest configuration
- [ ] Framework installs: `npm install -D playwright vitest @vitejs/plugin-react`

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — proxy.ts rename, async params, breaking changes, Turbopack defaults (verified 2026-03-17)
- [next-intl App Router with i18n routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) — complete setup pattern, routing.ts, proxy.ts, layout structure
- [next-intl routing/middleware docs](https://next-intl.dev/docs/routing/middleware) — localePrefix, localeDetection configuration
- [next-intl navigation docs](https://next-intl.dev/docs/routing/navigation) — locale switcher useRouter.replace pattern
- [Tailwind CSS v4 Next.js guide](https://tailwindcss.com/docs/guides/nextjs) — @import "tailwindcss", postcss.config.mjs requirement
- [Drizzle ORM SQL schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration) — pgTable, column types, indexes, foreign keys
- [Drizzle config file docs](https://orm.drizzle.team/docs/drizzle-config-file) — drizzle.config.ts format
- [Supabase Drizzle guide](https://supabase.com/docs/guides/database/drizzle) — connection string setup, postgres-js configuration

### Secondary (MEDIUM confidence)
- npm registry (verified 2026-03-22): next@16.2.1, next-intl@4.8.3, drizzle-orm@0.45.1, tailwindcss@4.2.2
- [shadcn Dialog Image Preview block](https://www.shadcn.io/blocks/dialog-image-preview) — official lightbox block pattern
- MDN Intl.DateTimeFormat — `calendar: 'gregory'` option for Thai locale

### Tertiary (LOW confidence — flag for validation)
- WebSearch: Supabase Singapore region recommendation for Thailand — single source, not verified against Supabase docs
- WebSearch: `prepare: false` only needed for transaction-mode — needs explicit Supabase docs confirmation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified against npm registry 2026-03-22
- Architecture: HIGH — patterns from official Next.js 16 and next-intl docs
- Pitfalls: HIGH — Next.js 16 breaking changes from official upgrade guide; Buddhist Era from MDN + CLDR spec
- Validation: MEDIUM — framework choices are standard; specific test file names are planner discretion

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable stack; Tailwind/next-intl fast-moving, re-verify if > 30 days)
