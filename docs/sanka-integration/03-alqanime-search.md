# Plan #3 — `/anime/alqanime/search/{query}`

**Status:** planned · **Verified alive:** 2026-07-08 (HTTP 200, 11 hits for "naruto")
**Covers:** search → verification lever + suggestion engine (cross-source dedup seed).

## Verified response shape
```
{ status, creator, data: [ { title, slug, poster, type, status, episode, url } ], pagination }
data len 11 for "naruto". Item shape IDENTICAL to list endpoints (plan #2).
```

## Role in architecture
Search is the **verification lever** from BLUEPRINT §dedup: to dedup a title across sources,
query each source's search and compare `slug`/`title`. It is also the user-facing search backend
(current `SearchBar` posts to `/search`; wire this as the anime provider behind it).

## Integration steps (reuse api.ts)
1. `mapAlqanimeSearchItem(item) → Media` (same shape as `mapAlqanimeListItem`, plan #2 — reuse it).
2. Add `searchAnime(query, provider='alqanime'): Promise<Media[]>` in api.ts:
   - fetch `/anime/alqanime/search/{encodeURIComponent(query)}`
   - map + `registerMedia('anime','alqanime',slug,title)` (dedup against other providers)
   - apply `nsfw` heuristic (`uncen`/`uncensored` in title → true)
3. **Verification engine** (cross-source): `verifyAcrossSources(title)` queries
   `alqanime`, `animasu`, `samehadaku`, … search endpoints, returns candidate `MediaRef`s keyed by
   canonical slug. Used by `registerMedia` to pick highest-signal source (poster+rating+synopsis).
   Punts per-source search until those plans land; this plan implements alqanime only.
4. NSFW gate: search results honor `nsfw` exclusion (blueprint §NSFW #2).

## Verification before merge
- Probe live (done). `bun run build` green. Extend `api.test.ts`:
  - `searchAnime('naruto')` returns >0 `Media`, all `provider==='alqanime'`.
  - a title already registered by another provider → returned Media shares canonical slug (dedup).
  - `nsfw` flagged for `uncen` titles in results, excluded when gate closed.

## Skipped (ponytail)
- Multi-source `verifyAcrossSources` orchestration: alqanime only this plan; extend when animasu/samehadaku plans land.
- No new route — wire into existing `/search` page consumer.
