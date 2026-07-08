# Plan #8 — `/anime/samehadaku/anime/{animeId}` (cross-source dedup demo)

**Status:** planned · **Verified:** 2026-07-08 — detail HTTP 200 (rich), search `?q=` HTTP 200.
**BROKEN:** `/anime/samehadaku/episode/{episodeId}` → 500 ("Error fetching data from Samehadaku").
**Covers:** synopsis ✓ · cross-source dedup (the key demonstration of BLUEPRINT §collision-guard).

## Verified response shape
```
search?q={q}: { status, data:{ animeList:[ {title, poster, type, score, status, animeId, href} ] } }
detail:      { status, data:{ title, poster, score:{value,users}, japanese, synonyms, english,
                                 status, type, source, duration, episodes, season, studios,
                                 producers, aired, trailer, synopsis, episodeList:[ {title, episodeId, href} ] } }
```
- `animeId` is a **slug-style id** (e.g. `naruto-kecil`), obtained via search `?q=` (NOT a bare detail path).
- `episodeList[].episodeId` drives episode fetch — but episode endpoint is 500 (down).
- Rich metadata: `synopsis`, `score`, `studios`, `season`, `aired` — best detail source so far.

## Cross-source dedup demonstration (the point of this plan)
samehadaku `naruto-kecil` (english "Naruto") == alqanime `naruto-shippuuden` (title "Naruto: Shippuuden").
Both → ONE canonical `Media` via `registerMedia('anime', provider, slug, normalizedTitle)`:
- `alqanime` ref + `samehadaku` ref point to the same canonical slug.
- `resolveCanonicalRef` picks the candidate with richest signal (samehadaku has synopsis+score+studios).
- We NEVER merge payloads — each provider keeps its own `MediaRef`; surface slug encodes the chosen provider.

## Integration steps (reuse api.ts)
1. `mapSamehadakuDetail(ref, raw)`:
   - `synopsis` → `Media.synopsis`
   - `poster` → `coverImage`
   - `score.value` → `Media.rating` (numeric)
   - `episodeList` → `Episode[]` (slug=`episodeId`)
   - `nsfw` heuristic: samehadaku SFW source; flag `uncen`/`uncensored` in title.
2. Discovery: `searchSamehadaku(query)` → `?q=` → returns `animeId`+title; feed into `registerMedia`.
3. Branch in `getMediaBySlugInternal` for `ref.provider === 'samehadaku'`.
4. Episode stream: DEFER — endpoint 500. `getEpisodeSources` for samehadaku returns `[]` until upstream recovers (fall back to alqanime/animasu stream).

## Verification before merge
- Probe live (done). `bun run build` green. Extend `api.test.ts`:
  - samehadaku `naruto-kecil` + alqanime `naruto-shippuuden` → single canonical `Media` (dedup by normalized title).
  - samehadaku detail → `synopsis` non-empty, `rating` numeric.
  - `getEpisodeSources('samehadaku', epId)` → `[]` gracefully (no crash on 500).

## Skipped (ponytail)
- Episode stream (500) — deferred; reuse alqanime/animasu stream until samehadaku recovers.
- `trailer`/`studios`/`aired` → mapped to Media if type extended; ponytail: map synopsis+rating only now.
