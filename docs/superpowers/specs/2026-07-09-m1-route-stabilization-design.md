# M1 — Route Stabilization → all 200

## Goal
No 5xx on any jawatch route. Valid routes return HTTP 200; when upstream content is
missing/down, render a friendly empty state instead of 500/404.

## Why (root cause)
- `fetchUpstreamJson` throws MediaApiError/MediaApiTimeoutError on upstream-down,
  missing JAWATCH_MEDIA_API_URL, or bad JSON.
- Many getters are unwrapped (getMediaBySlug, getEpisodes, getChapters,
  getEpisodeSources, getMediaRelated, searchMedia, getHomeRails) → throw → 500.
- No error.tsx/global-error.tsx → any unhandled throw = 5xx page.
- notFound() on content-miss yields 404 on valid routes.

## Approach (lean defensive layer + error boundaries)
- M1.1 (CTO): app/error.tsx + app/global-error.tsx → EmptyState; residual throw = 200.
- M1.2 (BE): safeMedia facade in lib/api.ts — `safe()` swallows ONLY MediaApi*
  errors → SafeResult. Raw getters untouched.
- M1.3 (FE): content-miss notFound() → EmptyState (200). Keep notFound() for
  structurally-invalid URLs (discover/[type] bad type).

## Out of scope (later milestones)
Analytics, monitoring, ad slots, Better Auth+Supabase, Vercel Blob, WCAG/Lighthouse.

## Definition of Done
bun build green; blocking upstream yields 200s on /, /discover, /media, chapter/episode.
