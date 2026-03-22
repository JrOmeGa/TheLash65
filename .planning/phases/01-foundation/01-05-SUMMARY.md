---
plan: 01-05
phase: 01-foundation
status: complete
completed: 2026-03-22
gap_closure: true
---

## Summary

Fixed the portfolio lightbox to render fullscreen with a visible close button, closing UAT gap from test 9.

## What Was Built

- Removed hard-coded centering transforms (`left-[50%]`, `top-[50%]`, `translate-x-[-50%]`, `translate-y-[-50%]`) from `DialogContent` base classes so consumers can override positioning via `className`
- Removed the auto-injected `DialogPrimitive.Close` element from `DialogContent` so `GalleryLightbox`'s custom white close button renders without a competing button on top
- `GalleryLightbox.tsx` required no changes — its existing `inset-0 w-screen h-screen` classes now take effect correctly

## Key Files

### Modified
- `src/components/ui/dialog.tsx` — `DialogContent` stripped of centering transforms and auto-injected close button; now a neutral positioned container

## Decisions

- Kept all other `DialogContent` base classes intact (animation, shadow, padding) — only removed the classes that conflicted with fullscreen override
- No changes to `GalleryLightbox.tsx` — the fix was entirely in the shared primitive

## Verification

- `npx next build` passes with no errors
- Human verified: lightbox renders fullscreen with visible white X close button on desktop and mobile
- UAT test 9: **passed**

## Self-Check: PASSED
