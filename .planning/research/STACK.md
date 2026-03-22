# Stack Research

**Domain:** Mobile-first booking website — solo lash technician, Thailand market
**Researched:** 2026-03-22
**Confidence:** HIGH (core framework, auth, i18n, notifications verified via official docs and Context7; PromptPay library verified via npm/GitHub)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16 (latest stable, Oct 2025) | Full-stack React framework | App Router + Server Components = excellent SSR for mobile. Turbopack default bundler for fast builds. Single repo handles API routes, auth callbacks, and server actions — no separate backend needed for a solo-operator app. Vercel edge network covers Southeast Asia well. |
| React | 19.2 (bundled with Next.js 16) | UI rendering | Required by Next.js 16. React Compiler (stable in v16) auto-memoizes components — no manual `useMemo`/`useCallback` needed. |
| TypeScript | 5.x (minimum 5.1 per Next.js 16) | Type safety | Next.js 16 requires TS 5.1+. Catches integration errors between LINE/PromptPay payloads and your data models early. |
| Tailwind CSS | 4.x (stable since Jan 2025) | Utility-first CSS | CSS-first configuration (no `tailwind.config.js`). 3.5x faster full rebuilds vs v3. Works directly with shadcn/ui. Mobile-first responsive utilities. Thai fonts slot in cleanly via `@font-face` in the CSS config. |
| shadcn/ui | latest (supports Tailwind v4) | UI component library | Not a dependency — components are copied into your project, so no version lock-in. Calendar, Dialog, Sheet (mobile drawer), Form, and Select components directly applicable to booking flow. Built on Radix UI for accessibility. |

### Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Better Auth | 1.5.x (latest stable) | SSO authentication | **Auth.js team officially joined Better Auth on September 22, 2025; new projects should use Better Auth.** Supports LINE Login, Facebook, and Google out of the box with minimal config. First-class Next.js support. TypeScript-native. LINE provider verified in official docs: requires `openid profile email` scopes configured in LINE Developers Console. |

### Database and Backend

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase | latest (managed) | PostgreSQL database + file storage | Generous free tier (50k users/month, 500MB DB). Built-in Row Level Security for booking data access control. Portfolio image storage included. No infrastructure to manage — critical for a solo-operator app. Located in Singapore region (ap-southeast-1) for low latency from Thailand. |
| Drizzle ORM | latest | Database access layer | Serverless-optimized: ~90% smaller bundle than Prisma, cold starts under 500ms vs 1-3s for Prisma. Works perfectly with Supabase PostgreSQL using the session-mode connection string. TypeScript-first schema definition. Better fit than Prisma for Vercel Edge/serverless deployment. |

### Thai Market Integrations

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| promptpay-qr | 0.5.0 | Generate PromptPay QR payload string | The de facto standard Thai PromptPay library (by dtinth, a well-known Thai developer). Generates the EMVCo QR payload string from a PromptPay ID (phone or national ID) and amount. Stable — the PromptPay EMVCo spec does not change. |
| qrcode | latest | Render QR payload as PNG/SVG/canvas | Works in both Node.js and browser. Combine with `promptpay-qr` to produce a scannable QR image. Supports `toDataURL()` for inline display and `toFile()` for server-side PNG generation (downloadable). |
| @line/bot-sdk | 10.6.x (Jan 2025) | LINE Messaging API push notifications | Official LINE SDK for Node.js. LINE Notify was **terminated March 31, 2025** — this is the replacement. Use push messages to notify client and owner on booking events. Requires a LINE Official Account and Messaging API channel. Free tier: 200 messages/month. |

### Internationalization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next-intl | 3.x / 4.x | Thai/English i18n | The standard i18n library for Next.js App Router. Works with Server Components natively. Provides locale-based routing (`/th/`, `/en/`), ICU message syntax (handles Thai grammar), and `useTranslations` hook for both server and client components. Used by Node.js, Uber, Todoist. |

### Email Notifications

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Resend | latest | Transactional email (booking confirmations) | Built by developers for developers. Native Next.js integration via Server Actions. Pairs with `react-email` for building booking confirmation templates in JSX. 100 emails/day free. Simple API: one function call to send. |
| react-email | latest | Email template rendering | Build email HTML with React components instead of HTML strings. Same component mental model as the rest of the app. Renders to compatible HTML for Gmail, Apple Mail, and Thai telco webmail clients. |

### Calendar/Booking UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-day-picker | latest (used by shadcn/ui Calendar) | Date picker for booking flow | shadcn/ui's Calendar component is built directly on react-day-picker. 6M+ weekly downloads. Lightweight, mobile-friendly. Sufficient for single-slot appointment selection — no need for heavy event calendar libraries. Localization support covers `th` locale via `date-fns`. |
| date-fns | latest | Date manipulation and formatting | Pairs with react-day-picker. Includes `th` locale for Thai date formatting. Tree-shakeable. Use for slot availability logic, formatting confirmation timestamps in Thai. |

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | latest | Runtime schema validation | Validate booking form data, LINE webhook payloads, and environment variable types. Use with react-hook-form for booking form. |
| react-hook-form | latest | Form state management | Booking and admin forms. Integrates cleanly with Zod via `@hookform/resolvers`. Minimal re-renders — important for mobile performance. |
| @hookform/resolvers | latest | Zod adapter for react-hook-form | Needed to connect Zod schemas to react-hook-form. |
| Zustand | latest | Client state management | Session-local state only (e.g., booking wizard step, selected service). Most state lives in the database — keep client state minimal. Avoid Redux for a project this size. |
| Sharp | latest | Server-side image optimization | Optimize portfolio images at upload time before storing in Supabase Storage. Next.js uses Sharp internally; explicit installation required on Vercel. |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Biome | Linting and formatting | `next lint` is removed in Next.js 16. Biome replaces ESLint + Prettier in one tool. Faster than both. Configure via `biome.json`. |
| Vercel CLI | Local dev + deployment | `vercel dev` mirrors edge functions locally. Deployment to production is `vercel --prod`. |
| Drizzle Kit | DB migrations and schema push | `drizzle-kit push` for development schema sync. `drizzle-kit generate` + `drizzle-kit migrate` for production migrations. |
| dotenv-vault | Environment variable management | Keep `.env` values synced across local/staging/production. For a solo operator, `.env.local` + Vercel dashboard is sufficient at launch. |

---

## Installation

```bash
# Create project
npx create-next-app@latest lash-booking --typescript --tailwind --eslint --app --src-dir

# Core auth
npm install better-auth

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Thai market integrations
npm install promptpay-qr qrcode @line/bot-sdk

# i18n
npm install next-intl

# Email
npm install resend react-email @react-email/components

# Forms and validation
npm install react-hook-form zod @hookform/resolvers

# Date handling
npm install date-fns react-day-picker

# UI (shadcn components copied per-component, not installed as package)
npx shadcn@latest init

# State
npm install zustand

# Dev tools
npm install -D @biomejs/biome
npx @biomejs/biome init
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Remix / SvelteKit | If the team has strong existing Remix or Svelte experience. Next.js wins here because the ecosystem has the most examples of LINE and PromptPay integration in a Thai context. |
| Better Auth | Auth.js v5 (NextAuth) | Auth.js still receives security patches and works. Choose it only if migrating an existing Auth.js project. For new projects, Better Auth is the official recommendation from the Auth.js maintainers themselves. |
| Drizzle ORM | Prisma | Choose Prisma if the team prefers its DX (schema.prisma, Prisma Studio) and does not need edge-optimized cold starts. Both work with Supabase. |
| Supabase | PlanetScale / Neon | Neon is a strong alternative (also serverless Postgres). Choose Neon if Supabase's file storage isn't needed. PlanetScale uses MySQL — incompatible with Drizzle's Postgres dialect. |
| Resend | Nodemailer / SendGrid | Nodemailer requires SMTP server setup. SendGrid is heavier and designed for marketing volume. Resend is purpose-built for transactional dev workflows and integrates natively with react-email. |
| @line/bot-sdk | Custom Axios calls to LINE API | The official SDK handles HMAC webhook verification, message type schemas, and keeps up with LINE API changes. Avoid raw HTTP calls. |
| react-day-picker (via shadcn) | FullCalendar / react-big-calendar | FullCalendar and react-big-calendar are designed for event-heavy dashboards. For a booking picker (select one slot), they're massive overkill. The admin availability view may use react-big-calendar if a weekly schedule grid is needed. |
| next-intl | i18next / react-i18next | i18next is framework-agnostic. next-intl is purpose-built for Next.js App Router and works with Server Components without bridging libraries. For a two-language site, next-intl is simpler. |
| Tailwind CSS v4 | Tailwind CSS v3 | Only choose v3 if using UI libraries that haven't updated to v4 yet. shadcn/ui already supports v4. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| LINE Notify | **Terminated March 31, 2025.** All API calls fail. Any tutorial referencing it is outdated. | `@line/bot-sdk` with Messaging API push messages |
| Auth.js / NextAuth.js (new project) | Auth.js team officially moved to Better Auth in September 2025. Auth.js only receives security patches going forward. Starting on it creates a migration liability. | `better-auth` |
| Stripe / Omise / payment gateways | Out of scope per PROJECT.md. The owner confirmed manual PromptPay confirmation is sufficient and avoids gateway fees + compliance overhead. | `promptpay-qr` + `qrcode` for QR display |
| next/font with Google Fonts for Thai | Google Fonts' Sarabun/Noto Thai load well in Thailand, but self-hosting via `next/font` is faster. Do not use a `<link>` tag to Google Fonts in production. | `next/font/google` or self-hosted Thai font files |
| Prisma on Vercel Edge | Prisma's query engine binary is not supported on edge runtime. Bundle size causes cold start timeouts. | Drizzle ORM (pure JavaScript, edge-compatible) |
| `pages/` router (Next.js) | Pages Router is legacy. All Next.js 16 features (Cache Components, proxy.ts, React Compiler) require App Router. | `app/` directory (App Router) |
| Clerk | Excellent DX but paid beyond 10k MAU. Overkill for a solo-operator site with limited users. | Better Auth (free, self-hosted) |
| MongoDB / Firestore | No strong typing for relational booking data (user → booking → service → slot). Relational queries are cleaner with Postgres. | Supabase (PostgreSQL) + Drizzle |

---

## Stack Patterns by Variant

**For the booking flow (client-facing):**
- Use Next.js Server Components for service listing and availability fetching (no client JS for static data)
- Use Server Actions for booking submission and QR generation
- Use Client Components only for the date picker and service selector (interactive)

**For the admin dashboard (owner-facing):**
- Use Next.js Route Groups: `(admin)` layout with Better Auth session check in `proxy.ts`
- Use Server Actions for confirming payments (triggers LINE push + email)
- Protect all admin routes with Better Auth's `auth.api.getSession()` check server-side

**For LINE notifications (owner + client):**
- LINE Messaging API requires a webhook endpoint — set up a route at `app/api/line/route.ts`
- For push messages (outbound notifications), call `@line/bot-sdk` MessagingApiClient from Server Actions
- Owner must "friend" the LINE Official Account to receive push messages

**For PromptPay QR display:**
- Generate QR on the server (Server Action or API route) using `promptpay-qr` + `qrcode`
- Return as a base64 `data:image/png;base64,...` string
- Render inline via `<img>` tag; provide a download link using the same data URL
- Amount should be pre-filled from the selected service price

**For bilingual routing:**
- Use next-intl with locale prefix strategy: `/th/...` and `/en/...`
- Set `th` as default locale (primary market)
- Store user locale preference in a cookie via next-intl middleware
- Thai fonts: use `Sarabun` from `next/font/google` — excellent legibility on mobile

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16 | Node.js 20.9+ | Node.js 18 dropped in Next.js 16. Vercel uses Node.js 20.x by default. |
| Next.js 16 | React 19.2 | Bundled together — do not install React separately at different version. |
| Tailwind CSS 4.x | shadcn/ui (latest) | shadcn/ui supports Tailwind v4 as of early 2025. Verify with `npx shadcn@latest` — the CLI auto-detects v4. |
| Drizzle ORM | Supabase (session mode) | Use Supabase's **session mode** connection string (port 5432), not transaction mode (port 6543), for Drizzle to avoid prepared statement conflicts. |
| better-auth 1.5.x | Next.js 16 / App Router | Confirmed first-class Next.js support. Use `auth.api.getSession()` in Server Components and `proxy.ts` for route protection. |
| @line/bot-sdk 10.6.x | Node.js 18+ | 10.x uses ESM. Verify `"type": "module"` is not conflicting with Next.js's CommonJS server-side compilation. Use named imports. |
| next-intl 3.x/4.x | Next.js 16 App Router | next-intl v4 targets Next.js 15+/16. Use `getRequestConfig` for App Router setup. |
| react-day-picker | date-fns v3+ | react-day-picker v8+ requires date-fns v3 as peer dependency. Do not mix with date-fns v2. |

---

## Sources

- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — verified Next.js 16 stable (Oct 21, 2025), Turbopack default, Node.js 20.9+ requirement — HIGH confidence
- [Better Auth LINE provider docs](https://better-auth.com/docs/authentication/line) — LINE SSO config verified — HIGH confidence
- [Auth.js joins Better Auth announcement](https://better-auth.com/blog/authjs-joins-better-auth) — merger confirmed Sept 22, 2025; Better Auth recommended for new projects — HIGH confidence
- [LINE Notify termination](https://developers.line.biz/en/news/2025/) — service terminated March 31, 2025 — HIGH confidence
- [@line/bot-sdk GitHub releases](https://github.com/line/line-bot-sdk-nodejs/releases) — latest v10.6.0 (Jan 2025) — HIGH confidence
- [promptpay-qr npm](https://www.npmjs.com/package/promptpay-qr) — v0.5.0, last published ~4 years ago, stable (spec doesn't change) — MEDIUM confidence (unmaintained but functional)
- [next-intl homepage](https://next-intl.dev/) — v3/v4 confirmed, App Router native, ICU message syntax — HIGH confidence
- [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4) — stable Jan 22, 2025 — HIGH confidence
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — v4 supported, OKLCH colors — HIGH confidence
- [Drizzle vs Prisma 2026 comparison](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — serverless cold start data — MEDIUM confidence (third-party benchmark)
- WebSearch: Better Auth v1.5.5 (latest as of research date) — MEDIUM confidence (npm search result)
- WebSearch: Resend + react-email Next.js integration pattern — MEDIUM confidence (multiple consistent sources)

---

*Stack research for: mobile-first bilingual booking website, Thai market (PromptPay, LINE, SSO)*
*Researched: 2026-03-22*
