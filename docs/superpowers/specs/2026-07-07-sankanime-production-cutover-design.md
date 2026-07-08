# Sankanime Production Cutover Design

Date: 2026-07-07
Status: approved for planning

## Goal

Cut Jawatch production traffic over to Sanka/Sankanime while keeping the app contract stable and the sitemap simple.

Success means:

- public browse, search, detail, watch, and read flows use Sanka-backed data
- detail/watch/read failures are visible, not silently empty
- sitemap exposes only high-value indexable URLs
- no full OpenAPI client, provider registry, or source switch UI

## Source of Truth

Use Sanka canonical base:

```text
https://www.sankavollerei.web.id
```

Runtime config:

```text
JAWATCH_MEDIA_API_URL=https://www.sankavollerei.web.id
```

Keep it server-only. Do not add `NEXT_PUBLIC_*` upstream config.

## Architecture

Use the existing Jawatch facade in `src/lib/api.ts` as the only Sanka boundary.

App-facing API remains:

- `getMedia`
- `searchMedia`
- `getMediaBySlug`
- `getGenres`
- `getPopular`
- `getLatest`
- `getRandom`
- `getEpisodes`
- `getEpisodeSources`
- `getChapters`
- `getChapterPages`

Pages, components, and client helpers should not know raw Sanka endpoints.

Slug contract stays:

```text
m~base64url({ type, provider, slug })
```

Legacy `type~provider~slug` refs remain readable.

## Provider Scope

Primary anime/donghua:

- aggregate `/anime/*`
- `samehadaku`
- `donghub`

Primary comic:

- `komikstation`
- `mangasusuku`
- `komikindo`

Deferred unless logs prove need:

- `bacakomik`
- `westmanga`
- `softkomik`
- full 442 endpoint coverage

Avoid for production primary:

- Kanata scraper routes
- Nvlgroup
- region-locked or ambiguous routes
- source UI switching

## Data Flow

Browse rails:

1. page calls Jawatch helper
2. helper calls bounded Sanka endpoint set
3. mapper normalizes to `Media[]`
4. optional rail failures return empty arrays

Search:

1. call aggregate `?q=` endpoint where spec supports it
2. fallback to curated providers only when needed
3. cap total results
4. dedupe by slug/title

Detail/watch/read:

1. decode media ref
2. call provider-specific Sanka route
3. map payload to Jawatch shape
4. unsupported provider or non-timeout upstream error surfaces as visible failure

## Error Handling

Allowed silent fallback:

- optional home rails
- optional sitemap media expansion
- optional genre lists

Visible failure required:

- media detail
- episode sources
- chapter pages
- invalid production payloads where user opened a concrete URL

Timeouts may degrade where needed. Non-timeout failures should not become fake success on concrete pages.

## Sitemap Design

Keep sitemap minimal and high-signal.

Include:

- `/`
- `/discover`
- `/discover/anime`
- `/discover/donghua`
- `/discover/comic`
- `/popular`
- `/latest`
- `/genres`
- `/genres/[slug]` from `getGenres()`
- top bounded `/media/[slug]` from first page of `getMedia(undefined, 1, limit)`

Exclude:

- `/search`
- `/api/*`
- `/watch/*`
- `/read/*`
- user/private pages
- unsupported content types: manga/movie/novel until real Sanka-backed flows exist
- deep pagination
- every Sanka endpoint

Implementation rule:

- one sitemap function
- one static route list
- one media limit constant
- no crawler
- no custom cache
- use existing `revalidate`
- dedupe with `Map`

SEO rules:

- canonical URLs only
- no redirect-hop URLs
- stable `lastModified`
- priorities reflect intent, not keyword stuffing
- sitemap contains intended public index surface only

## Robots

Keep robots simple:

- allow public app pages
- disallow low-value/private surfaces: `/api`, `/search`, `/library`, `/profile`, `/notifications`, `/login`
- reference `/sitemap.xml`

Do not block `/media`, `/discover`, `/genres`, `/popular`, or `/latest`.

## Testing

Unit tests:

- Sanka base env empty means no upstream fetch
- search uses spec-correct query endpoint where applicable
- provider refs encode without leaking provider internals in URLs beyond encoded ref
- concrete detail/watch/read failures remain visible
- sitemap excludes unsupported static routes and includes supported routes

Runtime checks:

- `/`
- `/discover`
- `/discover/anime`
- `/discover/donghua`
- `/discover/comic`
- `/popular`
- `/latest`
- `/genres`
- `/sitemap.xml`
- one `/media/[slug]`
- one watch flow
- one read flow

Build gates:

```bash
bun test
bun run build
```

## Rollback

Rollback path is one of:

1. revert adapter commit
2. change production `JAWATCH_MEDIA_API_URL` back to previous stable backend if available
3. redeploy last known-good Vercel deployment

No database migration involved.

## Non-goals

- no full generated OpenAPI SDK
- no new dependency
- no custom cache layer
- no provider admin UI
- no Kanata/Ryzumi/Nvlgroup blending
- no deep sitemap crawler
