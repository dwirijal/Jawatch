# Plan #6 — `/comic/mangakita/chapter/{slug}` (comic reader source)

**Status:** planned · **Schema verified:** 2026-07-08 — `/chapter/{slug}` returns real shape (HTTP 200 shell; `success:true` skeleton with `images`/`navigation`).
**LIVE STATUS: mangakita discovery endpoints are DOWN** — see Broken section. Plan documents the reader schema + the integration contract; execution blocked until discovery recovers.

## Verified `/chapter/{slug}` response shape (schema, from empty-but-well-formed response)
```
{ creator, success:true, title, comicSlug, images:[ {url, page} ], navigation:{ prev, next }, relatedSeries:[] }
```
- `images[]` → page URLs for the reader (`ChapterPage[]` in api.ts).
- `navigation.prev/next` → chapter paging (wire into reader prev/next).
- `comicSlug` → back-link to detail.

## BROKEN / DOWN (ignore per directive — document, do not integrate yet)
Probed 2026-07-08, all return empty shells or errors:
- `/comic/mangakita/home` → 200 but `popularToday/projectUpdates/latestReleases` all `[]`
- `/comic/mangakita/daftar-manga/1` → 500
- `/comic/mangakita/popular` → 403
- `/comic/mangakita/search/...` → 500
- `/comic/mangakita/detail/{slug}` → 200 but empty `details` (needs valid slug; none discoverable live)
- `/comic/komikstation/chapter/{slug}` → 500 ("Error fetching chapter data")
- `/comic/mangasusuku/chapter/{slug}` → 500 ("Error fetching chapter from Mangasusuku")

**Conclusion:** NO comic chapter endpoint is serving real data today. Reader integration is BLOCKED on upstream recovery.

## Integration contract (when discovery recovers)
1. `mapMangakitaChapter(raw) → ChapterPage[]`: `images[]` → `{ slug: chapterSlug, pageNumber, url }`.
2. Wire into existing route `src/app/api/media/[slug]/chapters/[chapterSlug]/pages/route.ts` (already exists for the reader).
3. `navigation.prev/next` → reader chapter nav.
4. Mangakita is SFW → `nsfw: false`.

## Verification before merge (future)
- Probe live (currently fails). `bun run build` green. `api.test.ts`: chapter with valid slug → non-empty `ChapterPage[]`; reader route returns pages.

## Skipped (ponytail)
- Execution deferred — upstream chapter endpoints are 500/empty. Re-probe in a later loop; if still down, drop mangakita reader from scope.
- No new routes — reuse existing chapter-pages route.
