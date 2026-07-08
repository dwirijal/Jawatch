# Plan #1 — `/anime/alqanime/detail/{slug}`

**Status:** planned · **Verified alive:** 2026-07-08 (HTTP 200, 39 KB JSON)
**Covers:** synopsis ✓ · stream url ✓ · download url ✓ · suggestion media ✓ (`recommendations` + `related`)

## Verified response shape
```
data: {
  title, poster, rating, synopsis, trailer,
  info: { status, studio, dirilis, durasi, musim, tipe, episode, subtitle, credit, casts },
  genres: [{ name, slug, url }],
  downloads: [{ title, links: [{ resolution, urls: [{ server, url }] }] }],  // 13 items
  stream_links: [],            // present in schema, empty for this title; wire anyway
  recommendations: [{ title, slug, poster, status, type, rating }],  // 5 items
  related: [{ title, relation, slug, poster }]                       // 9 items
}
```

## Integration steps (minimal, reuse existing api.ts)
1. Add `'alqanime'` to `PROVIDER_CANDIDATES['anime']`.
2. Add `mapAlqanimeDetail(ref, raw)` → `Media` + `EpisodeSource[]` + `ChapterPage[]`-free:
   - `synopsis` → `Media.synopsis`
   - `downloads[].links[].urls[]` → `Media.downloadUrls` (flatten server+url+resolution)
   - `stream_links[]` → `Media.streamUrls`
   - `recommendations` + `related` → `getMediaSuggestions(slug)` output (dedup by slug)
   - `info.genres` → register genres
   - `nsfw = false` (alqanime is SFW source)
3. Register branch in `getMediaBySlugInternal` for `ref.provider === 'alqanime'`.
4. Wire `stream/download` URLs into the existing `/media/[type]/[slug]` page + episode sources route (no new routes).

## Verification before merge
- Probe live (done). Run `bun run build` green. Add/extend `api.test.ts` to assert:
  - `registerMedia('anime','alqanime',slug,title)` dedups against same title from another provider.
  - `nsfw` stays false for alqanime.
  - `recommendations` mapped into suggestions (non-empty).

## Skipped (ponytail)
- `stream_links` empty for sampled title; wire the field but don't build a player until a title returns real stream URLs.
- No new API routes — reuse existing episode/chapters routes.
