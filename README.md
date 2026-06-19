# Jawatch — Nonton Anime & Baca Manga Gratis

Platform streaming anime dan baca manga/manhwa gratis dengan subtitle Indonesia. Dibangun dengan Next.js 16, React 19, Tailwind CSS v4, dan di-deploy ke Vercel.

**Live:** https://jawatch.vercel.app

---

## Daftar Isi

- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Struktur Proyek](#struktur-proyek)
- [Tech Stack](#tech-stack)
- [Setup & Development](#setup--development)
- [Environment Variables](#environment-variables)
- [Routing & Halaman](#routing--halaman)
- [API Layer](#api-layer)
- [Design System](#design-system)
- [Komponen](#komponen)
- [SEO & Metadata](#seo--metadata)
- [PWA & Offline](#pwa--offline)
- [Keamanan](#keamanan)
- [Caching & Performance](#caching--performance)
- [Deployment (Vercel)](#deployment-vercel)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Fitur

| Fitur | Detail |
|-------|--------|
| 🎬 Streaming Anime | Detail anime + daftar episode + player embed |
| 📖 Baca Manga | Reader manga/manhwa/manhua dengan navigasi halaman |
| 🔍 Pencarian | Live search di navbar + halaman search dedicated |
| 📱 PWA | Installable, offline fallback, service worker |
| 🎨 Design System | oklch tokens, glassmorphism, responsive grid |
| ⚡ ISR Caching | Incremental Static Regeneration di edge (Vercel) |
| 🔒 Security Headers | CSP, X-Frame-Options, Referrer-Policy, dll |
| 🗺️ SEO | Sitemap XML, robots.txt, Open Graph, Twitter Cards |
| ♿ Accessibility | Skip link, aria-labels, semantic HTML |
| 🖼️ Image Optimization | Next.js Image, AVIF/WebP, lazy loading |

---

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   PWA    │  │   SW     │  │  React 19 RSC    │  │
│  │ Manifest │  │ Cache    │  │  + Client        │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────────────┐
│              Vercel Edge (sin1)                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Next.js 16 (standalone)                       │  │
│  │  ├─ ISR (revalidate: 2h-12h per route)        │  │
│  │  ├─ Middleware (security headers)              │  │
│  │  ├─ Server Components (default)               │  │
│  │  └─ Client Components ("use client")          │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────────────┐
│         api.dwizzy.my.id (Upstream API)              │
│  ├─ /v1/browse     → katalog anime/manga            │
│  ├─ /v1/detail     → detail + episodes              │
│  ├─ /v1/episodes   → daftar episode per slug        │
│  ├─ /v1/episode    → stream links per unit_key      │
│  └─ /v1/search     → full-text search               │
└──────────────────────────────────────────────────────┘
```

**Data flow:**
1. User request → Vercel Edge
2. Server Component fetches dari `api.dwizzy.my.id` via `src/lib/api.ts`
3. Response di-cache dengan ISR (`revalidate` per halaman)
4. HTML di-stream ke browser
5. Client Components hydrate interaktivitas (search, infinite scroll)
6. Service Worker cache static assets untuk offline

---

## Struktur Proyek

```
jawatch/
├── public/
│   ├── icons/              # PWA icons (192px, 512px)
│   ├── screenshots/        # PWA screenshots (mobile, desktop)
│   ├── robots.txt          # SEO crawler rules
│   ├── sw.js               # Service Worker (cache strategy)
│   ├── placeholder-cover.jpg  # Fallback image
│   └── placeholder-cover.svg  # Fallback image (SVG)
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout (fonts, metadata, nav, footer)
│   │   ├── page.tsx        # Home (hero + grid sections)
│   │   ├── globals.css     # Design tokens + Tailwind v4
│   │   ├── manifest.ts     # PWA web manifest
│   │   ├── sitemap.ts      # Dynamic sitemap.xml
│   │   ├── not-found.tsx   # 404 page
│   │   ├── error.tsx       # Error boundary (per-route)
│   │   ├── global-error.tsx # Root error boundary
│   │   ├── loading.tsx     # Loading UI (Suspense fallback)
│   │   ├── browse/
│   │   │   └── page.tsx    # Browse/search dengan filter + infinite scroll
│   │   ├── stream/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx        # Anime detail + episode list
│   │   │   │   └── [episode]/
│   │   │   │       └── page.tsx    # Episode player (iframe embed)
│   │   └── read/
│   │       ├── [slug]/
│   │       │   └── page.tsx        # Manga detail + chapter list
│   │       └── [slug]/
│   │           └── [chapter]/
│   │               └── page.tsx    # Manga reader (page images)
│   │
│   ├── components/
│   │   ├── Nav.tsx           # Navbar + live search
│   │   ├── Footer.tsx        # Footer
│   │   ├── HeroSection.tsx   # Hero banner (featured anime)
│   │   ├── AnimeGrid.tsx     # Reusable grid section
│   │   ├── AnimeCard.tsx     # Card component (cover, score, genre)
│   │   ├── EpisodeList.tsx   # Episode/chapter list
│   │   ├── PosterImage.tsx   # Image with fallback
│   │   ├── ServiceWorker.tsx # SW registration
│   │   └── atoms/            # Design system primitives
│   │       ├── Badge.tsx     # Status badges (ongoing, completed, dll)
│   │       ├── Button.tsx    # Button + LinkButton
│   │       └── Skeleton.tsx  # Loading skeletons
│   │
│   ├── lib/
│   │   └── api.ts            # API client (fetch wrapper + types)
│   │
│   └── middleware.ts          # Security headers middleware
│
├── .env.example              # Environment template
├── next.config.js            # Next.js config (standalone, images)
├── vercel.json               # Vercel config (headers, regions, functions)
├── tailwind.config.js        # Tailwind v4 (informational, tokens in CSS)
├── tsconfig.json             # TypeScript config
├── postcss.config.mjs        # PostCSS (Tailwind v4 plugin)
├── package.json              # Dependencies + scripts
└── compose.yml               # Docker Compose (local dev)
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| UI Library | React | 19.1.2 |
| Styling | Tailwind CSS | 4.3.1 |
| Fonts | Geist Sans + Geist Mono | via `next/font` |
| Deployment | Vercel | sin1 region |
| API | api.dwizzy.my.id | REST v1 |
| Package Manager | npm | (engines: bun >=1.0) |
| Testing | Vitest + Testing Library | dev |

**Dependencies minimal** — hanya 3 production deps: `next`, `react`, `react-dom`, `tailwindcss`.

---

## Setup & Development

### Prerequisites

- Node.js 18+ atau Bun 1.0+
- npm 9+

### Install & Run

```bash
# Clone
git clone https://github.com/your-org/jawatch.git
cd jawatch

# Install dependencies
npm install

# Copy environment
cp .env.example .env.local

# Development server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

### Scripts

| Script | Command | Deskripsi |
|--------|---------|-----------|
| `npm run dev` | `next dev -H 0.0.0.0` | Dev server (bind all interfaces) |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start -H 0.0.0.0` | Production server |
| `npm run lint` | `next lint` | ESLint |
| `npm test` | `vitest` | Test watcher |
| `npm run test:run` | `vitest run` | Single test run |
| `npm run test:coverage` | `vitest run --coverage` | Coverage report |

### Docker

```bash
docker compose up -d    # Start dev environment
docker compose down     # Stop
```

---

## Environment Variables

| Variable | Required | Default | Deskripsi |
|----------|----------|---------|-----------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | — | Base URL API upstream (browser + server) |

**Contoh `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.dwizzy.my.id/v1
```

> **Note:** Prefix `NEXT_PUBLIC_` berarti variabel ini terekspos ke client bundle. Ini aman karena API ini public (no auth required). Untuk Vercel, set via `vercel env add NEXT_PUBLIC_API_URL`.

---

## Routing & Halaman

### Static Routes

| Route | File | Revalidate | Deskripsi |
|-------|------|------------|-----------|
| `/` | `app/page.tsx` | 2h (`7200s`) | Home: hero + grid (trending, popular, latest, ongoing) |
| `/browse` | `app/browse/page.tsx` | — | Browse semua konten (anime/manga) dengan filter + infinite scroll |
| `/browse?type=manga` | same | — | Tab manga/manhwa |
| `/browse?sort=latest` | same | — | Filter by latest update |
| `/browse?genre=action` | same | — | Filter by genre |

### Dynamic Routes — Anime

| Route | File | Revalidate | Deskripsi |
|-------|------|------------|-----------|
| `/stream/[slug]` | `app/stream/[slug]/page.tsx` | 6h (`21600s`) | Detail anime + daftar episode |
| `/stream/[slug]/[episode]` | `app/stream/[slug]/[episode]/page.tsx` | — | Episode player (iframe embed dari upstream) |

### Dynamic Routes — Manga

| Route | File | Revalidate | Deskripsi |
|-------|------|------------|-----------|
| `/read/[slug]` | `app/read/[slug]/page.tsx` | 6h (`21600s`) | Detail manga + daftar chapter |
| `/read/[slug]/[chapter]` | `app/read/[slug]/[chapter]/page.tsx` | 2h (`7200s`) | Manga reader (navigasi halaman per gambar) |

### Utility Routes

| Route | File | Deskripsi |
|-------|------|-----------|
| `/sitemap.xml` | `app/sitemap.ts` | Dynamic sitemap (ISR 12h) |
| `/manifest.webmanifest` | `app/manifest.ts` | PWA manifest |

### Routing Logic

```
contentUrl(card) →
  if media_type ∈ {manga, comic, manhwa, manhua, novel} → /read/[slug]
  else → /stream/[slug]
```

Fungsi `isReadable()` di `api.ts` menentukan apakah konten bersifat "baca" (manga) atau "tonton" (anime) berdasarkan `media_type` dan `entry_kind`.

---

## API Layer

File: `src/lib/api.ts`

### Types

```typescript
interface AnimeCard {
  item_key: string;
  media_type: string;       // "anime" | "manga" | "manhwa" | ...
  title: string;
  slug: string;
  cover_url?: string;
  score?: number;           // Rating 0-10
  status?: string;          // "Ongoing" | "Completed" | ...
  release_year?: number;
  genres?: string[];
  entry_kind?: string;      // "manga" | "comic" | "manhwa" | ...
  season_number?: number;
  updated_at: string;
}

interface AnimeDetail extends AnimeCard {
  backdrop_url?: string;
  overview?: string;
  normalized_title?: string;
  surface_type?: string;
  presentation_type?: string;
  origin_type?: string;
  enrichments?: Record<string, any>;
}

interface Episode {
  unit_key: string;
  item_key: string;
  unit_kind: string;
  unit_number: number;
  title: string | null;
  preferred_source?: string;
  thumbnail_url?: string;
  stream_links?: { source: string; url: string }[];
  download_links?: { provider?: string; quality?: string; url: string }[];
  pages?: string[];         // Manga page images
}

interface BrowseResult {
  items: AnimeCard[];
  has_next: boolean;
  next_cursor?: string;
}
```

### Functions

| Function | Params | Returns | Deskripsi |
|----------|--------|---------|-----------|
| `browse()` | `{ sort?, genre?, media_type?, limit?, cursor? }` | `BrowseResult` | Katalog dengan cursor pagination |
| `getDetail(slug)` | `slug: string` | `AnimeDetail` | Detail anime/manga + metadata |
| `getEpisodes(slug)` | `slug: string` | `Episode[]` | Daftar episode/chapter |
| `getEpisode(slug, unitKey)` | `slug, unitKey: string` | `Episode` | Single episode + stream links |
| `searchAnime(query)` | `query: string` | `AnimeCard[]` | Full-text search |
| `coverUrl(card)` | `AnimeCard` | `string` | URL cover image (dengan fallback) |
| `contentUrl(card)` | `AnimeCard` | `string` | URL halaman konten (`/stream/` atau `/read/`) |
| `isReadable(card)` | `{ media_type?, entry_kind? }` | `boolean` | Apakah konten manga-type |

### Error Handling

- **Timeout:** 5 detik (`AbortController`) — mencegah hanging fetch
- **Fallback:** Mock data jika API down (development only)
- **Error propagation:** Lempar error ke Next.js error boundary

---

## Design System

File: `src/app/globals.css`

### Color Tokens (oklch)

```
Brand:
  --ja-purple        oklch(55% 0.25 285)    # Primary brand color
  --ja-purple-hover  oklch(62% 0.22 285)    # Hover state
  --ja-purple-glow   oklch(45% 0.3 285)     # Glow/shadow effect
  --ja-gold          oklch(82% 0.16 80)     # Rating stars, accents

Surfaces (dark theme):
  --ja-bg            oklch(11% 0.03 280)    # Page background
  --ja-surface       oklch(16% 0.02 280)    # Card background
  --ja-surface-hover oklch(20% 0.03 280)    # Hover state
  --ja-surface-raised oklch(22% 0.02 280)   # Elevated elements

Text:
  --ja-text          oklch(92% 0.01 280)    # Primary text
  --ja-text-secondary oklch(68% 0.02 280)   # Secondary text
  --ja-text-muted    oklch(45% 0.02 280)    # Muted/disabled

Status:
  --ja-green   oklch(65% 0.2 145)    # Success, ongoing
  --ja-blue    oklch(62% 0.19 250)   # Info
  --ja-yellow  oklch(78% 0.16 85)    # Warning
  --ja-red     oklch(60% 0.22 25)    # Error
```

### Spacing & Layout

```
--ja-section-gap    clamp(1.5rem, 1rem + 3vw, 3rem)   # Section spacing
--ja-content-max    80rem (1280px)                     # Max content width
```

### Border Radius

```
--ja-r-sm    0.5rem     # Small elements (badges)
--ja-r-md    0.75rem    # Cards, inputs
--ja-r-lg    1rem       # Large cards
--ja-r-xl    1.25rem    # Hero sections
--ja-r-full  9999px     # Pills, avatars
```

### Motion

```
--ja-fast       120ms    # Micro-interactions
--ja-normal     220ms    # Standard transitions
--ja-slow       350ms    # Complex animations
--ja-ease-out   cubic-bezier(0.16, 1, 0.3, 1)
--ja-ease-spring cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Utility Classes

```css
.glass          /* Glassmorphism: blur + semi-transparent bg */
.btn-primary    /* Purple CTA button */
.btn-ghost      /* Transparent button with hover */
.badge-*        /* Status badges (ongoing, completed, dll) */
```

### Atom Components

**Badge** (`atoms/Badge.tsx`):
- `<Badge tone="success|warning|info|neutral">` — status indicator
- `statusBadge(status)` — helper untuk map status string → tone

**Button** (`atoms/Button.tsx`):
- `<Button onClick={...}>` — primary/ghost button
- `<LinkButton href="...">` — styled link as button

**Skeleton** (`atoms/Skeleton.tsx`):
- `<CardSkeleton />` — placeholder untuk AnimeCard
- `<HeroSkeleton />` — placeholder untuk HeroSection

---

## Komponen

### Nav (`components/Nav.tsx`)

Navbar sticky dengan:
- Logo "JAWATCH" (JA purple + WATCH white)
- Navigation links: Home, Anime, Manga, Latest
- **Live search** — typeahead dropdown (min 2 chars, max 6 results)
- **Mobile menu** — hamburger toggle
- Search submit → `/browse?q=...`

### HeroSection (`components/HeroSection.tsx`)

Hero banner di homepage:
- Fetch 5 anime populer, tampilkan yang pertama
- Background image dengan gradient overlay
- Title, overview (truncated), genre badges
- CTA button "Tonton Sekarang"
- Error state dengan retry button
- Loading state dengan `HeroSkeleton`

### AnimeGrid (`components/AnimeGrid.tsx`)

Reusable grid section:
- Props: `title`, `icon`, `sort`, `genre`, `limit`
- Responsive grid: 2 cols mobile → 6 cols desktop
- Loading skeleton (6 cards)
- Error state "Tidak ada anime ditemukan"

### AnimeCard (`components/AnimeCard.tsx`)

Card untuk setiap anime/manga:
- Cover image (aspect 3:4) dengan lazy loading
- Score badge (★ rating, gold)
- Status badge (top-right)
- Genre badges (bottom, max 3 + overflow)
- Title (truncated 2 lines)
- Hover: scale 1.03, shadow glow, image zoom
- Link ke `/stream/[slug]` atau `/read/[slug]`

### EpisodeList (`components/EpisodeList.tsx`)

Daftar episode/chapter:
- Auto-detect anime vs manga dari `mediaType`
- Label: "Episode" atau "Chapter"
- Sort by `unit_number` ascending
- Each item: icon, number, title, chevron
- Link ke episode player / chapter reader

### PosterImage (`components/PosterImage.tsx`)

Image component dengan fallback:
- Next.js `<Image>` dengan optimasi
- Fallback ke `/placeholder-cover.jpg` on error
- Support non-HTTP URLs (fallback ke `<img>`)
- Responsive sizes: 50vw mobile → 20vw desktop

### ServiceWorker (`components/ServiceWorker.tsx`)

Client component untuk register SW:
- Register `/sw.js` on mount
- Console log success/failure

---

## SEO & Metadata

### Root Metadata (`layout.tsx`)

```typescript
{
  title: {
    default: "Jawatch — Nonton Anime & Baca Manga Gratis",
    template: "%s | Jawatch"
  },
  description: "Nonton anime subtitle Indonesia & baca manga/manhwa gratis...",
  keywords: ["anime", "manga", "manhwa", "streaming anime", ...],
  robots: { index: true, follow: true, googleBot: {...} },
  alternates: { canonical: "https://jawatch.vercel.app" },
  openGraph: { type: "website", locale: "id_ID", ... },
  twitter: { card: "summary_large_image", ... },
  manifest: "/manifest.webmanifest"
}
```

### Sitemap (`sitemap.ts`)

- **ISR:** 12 jam (`revalidate: 43200`)
- **Static routes:** `/`, `/browse`, `/browse?type=manga`
- **Dynamic routes:** 200 item terpopuler dari API
- **Priority:** Home=1.0, Browse=0.9, Manga=0.8, Detail=0.7
- **Change frequency:** daily (static), weekly (dynamic)

### Robots (`robots.txt`)

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Sitemap: https://jawatch.vercel.app/sitemap.xml
```

---

## PWA & Offline

### Manifest (`manifest.ts`)

```json
{
  "name": "Jawatch — Stream Anime Gratis",
  "short_name": "Jawatch",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#8b5cf6",
  "orientation": "portrait-primary",
  "icons": [192px, 512px] (maskable),
  "screenshots": [mobile 750x1334, desktop 1920x1080]
}
```

### Service Worker (`sw.js`)

**Cache strategy:**

| Request Type | Strategy | Deskripsi |
|-------------|----------|-----------|
| Navigation | Network-first | Fetch → cache → offline fallback |
| Static assets | Stale-while-revalidate | Cache → fetch → update cache |
| Cross-origin | Network only | API calls, external resources |

**Lifecycle:**
- **Install:** Pre-cache `/`, `/manifest.json`, icons
- **Activate:** Clean old caches (version: `jawatch-v1`)
- **Fetch:** Route-specific strategy

### Installability

PWA install prompt muncul ketika:
- Served over HTTPS (Vercel auto)
- Manifest valid
- Service worker registered
- Icons present (192px + 512px)

---

## Keamanan

### Middleware (`middleware.ts`)

Security headers di-set untuk semua route (kecuali `_next`, `favicon.ico`, `sw.js`, `icons`, `screenshots`):

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused APIs |
| `Content-Security-Policy` | (lihat bawah) | XSS prevention |

**CSP:**
```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
img-src 'self' data: https: blob:
connect-src 'self' https://api.dwizzy.my.id
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
upgrade-insecure-requests
```

### External Links

Semua link ke domain eksternal menggunakan `target="_blank" rel="noopener noreferrer"` untuk mencegah:
- Tab nabbing (reverse tabnabbing)
- Window opener access

### Next.js Config

```javascript
{
  poweredByHeader: false,  // Hide X-Powered-By
  compress: true,          // Gzip responses
}
```

---

## Caching & Performance

### ISR (Incremental Static Regeneration)

| Route | Revalidate | Deskripsi |
|-------|-----------|-----------|
| Home (`/`) | 2h (7200s) | Hero + grids |
| Detail (`/stream/[slug]`) | 6h (21600s) | Anime detail + episodes |
| Manga detail (`/read/[slug]`) | 6h (21600s) | Manga detail + chapters |
| Chapter reader | 2h (7200s) | Manga pages |
| Sitemap | 12h (43200s) | XML sitemap |

### Image Optimization

```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 1080],    // Mobile-first
  imageSizes: [64, 96, 128, 192, 256],
  minimumCacheTTL: 86400,           // 24h CDN cache
  remotePatterns: [
    'api.dwizzy.my.id',
    'image.tmdb.org',
    'cdn.myanimelist.net',
  ]
}
```

### Vercel Headers (Cache-Control)

| Path | Cache | Deskripsi |
|------|-------|-----------|
| `/sw.js` | `no-cache, must-revalidate` | Always check for updates |
| `/icons/*` | `1 year, immutable` | PWA icons |
| `/manifest.webmanifest` | `1 hour` | PWA manifest |
| `/placeholder-cover.*` | `1 year, immutable` | Fallback images |
| `/_next/static/*` | `1 year, immutable` | Next.js static assets |

### Function Limits

```json
{
  "functions": {
    "src/app/**/*.tsx": { "maxDuration": 30 }
  }
}
```

30 detik timeout per function — cukup untuk API fetch + render.

---

## Deployment (Vercel)

### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production
vercel --prod
```

### Environment Setup

```bash
# Add env var
vercel env add NEXT_PUBLIC_API_URL production
# Enter value: https://api.dwizzy.my.id/v1

# Pull to local
vercel env pull .env.local
```

### Vercel Config (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

**Region:** `sin1` (Singapore) — closest to Indonesian users.

### Build Output

Next.js `output: 'standalone'` — optimized for Vercel's serverless environment. Hanya include necessary files, mengurangi cold start.

### Free Tier Optimization

- ISR mengurangi function invocations
- Image CDN caching (24h TTL)
- Static assets immutable cache (1 year)
- Single region (no multi-region costs)
- 30s function timeout (within free limits)
- `NEXT_PUBLIC_API_URL` single env var (no internal routing)

---

## Testing

### Setup

```bash
npm test          # Watch mode
npm run test:run  # Single run
```

### Coverage

```bash
npm run test:coverage
```

### Test Structure

Tests menggunakan Vitest + React Testing Library:

```
src/
  __tests__/
    components/
    lib/
    app/
```

---

## Troubleshooting

### API Down (502/503)

**Symptom:** Halaman blank atau error "Tidak dapat memuat konten"

**Cause:** `api.dwizzy.my.id` sedang down atau timeout

**Fix:**
1. Cek status API: `curl https://api.dwizzy.my.id/v1/browse`
2. Tunggu recovery — ISR cache masih serve stale data sampai revalidate
3. Untuk dev: mock data fallback aktif jika env var tidak di-set

### Build Error: Missing env var

```
Missing NEXT_PUBLIC_API_URL env var.
Run `vercel env pull .env.local` to sync from Vercel.
```

**Fix:**
```bash
# Local
echo "NEXT_PUBLIC_API_URL=https://api.dwizzy.my.id/v1" > .env.local

# Vercel
vercel env add NEXT_PUBLIC_API_URL production
```

### Image Not Loading

**Symptom:** Cover anime blank atau menampilkan placeholder

**Cause:** Image URL tidak match `remotePatterns` di `next.config.js`

**Fix:** Tambahkan hostname ke `remotePatterns`:
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'new-image-host.com' },
  ]
}
```

### PWA Not Installable

**Checklist:**
- [ ] Served over HTTPS
- [ ] Manifest served at `/manifest.webmanifest`
- [ ] Service worker registered (`/sw.js`)
- [ ] Icons present (192px + 512px)
- [ ] `start_url` in manifest matches served path

### Service Worker Not Updating

**Fix:** Hard refresh browser atau:
```javascript
// DevTools console
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.update()))
```

### Infinite Re-render Loop

**Symptom:** Browse page freeze atau memory leak

**Cause:** `cursor` state di `useEffect` dependency array

**Fix:** Gunakan `useRef` untuk cursor (sudah di-implement):
```typescript
const cursorRef = useRef<string | undefined>(undefined);
// NOT in useEffect deps
```

---

## Lisensi

Private project. All rights reserved.

---

## Kontributor

- **dwizzy** — Development & Architecture
- **api.dwizzy.my.id** — Upstream API provider

---

<p align="center">
  <strong>JAWATCH</strong> — Streaming Anime Gratis Sub Indo<br>
  Built with Next.js 16 + React 19 + Tailwind CSS v4
</p>
