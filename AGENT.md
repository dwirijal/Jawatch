# AI Agent Guidelines — Jawatch

## Purpose

- **Description**: Standalone cinematic media streaming and reading frontend.
- **Use Case**: Consumes a server-side media source to render anime, comic, and donghua content.
- **Core Logic**: Next.js 15 App Router, React 19, server-side data fetching with ISR, responsive mobile-first layout.

## Architecture

```text
media source → jawatch server routes/RSC → user browser
```

## Content Types

- `anime` — watch content
- `donghua` — watch content
- `comic` — read content

Unsupported private-only types should render empty states instead of reaching a private backend.

## Routes

- `/` — homepage
- `/discover` — catalog browse
- `/latest` — latest releases
- `/search?q=` — search results
- `/media/[slug]` — media detail
- `/media/[slug]/episodes/[episodeSlug]` — video player
- `/media/[slug]/chapters/[chapterSlug]` — reader

## API Client

- Server facade: `src/lib/api.ts`
- Client helper: `src/lib/client-media.ts`
- Server-only base URL: `JAWATCH_MEDIA_API_URL`
- Server-only timeout: `JAWATCH_MEDIA_API_TIMEOUT_MS`

## Local Commands

- Dev: `bun dev`
- Build: `bun build`
- Start: `bun start`
- Test: `bun run test:run`

## Rules

- Stay inside this repo.
- Do not add private backend, auth, database, or sibling-repo coupling.
- Do not expose upstream/provider names in UI, client helpers, docs, or browser-visible errors.
- No hardcoded secrets.
- Keep async route failures visible or mapped to explicit empty states.
