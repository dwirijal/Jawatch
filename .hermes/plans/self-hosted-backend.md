# Jawatch Self-Hosted Backend — Architecture Plan

## Goal
Replace Sanka dependency with self-hosted content backend. Seed data from Sanka, serve from own Go/Rust API on gebelin (2-core/4GB cap for jawatch).

## Current State
- **Frontend**: Next.js 16 (standalone) — `src/lib/api.ts` (1386 lines) proxies all content requests to `sankavollerei.web.id`
- **Providers**: anime (otakudesu), samehadaku, animasu, alqanime, donghua, komikstation, mangasusuku, kiryuu, komikindo, sakuranovel
- **Data types**: Media metadata, Episodes/Chapters, Sources/Pages, Genres, Studios
- **Infra**: DOS-pg (pgvector/pg17), DOS-pgb (pgbouncer), DOS-tpg (timescaledb) on `gebelin_backend` network
- **Auth**: better-auth + Valkey sessions (stays on Supabase for now or migrates to local PG)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Cloudflare Tunnel → jawatch.web.id                 │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  Next.js SSR  │──→│  jawatch-api (Go)         │   │
│  │  (frontend)   │   │  - REST /api/v1/*         │   │
│  │  port 3000    │   │  - gRPC internal (opt)    │   │
│  └──────────────┘   │  port 8080                 │   │
│                      └─────────┬────────────────┘   │
│                                │                     │
│                      ┌─────────▼────────────────┐   │
│                      │  DOS-pgb (pgbouncer)      │   │
│                      │  :6432 → DOS-pg :5432     │   │
│                      └──────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  seeder (Go CLI / cron)                       │   │
│  │  - Scrapes Sanka API endpoints                │   │
│  │  - Upserts into local PG                      │   │
│  │  - Runs on schedule (every 6h home, daily     │   │
│  │    detail, weekly full sync)                   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Phase 1: Database Schema (in DOS-pg, schema `jawatch`)

```sql
CREATE SCHEMA IF NOT EXISTS jawatch;

-- Core media table
CREATE TABLE jawatch.media (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,  -- canonical slug (m~base64)
  type        TEXT NOT NULL,         -- anime|manga|movie|donghua|comic|novel
  provider    TEXT NOT NULL,         -- source provider
  upstream_slug TEXT NOT NULL,       -- original slug on provider
  title       TEXT NOT NULL,
  alt_titles  TEXT[],
  synopsis    TEXT,
  status      TEXT,
  rating_avg  REAL DEFAULT 0,
  rating_count INT DEFAULT 0,
  cover_image TEXT,
  nsfw        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  synced_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type, provider, upstream_slug)
);

CREATE TABLE jawatch.genre (
  id   SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE jawatch.media_genre (
  media_id BIGINT REFERENCES jawatch.media(id) ON DELETE CASCADE,
  genre_id INT REFERENCES jawatch.genre(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, genre_id)
);

CREATE TABLE jawatch.studio (
  id   SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE jawatch.media_studio (
  media_id  BIGINT REFERENCES jawatch.media(id) ON DELETE CASCADE,
  studio_id INT REFERENCES jawatch.studio(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, studio_id)
);

CREATE TABLE jawatch.author (
  id   SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE jawatch.media_author (
  media_id  BIGINT REFERENCES jawatch.media(id) ON DELETE CASCADE,
  author_id INT REFERENCES jawatch.author(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, author_id)
);

-- Episodes (anime/donghua)
CREATE TABLE jawatch.episode (
  id          BIGSERIAL PRIMARY KEY,
  media_id    BIGINT NOT NULL REFERENCES jawatch.media(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  ep_number   REAL NOT NULL,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, slug)
);

-- Episode sources (streaming URLs)
CREATE TABLE jawatch.episode_source (
  id          BIGSERIAL PRIMARY KEY,
  episode_id  BIGINT NOT NULL REFERENCES jawatch.episode(id) ON DELETE CASCADE,
  server_id   TEXT,
  label       TEXT,
  quality     TEXT,
  url         TEXT NOT NULL,
  source_type TEXT DEFAULT 'stream'  -- stream|mirror|download
);

-- Chapters (comic/manga/novel)
CREATE TABLE jawatch.chapter (
  id          BIGSERIAL PRIMARY KEY,
  media_id    BIGINT NOT NULL REFERENCES jawatch.media(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  ch_number   REAL NOT NULL,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, slug)
);

-- Chapter pages (image URLs)
CREATE TABLE jawatch.chapter_page (
  id          BIGSERIAL PRIMARY KEY,
  chapter_id  BIGINT NOT NULL REFERENCES jawatch.chapter(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  url         TEXT NOT NULL,
  UNIQUE(chapter_id, page_number)
);

-- Suggestions/related
CREATE TABLE jawatch.media_suggestion (
  media_id     BIGINT REFERENCES jawatch.media(id) ON DELETE CASCADE,
  suggested_id BIGINT REFERENCES jawatch.media(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, suggested_id)
);

-- Home rails cache (pre-computed, refreshed by seeder)
CREATE TABLE jawatch.rail (
  id         SERIAL PRIMARY KEY,
  rail_key   TEXT NOT NULL UNIQUE,  -- 'anime_popular', 'comic_latest', etc.
  items      JSONB NOT NULL,        -- array of {slug, title, coverImage, type}
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_media_type ON jawatch.media(type);
CREATE INDEX idx_media_provider ON jawatch.media(provider);
CREATE INDEX idx_media_type_provider ON jawatch.media(type, provider);
CREATE INDEX idx_media_slug ON jawatch.media(slug);
CREATE INDEX idx_episode_media ON jawatch.episode(media_id);
CREATE INDEX idx_chapter_media ON jawatch.chapter(media_id);
CREATE INDEX idx_media_title_trgm ON jawatch.media USING gin (title gin_trgm_ops);
```

## Phase 2: Go API Server (`jawatch-api`)

**Why Go over Rust**: Faster dev cycle, excellent stdlib HTTP, pgx driver is battle-tested, goroutines handle concurrency naturally. Memory ~20-30MB idle. Single static binary.

### Endpoints (maps 1:1 to current Sanka paths):

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/home | Home rails (cached JSONB) |
| GET | /api/v1/media?type=&page=&limit= | Media list |
| GET | /api/v1/media/:slug | Media detail |
| GET | /api/v1/media/:slug/episodes | Episodes list |
| GET | /api/v1/media/:slug/episodes/:epSlug/sources | Streaming sources |
| GET | /api/v1/media/:slug/chapters | Chapters list |
| GET | /api/v1/media/:slug/chapters/:chSlug/pages | Chapter pages |
| GET | /api/v1/search?q=&type= | Search (pg_trgm) |
| GET | /api/v1/genres | Genre list |
| GET | /api/v1/genres/:slug | Media by genre |
| GET | /api/v1/studios | Studio list |
| GET | /api/v1/popular | Popular media |
| GET | /api/v1/trending | Trending |
| GET | /api/v1/latest | Latest updates |
| GET | /api/v1/random | Random media |

### Stack:
- `net/http` + `chi` router (lightweight)
- `jackc/pgx/v5` (direct PG, no ORM)
- Built-in connection pool (pgx pool or via DOS-pgb)
- Response caching: in-memory LRU (ristretto) + stale-while-revalidate

### Resource limits (2c/4GB total budget):
- Go API: 256MB RAM, 0.5 CPU
- Next.js: 2GB RAM, 1.5 CPU
- Valkey: 512MB (auth sessions)
- Remaining for OS/seeder

## Phase 3: Seeder (Go CLI)

`jawatch-seed` — single binary, run via cron or systemd timer.

### Modes:
1. `home` — Fetch all home/list endpoints, upsert media metadata + rails cache. Every 6h.
2. `detail` — Iterate media table, fetch detail + episodes/chapters for stale entries. Daily.
3. `full` — Complete re-sync. Weekly.
4. `provider <name>` — Seed specific provider only.

### Flow:
```
for each provider:
  fetch home/popular/latest → parse → upsert media rows
  for each new/stale media:
    fetch detail → upsert synopsis, genres, studios
    fetch episodes/chapters → upsert
    fetch sources/pages (lazy, on-demand or batch)
```

## Phase 4: Wire Next.js Frontend

Replace `fetchUpstreamJson()` in `src/lib/api.ts`:
- Point to `http://jawatch-api:8080/api/v1/` instead of Sanka
- Simplify response mapping (Go API returns jawatch schema directly)
- Keep Sanka as fallback for uncached/new content
- Remove provider-specific mapping functions

## Migration Path (incremental, no downtime):

1. **Create schema** in DOS-pg
2. **Build Go API** with read endpoints (empty DB → fallback to Sanka)
3. **Run seeder** to populate from Sanka
4. **Point Next.js** to Go API (env var switch)
5. **Add cache layer** (Valkey or ristretto)
6. **Drop Sanka dependency** once all providers seeded

## Resource Budget (2-core / 4GB):

| Component | CPU | RAM | Notes |
|-----------|-----|-----|-------|
| Next.js SSR | 1.0 | 2048MB | standalone node |
| Go API | 0.5 | 256MB | static binary |
| Valkey | 0.25 | 512MB | auth sessions + cache |
| Seeder (burst) | 0.25 | 128MB | only during sync |
| **Total** | **2.0** | **~3GB** | leaves 1GB for OS |

Note: DOS-pg and DOS-pgb are shared infra (already running), not counted in jawatch budget.
