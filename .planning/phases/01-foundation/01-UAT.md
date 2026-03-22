---
status: resolved
phase: 01-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md
started: 2026-03-22T00:00:00Z
updated: 2026-03-22T22:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Start fresh with `npm run dev`. Server boots without errors. Visiting http://localhost:3000 redirects to /th/ and renders a page without crashing.
result: pass

### 2. Locale Routing
expected: Visiting http://localhost:3000 redirects to /th/. Visiting /en/ shows the English version of the page. Both /th/ and /en/ render without 404 or error.
result: pass

### 3. Locale Switcher
expected: In the header, there are TH and EN buttons. Clicking EN switches the page to /en/ (URL changes, page content switches to English). Clicking TH switches back to /th/. No full page reload flash — just a navigation.
result: pass

### 4. Header on All Pages
expected: A fixed glassmorphic header is visible at the top of every page (/, /portfolio, /services, /about). It shows a logo on the left, nav links in the center (desktop), and a "Book" CTA button. The header stays fixed when you scroll down.
result: pass

### 5. Mobile Drawer
expected: On a mobile-width viewport (or Chrome DevTools mobile simulation), the header shows a hamburger menu icon instead of nav links. Tapping it opens a bottom sheet drawer with nav links inside. Tapping a link or tapping outside closes the drawer.
result: pass

### 6. Footer
expected: At the bottom of every page there is a footer with a warm beige background (#f5ede6). It shows a Line icon, a Phone icon, and copyright text. No harsh top border line.
result: pass

### 7. Sticky Mandate Bar
expected: On mobile viewport, a floating pill button is fixed near the bottom of the screen with a brown/accent background (#755944) and a booking label (Thai: "จองคิวออนไลน์", English: "Book Online"). On desktop (wide viewport), this pill is NOT visible.
result: pass

### 8. Portfolio Gallery Page
expected: Visiting /th/portfolio (or /en/portfolio) shows a page with a heading and a grid of images — 2 columns on mobile, 3 columns on wider screens. Images are loaded (placeholder images are fine). No errors or empty white page.
result: pass

### 9. Lightbox
expected: Clicking any image in the portfolio gallery opens a fullscreen lightbox overlay (dark/black background) showing the image. A close button (X) is in the top-right corner. Clicking it or pressing Escape closes the lightbox.
result: issue
reported: "Doesn't look fullscreen, and no close button"
severity: major

### 10. Services Page
expected: Visiting /th/services (or /en/services) shows a services page with service cards. If DB is connected and seeded, shows 3 services (Classic, Hybrid, Volume) with price (฿800, ฿1,100, ฿1,400) and duration. If DB is not configured, shows an error state card (not a crash).
result: pass

### 11. About Page
expected: Visiting /th/about (or /en/about) shows an about page with an owner photo area, bio text, a contact section (Line ID + phone), business hours, and a "Book" CTA button. No broken layout or missing sections.
result: pass

### 12. Bilingual Content
expected: Switch between /th/ and /en/ on any page (portfolio, services, about). The page heading and labels switch language. Thai version shows Thai text; English version shows English text. No untranslated keys (like `portfolio.title` showing as a raw key).
result: pass

## Summary

total: 12
passed: 11
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Clicking a gallery image opens a fullscreen dark overlay with the image and a close button (X) in the top-right corner"
  status: resolved
  reason: "User reported: Doesn't look fullscreen, and no close button"
  severity: major
  test: 9
  root_cause: "Two bugs in src/components/ui/dialog.tsx: (1) DialogContent base classes include hard-coded translate-x[-50%]/translate-y[-50%] centering transforms that survive tailwind-merge overrides, preventing inset-0 from making the dialog fullscreen. (2) DialogContent always injects its own DialogPrimitive.Close button after {children}, occluding the consumer's custom close button in GalleryLightbox.tsx. GalleryLightbox.tsx itself is correctly authored."
  artifacts:
    - path: "src/components/ui/dialog.tsx"
      issue: "Line 39 — base classes include left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]; these are not cancelled by consumer's inset-0"
    - path: "src/components/ui/dialog.tsx"
      issue: "Lines 45-51 — built-in DialogPrimitive.Close is always rendered after {children}, occluding and replacing any consumer-provided DialogClose"
  missing:
    - "Remove translate-x-[-50%], translate-y-[-50%], left-[50%], top-[50%] from DialogContent base classes in dialog.tsx"
    - "Remove the auto-injected DialogPrimitive.Close block (lines 45-51) from DialogContent in dialog.tsx"
    - "Callers needing a centered modal add centering classes themselves; callers needing a close button add <DialogClose> explicitly (GalleryLightbox already does this)"
