# Plan #7 — `/anime/animasu/episode/{slug}` (anime stream URL)

**Status:** planned · **Verified alive:** 2026-07-08 — detail HTTP 200 (`episodes[490]`), episode HTTP 200 (`streams`+`downloads`).
**Covers:** stream url ✓ · download url ✓ (anime). Completes "stream url" coverage (alqanime `stream_links` was empty).

## Verified response shape
```
detail:  { status, creator, source:"Animasu", detail:{ ..., episodes:[ {name, slug} ], batches:[...] } }
episode: { status, creator, source:"Animasu", title, streams:[ {name, url} ], downloads:[ {name, url} ] }
```
- `source:"Animasu"` confirms provider ownership (collision-guard §1).
- `streams[].url` → embed players (blogger/gdriveplayer). Map to `EpisodeSource[]` (`url`+`label=name`).
- `downloads[].url` → download links (parallel to alqanime downloads).
- Episode slug lives in detail `episodes[].slug`; fetch episode per slug.

## Integration steps (reuse api.ts + existing episode route)
1. `mapAnimasuEpisode(raw) → { sources: EpisodeSource[], downloads: DownloadUrl[] }`:
   - `streams` → `EpisodeSource { url, label: name, quality: parse from name (480p/720p) }`
   - `downloads` → `Media.downloadUrls`-style list
2. Branch in existing `getEpisodeSources(slug, epSlug)` (or `getEpisodes`) for `ref.provider === 'animasu'` → fetch `/anime/animasu/episode/{epSlug}`.
3. Wire into existing route `src/app/api/media/[slug]/episodes/[episodeSlug]/sources/route.ts`.
4. `nsfw` heuristic: animasu SFW source; flag on `uncen`/`uncensored` title (same as alqanime).

## Verification before merge
- Probe live (done). `bun run build` green. Extend `api.test.ts`:
  - animasu episode → non-empty `EpisodeSource[]` with `url`+`label`.
  - detail `episodes` → list of `Episode` with `slug` (drives per-episode fetch).
  - `nsfw` false for animasu (SFW), gated exclusion still enforced.

## Skipped (ponytail)
- `batches` field in detail — batch movie downloads; deferred (map only when batch UI lands).
- No new routes — reuse existing episode-sources route.
