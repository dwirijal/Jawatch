# Jawatch — Architecture Documentation
> Last updated: 2026-06-19 | Branch: `feat/jawatch-vercel-ready`

> **Note:** For a complete, deep-dive into all aspects of the project including development workflow, PWA, SEO, styling, and more, see [END-TO-END.md](./END-TO-END.md).

## Overview

Jawatch adalah **platform streaming anime & baca manga gratis** berbasis Next.js 16 (App Router), sub Indo, yang mengonsumsi API eksternal `api.dwizzy.my.id` sebagai backend data. Dideploy di **Vercel** (free tier, region `sin1`), dioptimalkan untuk Azure-hosted PostgreSQL backend.

### Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.9 (App Router, ISR, SSR) |
| Language | TypeScript 5.8.3 |
| Styling | Tailwind CSS 4.3.1 (oklch design tokens) |
| Runtime | React 19.1.2, Bun ≥1.0.0 |
| Hosting | Vercel (sin1, standalone output) |
| Backend API | `https://api.dwizzy.my.id` (external) |
| PWA | manifest.webmanifest + sw.js |
| Testing | Vitest 4.1.8 + @testing-library/react |

---

## Project Structure

```
jawatch/
├── public/
│   ├── icons/           # PWA app icons (192x192, 512x512 PNG)
│   ├── screenshots/     # PWA screenshots
│   ├── robots.txt       # crawl directives
│   ├── sw.js            # Service Worker (PWA offline)
│   ├── manifest.webmanifest
│   ├── placeholder-cover.jpg
│   └── placeholder-cover.svg
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout (metadata, fonts, Nav, Footer, PWA)
│   │   ├── page.tsx          # Home — Hero + trending/latest/recent/random grids
│   │   ├── loading.tsx       # Global loading skeleton
│   │   ├── error.tsx         # Route-level error boundary (client)
│   │   ├── global-error.tsx  # Root error boundary (client)
│   │   ├── not-found.tsx     # Custom 404
│   │   ├── sitemap.ts        # Dynamic sitemap.xml generator
│   │   ├── manifest.ts       # Dynamic manifest.webmanifest generator
│   │   ├── globals.css       # Global styles (oklch tokens, Tailwind+utilities)
│   │   ├── browse/
│   │   │   └── page.tsx      # Browse (paginated, infinite scroll ready)
│   │   ├── search/
│   │   │   └── page.tsx      # Search (client-side, URL-based q param)
│   │   ├── stream/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          # Anime detail + episode list
│   │   │       └── [episode]/
│   │   │           └── page.tsx      # Video player + episode data
│   │   └── read/
│   │       └── [slug]/
│   │           ├── page.tsx          # Manga/comic detail + chapter list
│   │           └── [chapter]/
│   │               └── page.tsx      # Chapter reader (image pages)
│   ├── components/
│   │   ├── Nav.tsx             # Top navigation (logo, browse, manga, search)
│   │   ├── Footer.tsx          # Site footer
│   │   ├── HeroSection.tsx     # Homepage hero banner (random anime)
│   │   ├── AnimeCard.tsx       # Reusable media card (anime/manga aware)
│   │   ├── AnimeGrid.tsx       # Section grid with heading (trending/latest/etc)
│   │   ├── EpisodeList.tsx     # Episode/chapter list with media-type routing
│   │   ├── PosterImage.tsx     # Lazy-loaded poster/cover with fallback
│   │   ├── ServiceWorker.tsx   # Client-side SW registration script
│   │   └── atoms/
│   │       ├── Badge.tsx       # Genre/status/rating badges
│   │       ├── Button.tsx      # Themed button variants
│   │       ├── Glass.tsx       # Glassmorphism container
│   │       └── Skeleton.tsx    # Loading skeleton components
│   ├── lib/
│   │   └── api.ts              # API client (browse, detail, search, episodes)
│   └── middleware.ts           # Security headers (CSP, HSTS, X-Frame, etc.)
├── next.config.js              # Next.js config (standalone, images, headers)
├── vercel.json                 # Vercel deployment config (headers, regions, functions)
├── tailwind.config.js          # Tailwind theme (oklch tokens)
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies & scripts
├── .env.example                # Environment variable template
└── compose.yml                 # Docker Compose (local dev)
```

---

## Routing Map

| Path | Type | Description |
|------|------|-------------|
| `/` | SSR + ISR | Homepage — 4 anime grids (trending, latest, recent, random) + hero |
| `/browse` | SSR + ISR | Browse all media, paginated via `?cursor=...` |
| `/search?q=...` | CSR | Client-side search (must be CSR for `useSearchParams`) |
| `/stream/[slug]` | SSR + ISR | Anime detail + episode list |
| `/stream/[slug]/[episode]` | SSR + ISR | Episode player (iframe embed + download links) |
| `/read/[slug]` | SSR + ISR | Manga/comic detail + chapter list |
| `/read/[slug]/[chapter]` | SSR + ISR | Chapter reader (image pages) |
| `/sitemap.xml` | Dynamic | Auto-generated sitemap |
| `/manifest.webmanifest` | Dynamic | PWA manifest |

### Media-Type Routing Logic

```typescript
// src/lib/api.ts → contentUrl()
const READ_KINDS = new Set(["manga", "comic", "manhwa", "manhua", "novel"]);

export function isReadable(card): boolean {
  return READ_KINDS.has(card.entry_kind || "") || READ_KINDS.has(card.media_type || "");
}

export function contentUrl(card): string {
  return isReadable(card) ? `/read/${card.slug}` : `/stream/${card.slug}`;
}
```

Cards automatically route to `/stream/` or `/read/` based on media type.

---

## Data Flow

```
                 ┌──────────────────────┐
                 │   api.dwizzy.my.id   │  (Azure PostgreSQL backend)
                 └──────────┬───────────┘
                            │ HTTPS
                 ┌──────────▼───────────┐
                 │    src/lib/api.ts     │  5s timeout, mock fallback
                 │  NEXT_PUBLIC_API_URL  │
                 └──────────┬───────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                  ▼
    Server Components   Client Component    ISR Cache
    (SSR, direct fetch) (search)           (Vercel Edge)
```

### API Client (`src/lib/api.ts`)

`NEXT_PUBLIC_API_URL` adalah satu-satunya environment variable yang dibutuhkan.

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;  // https://api.dwizzy.my.id
```

| Function | Endpoint | Returns | Cache |
|----------|----------|---------|-------|
| `getHomeAnime()` | `/v1/anime/home` | `{ trending, latest, recent, random }` | ISR 2h |
| `getDetail(slug)` | `/v1/anime/{slug}/detail` | `AnimeDetail` | ISR 2h |
| `getEpisodes(slug)` | `/v1/anime/{slug}/episodes` | `Episode[]` | ISR 2h |
| `getChapter(slug, chapterId)` | `/v1/manga/{slug}/chapters/{id}` | `Episode` (chapter) | ISR 2h |
| `searchAnime(q)` | `/v1/anime/search?q=...` | `AnimeCard[]` | None (CSR) |
| `browsePage(cursor?)` | `/v1/anime/browse?cursor=...` | `BrowseResult` | ISR 2h |

All functions use a **5-second timeout** (`AbortController`) to prevent hanging on flaky upstream.

**Fallback**: If the API is unreachable, mock/static data is returned so the UI doesn't crash — pages render skeleton states, not error pages.

### Data Interfaces

```typescript
interface AnimeCard {
  item_key: string; media_type: string; title: string; slug: string;
  cover_url?: string; score?: number; status?: string; release_year?: number;
  genres?: string[]; entry_kind?: string; season_number?: number; updated_at: string;
}

interface AnimeDetail extends AnimeCard {
  backdrop_url?: string; overview?: string; normalized_title?: string;
  surface_type?: string; presentation_type?: string; origin_type?: string;
  enrichments?: Record<string, any>;
}

interface Episode {
  unit_key: string; item_key: string; unit_kind: string; unit_number: number;
  title: string | null; preferred_source?: string; thumbnail_url?: string;
  stream_links?: { source: string; url: string }[];
  download_links?: { provider?: string; quality?: string; url: string }[];
  pages?: string[];  // manga chapters
}

interface BrowseResult {
  items: AnimeCard[]; has_next: boolean; next_cursor?: string;
}
```

---

## Component Tree

```
RootLayout (layout.tsx)
├── <html> + metadata + viewport
├── <Nav />
│   ├── Logo → /
│   ├── Browse → /browse
│   ├── Manga → /browse?type=manga
│   └── Search input → /search?q=...
├── <main>
│   └── {children} (page content)
├── <Footer />
└── <ServiceWorker /> (client-only)
```

### Home Page Component Tree

```
HomePage (page.tsx)
├── <Suspense fallback={<HeroSkeleton />}>
│   └── <HeroSection />         ← random anime, fetches from API
├── <AnimeGrid title="Trending" fetch="trending" icon={FireIcon} />
├── <AnimeGrid title="Latest" fetch="latest" icon={ClockIcon} />
├── <AnimeGrid title="Recently Updated" fetch="recent" icon={BoltIcon} />
└── <AnimeGrid title="Recommended" fetch="random" icon={HeartIcon} />
```

Each `<AnimeGrid>` default-exports an `AnimeGridInner` component that:
1. Fetches data server-side
2. Maps items to `<AnimeCard>` components
3. Wraps everything in a `<Glass>` container

### Stream/Anime Detail Page

```
StreamDetail (stream/[slug]/page.tsx)
├── Backdrop image
├── Poster + metadata (score, year, genres, status)
├── Synopsis
└── <Suspense fallback={<Skeleton />}>
    └── <EpisodeList episodes={...} mediaType="anime" />
```

### Episode Player Page

```
EpisodePlayer (stream/[slug]/[episode]/page.tsx)
├── Back navigation
├── <iframe> video embed (auto-selects best source)
├── Episode metadata
└── Download links (quality/URL)
```

### Manga Reader

```
ChapterReader (read/[slug]/[chapter]/page.tsx)
├── Chapter navigation (prev/next)
├── Image pages (vertical scroll)
├── Keyboard navigation (← → arrows)
└── Page counter
```

---

## ISR (Incremental Static Regeneration)

Konfigurasi `revalidate` per halaman:

| Route | Revalidate | Rationale |
|-------|-----------|-----------|
| Home `/` | 7200s (2h) | High traffic, acceptable staleness |
| `/stream/[slug]` | 7200s (2h) | Detail pages don't change rapidly |
| `/stream/[slug]/[episode]` | 7200s (2h) | Embed URLs stable |
| `/read/[slug]` | 7200s (2h) | Manga detail stable |
| `/read/[slug]/[chapter]` | 7200s (2h) | Chapter pages stable once loaded |
| `/browse` | 7200s (2h) | Browse pages are cursor-based |
| `/search` | N/A | Client-rendered, no ISR |

This was specifically tuned for **Vercel free tier** — minimizing function invocations and edge reads.

---

## Security

### Middleware (`src/middleware.ts`)

Applied to all routes except `_next/*`, `favicon.ico`, `sw.js`, `icons/*`, `screenshots/*`:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.dwizzy.my.id; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### Additional Security

- All external links enforce `rel="noopener noreferrer"`
- `<iframe>` embeds only from allow-listed video sources
- No `dangerouslySetInnerHTML` without sanitization
- `NEXT_PUBLIC_API_URL` is the only env exposed to client (intentionally)
- `robots.txt` allows full crawl with sitemap pointer

### `robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://jawatch.vercel.app/sitemap.xml
```

---

## PWA

### Service Worker (`public/sw.js`)

Standard network-first cache strategy for pages, cache-first for static assets.

- Registered client-side via `<ServiceWorker />` component
- Caches: `/`, `/browse`, `/stream/*`, `/read/*`, static assets
- Cache-Control: `max-age=0, must-revalidate` for `sw.js`

### Manifest (`src/app/manifest.ts`)

Dynamic PWA manifest generation:
- `name`: "Jawatch — Nonton Anime & Baca Manga"
- `short_name`: "Jawatch"
- `theme_color`: `#0a0a0f` (dark theme)
- `background_color`: `#0a0a0f`
- `display`: `standalone`
- Icons: 192x192, 512x512
- Categories: `["entertainment", "video"]`

---

## SEO

### Metadata Strategy

**Root Layout** (`src/app/layout.tsx`):
- Title template: `%s | Jawatch`
- Default: "Jawatch — Nonton Anime & Baca Manga Gratis"
- OpenGraph (og:title, og:description, og:image, og:type)
- Twitter Card (summary_large_image)
- Canonical URL: `https://jawatch.vercel.app`
- Meta keywords (ID-focused)
- Robots: index, follow, max-image-preview:large
- Google Bot: index, follow, max-video-preview:-1, max-snippet:-1

**Per-Page Metadata**:
- `/stream/[slug]`: Dynamic title from anime title, description from synopsis
- `/read/[slug]`: Dynamic title from manga title
- `/stream/[slug]/[episode]`: `{anime_title} — Episode {number} | Jawatch`

### Sitemap (`src/app/sitemap.ts`)

Dynamic sitemap generation:
- Static pages: `/`, `/browse`, `/search`
- Fetches trending/recent anime from API
- Generates `/stream/[slug]` and `/read/[slug]` entries
- Auto-generates `/stream/[slug]/[episode]` entries for episode 1
- Priority: 1.0 (home), 0.9 (stream/read detail), 0.8 (episode/chapter)
- Changefreq: `daily` for detail, `weekly` for episode/chapter

### Structured Data

Currently **no JSON-LD structured data** (VideoObject, BreadcrumbList, etc.). This is a known gap for rich results.

---

## Design System

### Color Tokens (oklch)

Defined in `tailwind.config.js` and `globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `oklch(0.62 0.21 10.5)` | Red-orange accent |
| `--color-primary-hover` | `oklch(0.68 0.23 10.5)` | Hover state |
| `--color-primary-muted` | `oklch(0.28 0.06 10.5)` | Subtle accent bg |
| `--color-surface` | `oklch(0.12 0.02 260)` | Card BGs, glass panels |
| `--color-surface-hover` | `oklch(0.16 0.02 260)` | Hover state |
| `--color-base` | `oklch(0.06 0.02 260)` | Page background |
| `--color-border` | `oklch(0.22 0.02 260)` | Subtle borders |
| `--color-text` | `oklch(0.92 0.01 260)` | Primary text |
| `--color-text-muted` | `oklch(0.55 0.02 260)` | Secondary text |

### Reusable Design Tokens (globals.css)

```css
:root {
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
}
```

### Glassmorphism

Via `<Glass>` component: `backdrop-blur-xl bg-surface/60 border border-white/[0.06] shadow-lg rounded-xl`

### Atom Components

| Component | Variants | Usage |
|-----------|----------|-------|
| `Badge` | `genre`, `rating`, `status`, `episode` | Labels on cards |
| `Button` | `primary`, `secondary`, `ghost`, `icon` | CTA, navigation |
| `Skeleton` | `CardSkeleton`, `HeroSkeleton`, `generic` | Loading states |
| `Glass` | `default`, `hover` (scale on hover) | Container cards |

---

## Performance Optimizations

### Build
- `output: "standalone"` — optimized for Vercel serverless
- Images: `"Cache-Control": "public, max-age=86400, immutable"` via `next.config.js`
- `minimumCacheTTL: 31536000` for `/_next/static/*`

### Runtime
- `<PosterImage>`: lazy loading with native `loading="lazy"`, placeholder blur
- Route-level `<Suspense>` boundaries for progressive rendering
- Skeleton loading states for all async components
- Client search uses `useSearchParams` → no SSR for dynamic queries

### Caching Strategy Summary

| Resource | Cache Duration |
|----------|---------------|
| `sw.js` | `max-age=0, must-revalidate` |
| `/icons/*` | `max-age=31536000, immutable` (1 year) |
| `manifest.webmanifest` | `max-age=3600` (1 hour) |
| `/_next/static/*` | `max-age=31536000, immutable` |
| Placeholder images | `max-age=31536000, immutable` |
| ISR pages | `revalidate = 7200` (2 hours) |

---

## Deployment

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

- **Region**: `sin1` (Singapore) — closest to Indonesian users
- **Framework detection**: Auto-detected as Next.js
- **Functions**: `maxDuration: 30s` for all app routes

### Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Client + Server | Backend API base URL (`https://api.dwizzy.my.id`) |

### Scripts

| Command | Purpose |
|---------|---------|
| `bun dev` | Local dev server (port 3000, accessible on LAN) |
| `bun run build` | Production build |
| `bun start` | Production start |
| `bun run lint` | ESLint |
| `bun test` | Vitest (watch mode) |
| `bun run test:run` | Vitest (single run) |
| `bun run test:coverage` | Vitest + coverage report |

---

## Known Limitations & TODO

| Item | Status | Priority |
|------|--------|----------|
| No JSON-LD structured data | Missing | Medium |
| No infinite scroll on browse | CSR only | Low |
| No authentication | N/A (free site) | — |
| No favorites/bookmarks | Missing | Low |
| No dark/light toggle | Dark-only (by design) | — |
| `'unsafe-inline'` in CSP script-src | Required for Next.js hydration | Known tradeoff |
| No image optimization CDN | Free tier limits | Low |
| Service worker network-first | Could be stale-while-revalidate | Low |
| Only `sin1` region | Free tier limit (1 region) | — |
| Mock fallback in api.ts | Returns static data on API failure | Acceptable |

---

## Development Setup

### Prerequisites
- Bun ≥1.0.0
- Node.js 22+ (for some dev tooling)

### Quick Start

```bash
# 1. Clone & install
git clone <repo>
cd jawatch
bun install

# 2. Set up env
cp .env.example .env.local
# Edit: NEXT_PUBLIC_API_URL=https://api.dwizzy.my.id

# 3. Run dev server
bun dev  # → http://localhost:3000

# 4. Run tests
bun test
```

### Local Docker (optional)

```bash
docker compose up -d  # uses compose.yml
```