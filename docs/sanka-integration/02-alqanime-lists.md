# Plan #2 — `/anime/alqanime/home` · `/ongoing` · `/popular`

**Status:** planned · **Verified alive:** 2026-07-08 (all HTTP 200)
**Covers:** list mapping to `Media` + cross-source dedup seed for the home/surface.

## Verified response shape (all three)
```
{ status, creator, data: [ { title, slug, poster, type, status, episode, url } ] }
home.data len 15 · ongoing len 35 · popular len 15
```
Items are flat lists (no nested slider/hot/latest in this response — those were empty).

## Integration steps (reuse api.ts `registerMedia` + `mapAnimeListItem` pattern)
1. Add `mapAlqanimeListItem(item, 'alqanime') → Media`:
   - `slug` → `encodeMediaRef('anime','alqanime',slug)`
   - `poster` → `coverImage`
   - `type` (TV/Movie/OVA) → `MediaType` hint
   - `status` (Ongoing/Completed) → `status` field
   - `nsfw` heuristic: alqanime is SFW source, BUT title substring `uncen` / `uncensored` ⇒ flag `nsfw=true` (seen: "Nukitashi the Animation Uncen"). Safe default; refined when genre endpoint wired.
2. Surface feeders — extend api.ts:
   - `getLatest()` / `getOngoing()` / `getPopular()` call `/anime/alqanime/{ongoing|popular|home}` and merge via `registerMedia` (dedup by canonical slug across providers).
3. NSFW exclusion: these feeders must honor the `nsfw` filter (blueprint §NSFW policy #2) — excluded from surface until 21+ gate lands.

## Verification before merge
- Probe live (done). `bun run build` green. Extend `api.test.ts`:
  - same `title` from alqanime + another provider → single canonical `Media` (dedup).
  - `nsfw` true for items with `uncen` in title, false otherwise (alqanime SFW).
  - list feeders never return `nsfw` items when gate closed.

## Skipped (ponytail)
- `home` slider/hot/latest empty in response — wire `data:[]` generically, no special UI.
- Genre-based NSFW (genre slug 21/adult) deferred to mangasusuku plan (#6) where genres are richer.
