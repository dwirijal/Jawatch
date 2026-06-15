# AI Agent Guidelines — Jawatch

## Purpose
- **Description**: Cinematic media streaming and reading frontend for dwizzyOS.
- **Use Case**: Consumes sloane API to render anime, manga, movie, donghua, comic, and novel content in a Netflix-style UI.
- **Core Logic**: Next.js 15 App Router, React 19, server-side data fetching with ISR (revalidate 300s), responsive mobile-first layout.

## Architecture
```
sloane API (localhost:8080) → jawatch (Next.js SSR + ISR) → user browser
```

## Content Types
6 content modules on the homepage:
- `anime` — Watch row (horizontal scroll, landscape cards)
- `manga` — Read grid (portrait cards, 2/3 aspect)
- `donghua` — Watch row (Chinese animation)
- `comic` — Read grid (Indonesian webcomics)
- `novel` — Read grid (light novels)
- `movie` — Watch row (feature films)

Routing logic:
- `anime`, `donghua`, `movie` → `/watch/{id}` (streaming UX)
- `manga`, `comic`, `novel` → `/read/{id}` (reading UX)

## Routes
- `/` — Homepage with hero banner + 6 content sections
- `/watch/{id}` — Watch/detail page for video content
- `/read/{id}` — Read/detail page for reading content
- `/search?q=` — Search results page

## API Client (`src/lib/api.ts`)
- `getContents(type?, limit?, offset?)` → PaginatedResponse<Content>
- `getContent(id)` → Content
- `getTrending(type?, limit?)` → TrendingResponse
- `getFullContent(id)` → FullContent (content + streams + downloads + pages)
- `getStreams(contentId)` → Stream[]
- `getDownloads(contentId)` → Download[]
- `getPages(contentId)` → Page[]
- `searchContents(query)` → SearchResult

API base: `NEXT_PUBLIC_API_URL` env var, defaults to `http://localhost:8080`

## Components
- `ContentCard` — Reusable card with image, hover overlay, fallback placeholder
- `SkeletonCard`, `SkeletonText`, `SkeletonImage` — Loading state components
- `ErrorBoundary` — Client-side error boundary with retry button

## Key Files
- `src/app/page.tsx` — Homepage (hero + 6 sections)
- `src/app/layout.tsx` — Root layout (header, footer, ErrorBoundary)
- `src/app/globals.css` — Global styles
- `src/app/watch/[id]/` — Watch detail page
- `src/app/read/[id]/` — Read detail page
- `src/app/search/` — Search page
- `src/lib/api.ts` — API client
- `src/components/ContentCard.tsx` — Content card component
- `src/components/Skeleton.tsx` — Skeleton components
- `src/components/ErrorBoundary.tsx` — Error boundary

## Design System
- **Target**: rungkaDS tokens (not yet integrated — current implementation uses Tailwind hardcoded values)
- **Current**: Tailwind CSS with custom animations (fade-in-up, slide-in-right)
- **Layout**: Mobile-first, 375px base, responsive breakpoints
- **Typography**: Inter font (Google Fonts), display/section heading classes
- **Colors**: Dark theme (black bg, gray-100 text, red-600 accent) — needs rungkaDS migration

## Rules
- Mobile-first: every component must work at 375px
- Every async route needs a Skeleton loading state
- Every empty list needs an actionable empty state
- Images: lazy loaded, fallback placeholder, no broken `<img>`
- rungkaDS tokens only — no hardcoded design values (migration pending)
- Content type routing: watch types → `/watch/`, read types → `/read/`

## Commit Style
- Conventional Commits: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore, perf, ci

## Local Commands
- Dev: `bun dev` or `npm run dev`
- Build: `bun build` or `npm run build`
- Start: `bun start` or `npm run start`
- Lint: `npm run lint`

## Security
- No hardcoded secrets
- API errors gracefully handled — fallback to empty state
- 5s timeout on API fetches
- CSP headers set by Next.js config
- Images allow all remote patterns (sloane scraper URLs)
