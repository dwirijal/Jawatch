# Plan #5 — `/comic/mangasusuku/detail/{slug}` (NSFW marking)

**Status:** planned · **Verified:** 2026-07-08 — `/detail/{slug}` HTTP 200, `/genre/21` HTTP 200.
**BROKEN (ignore):** `/comic/mangasusuku/chapter/{slug}` → 500 (`Error fetching chapter`).
**Covers:** synopsis ✓ · comic detail ✓ · **NSFW marking (hard requirement)**.

## Verified response shape
```
{ creator, success:true, title, alternativeTitle, image:<real-url>, rating, synopsis, info:{}, genres:[], chapters:[ {title, slug, date} ] }
```
- `image` is a **real http URL** (unlike komikstation's data-URI) → usable as `coverImage`.
- `genres` empty in this sample; NSFW is determined by **provider class**, not genre here.
- `/genre/21` returns `mangaList` → confirms genre id `21` is the NSFW genre (per blueprint matrix).

## NSFW policy (the core of this plan)
mangasusuku is NSFW-class (ENDPOINT-OWNERSHIP.md). Rule (BLUEPRINT §NSFW):
1. `mapMangasusukuDetail` / `mapMangasusukuListItem` ALWAYS set `nsfw = true`.
2. Also flag `nsfw = true` if any genre slug ∈ `{21, adult, hentai, nsfw}` (defensive, covers genre-tagged items).
3. Surface exclusion: `getMedia`/`getPopular`/`getTrending`/`getLatest`/`getRandom` filter `nsfw` OUT by default.
4. Gated reveal: only when `session.loggedIn && session.ageVerified (21+)` — auth/login built LAST, so until then NSFW is simply excluded everywhere.

## Integration steps (reuse api.ts)
1. Register `'mangasusuku'` is ALREADY in `PROVIDER_CANDIDATES['comic']` (api.ts L81).
2. `mapMangasusukuDetail(ref, raw)`:
   - synopsis → `Media.synopsis`
   - image → `coverImage`
   - rating → `Media.rating`
   - chapters → `Media.chapters` (title+slug+date) for reader stub
   - **`nsfw: true`** always (provider class) + genre check
3. Branch in `getMediaBySlugInternal` for `ref.provider === 'mangasusuku'` → `mapMangasusukuDetail`.
4. NSFW gate applied in all list/surface feeders (blueprint §NSFW #2).

## Verification before merge
- Probe live (done). `bun run build` green. Extend `api.test.ts`:
  - mangasusuku detail → `nsfw === true`.
  - mangasusuku item NEVER appears in `getMedia`/`getLatest` when gate closed (default).
  - `coverImage` set (real URL), not a data-URI.

## Skipped (ponytail)
- `/chapter/{slug}` (500) — broken, ignored. Reader source for mangasusuku deferred until a working chapter endpoint (try another source or retry later).
- `info`/`genres` empty in sample — map defensively (default to `{}`/`[]`).
