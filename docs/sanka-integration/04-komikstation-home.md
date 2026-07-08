# Plan #4 — `/comic/komikstation/home` (comic list + dedup)

**Status:** planned · **Verified:** 2026-07-08 — `/home` HTTP 200 (`trending`[10] + `latestUpdates`[30]).
**BROKEN (ignore per directive):** `/comic/komikstation/latest` → 403, `/comic/komikstation/manga/{slug}` → 500.
**Covers:** first COMIC source list → maps to `Media` (type `comic`) + cross-source dedup.

## Verified response shape
```
{ creator, success:true, trending: [ { title, slug, imageSrc, rating, latestChapter } ],  // 10
  latestUpdates: [ { title, slug, imageSrc, chapters: [ { chapterNumber, slug, title } ] } ] }  // 30
```
- `imageSrc` is a **data-URI SVG placeholder** (no real cover) → must fall back to a neutral cover; do NOT trust it as `coverImage`.
- `latestChapter` / `chapters[].slug` give the latest chapter slug → usable for "continue reading" hint.

## Integration steps (reuse api.ts `registerMedia` + `mapComicListItem` pattern)
1. `mapKomikstationItem(item, 'komikstation') → Media`:
   - `slug` → `encodeMediaRef('comic','komikstation',slug)`
   - `imageSrc` → only set `coverImage` if it is a real http(s) URL; else leave undefined (UI shows placeholder).
   - `rating` → numeric rating (parseFloat; 0 if NaN)
   - `latestChapter` → stash on `Media` as `latestChapterSlug` (extend type or side-table; ponytail: skip field, add when reader lands)
   - `nsfw` heuristic: komikstation is SFW source; flag only if title matches NSFW substrings (none observed).
2. Surface feeders — extend api.ts `getLatest()`/`getPopular()` to also pull `/comic/komikstation/home`
   and merge via `registerMedia` (dedup against mangakita/mangasusuku by canonical slug).
3. NSFW gate: honor `nsfw` exclusion (blueprint §NSFW #2).

## Verification before merge
- Probe live (done). `bun run build` green. Extend `api.test.ts`:
  - komikstation + mangakita returning same title → single canonical `Media` (dedup across comic sources).
  - `coverImage` undefined when `imageSrc` is a data-URI (no broken image).
  - `nsfw` false for komikstation (SFW), excluded-from-surface gate still enforced.

## Skipped (ponytail)
- `/latest` (403) and `/manga/{slug}` (500) endpoints — broken, ignored.
- Chapter reader source for komikstation deferred to a later plan (need a working chapter endpoint).
- `latestChapterSlug` field on Media — noted, added when reader plan lands.
