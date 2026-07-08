# Sanka Endpoint Integration Blueprint

> CEO loop: each iteration integrates ONE Sanka endpoint (anime/comic). Verification-first.
> NSFW gate (mangasusuku, nekopoi) excluded from home/surface unless logged in + age-verified 21+.
> Novel adoption planned. Auth/login LAST, after route paths are settled.

## Source reality (verified 2026-07-08)
- Sanka OpenAPI: 442 paths — `anime` 236, `comic` 191, `novel` 15.
- Base URL: `https://www.sankavollerei.web.id` (server from spec).
- Endpoints are **self-describing only** — no operationId/summary. Verification = live probe.
- Providers observed: `alqanime, animasu, animekompi, animekuindo, kusonime, samehadaku, oploverz, komikstation, mangakita, mangasusuku, meganei, maid, kiryuu, westmanga, soulscan, softkomik, sakuranovel`, ...
- **Alive (probed):** `/anime/alqanime/search/{q}`, `/anime/alqanime/detail/{slug}`, `/comic/mangasusuku/home`, `/comic/komikstation/home`, `/novel/sakuranovel/home`.

## Existing integration layer (src/lib/api.ts)
- Already has a canonical dedup system: `MediaRef {type, provider, upstreamSlug}`, `registerMedia`, `encodeMediaRef`, `resolveCanonicalRef`, `PROVIDER_CANDIDATES` per type.
- `Media` type already carries `nsfw?: boolean`.
- `alqanime` is NOT yet in `PROVIDER_CANDIDATES` — must be registered.
- NSFW flag currently unused for mangasusuku/nekopoi. **Gap to close.**

## CROSS-SOURCE COLLISION GUARD (hard rule — user note 2026-07-08)
`/anime/{source}` and `/comic/{source}` trees MIRROR each other: every source exposes near-identical
detail/search/list/episode endpoints. Risk: two sources return the same title; calling the wrong
provider's path, or merging payloads across sources, corrupts ownership.

Rules every plan MUST follow:
1. **Namespace every call by provider.** `registerMedia(type, provider, slug, title)` keys on `provider`.
   A call to `/anime/alqanime/detail/{slug}` is owned by `alqanime` ONLY — never route it to animasu/samehadaku.
2. **Dedup at canonical-slug resolution, NOT by merging upstream payloads.** Canonical key = `type|normalized-title`.
   Two providers returning "Naruto" → ONE `Media`, each with its own `MediaRef` (provider+upstreamSlug).
   Provider-specific refs are kept; one source's JSON is never blended into another's.
3. **Each plan names the EXACT provider-prefixed path it calls.** No generic "/anime/detail". Ambiguous = bug.
4. **`resolveCanonicalRef` picks candidate provider per `PROVIDER_CANDIDATES[type]`** — chosen provider dictates
   which upstream path is fetched. Surface slug encodes provider; source always known.
5. **Mirrored paths do NOT share mappers.** `mapAlqanimeDetail` ≠ `mapAnimasuDetail` even if shapes look alike —
   shapes drift per source; one mapper per source prevents silent field loss.

Endpoint ownership matrix (generated): see `ENDPOINT-OWNERSHIP.md`.

## Cross-source dedup strategy
- Canonical key = `type|normalized-title`. `slugFromTitle()` exists; reuse + extend.
- `registerMedia(type, provider, slug, title)` already dedupes by canonical slug across providers.
- Search-per-category (`/anime/*/search`, `/comic/*/search`) is the verification lever:
  query title across providers, pick highest-signal (poster + rating + synopsis), register once.

## NSFW policy (hard requirement)
1. `Media.nsfw` set true for providers: `mangasusuku`, `nekopoi`(when added), and any item whose genre slug ∈ `{21, adult, hentai, nsfw}`.
2. Surface exclusion: `getMedia`/`getPopular`/`getTrending`/`getLatest`/`getRandom` filter `nsfw` OUT by default.
3. Gated reveal: only when `session.ageVerified === true && session.loggedIn === true` (21+).
4. Auth/login is built LAST. Until then, NSFW is simply excluded everywhere (safe default).

## Endpoint sequence (plan per loop iteration)
1. **alqanime detail** — synopsis, stream_links, downloads, recommendations, related. [THIS ITERATION]
2. alqanime home/ongoing/popular — list mapping to Media + dedup.
3. alqanime search — verification + suggestion engine.
4. komikstation home/latest — comic list + dedup.
5. mangakita detail/chapter — comic reader source.
6. mangasusuku detail — COMIC + mark NSFW, exclude from surface.
7. animasu episode source — stream URL for anime.
8. nekopoi (if present) — NSFW comic, gated.
9. novel/sakuranovel home/detail — novel adoption plan.
10. cross-source suggestion merge — unify recommendations across providers.
11. (loop #11) review + merge useful endpoints; lock auth/login plan.

## Route strategy (decide BEFORE auth)
- Keep existing `/media/[type]/[slug]` URLs.
- Canonical slug already encodes provider (`encodeMediaRef`); surface uses it.
- `/api/media/[slug]/episodes/[ep]/sources` and `/chapters/[ch]/pages` already exist — wire new providers into them.
