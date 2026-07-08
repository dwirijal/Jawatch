# Plan #9 — `/novel/sakuranovel/detail/{slug}` (novel adoption)

**Status:** planned · **Verified alive:** 2026-07-08 — home HTTP 200 (`results[30]`), detail HTTP 200 (89 KB, rich).
**Covers:** novel adoption · synopsis ✓ · suggestion media (chapters/recommendations) · novel reader endpoint.
**Only novel source in spec** (ENDPOINT-OWNERSHIP.md: `sakuranovel` is the sole `/novel/{source}`).

## Verified response shape
```
home:   { data:{ pagination, results:[ {title, slug, poster, latest_chapter} ]×30 } }
detail: { data:{ title, alt_title, slug, poster, rating, status, type:"Web Novel",
                  synopsis, info:{country,published,author,tags}, genres:[{name,slug}],
                  chapters:[ {title, date, slug, read_endpoint} ]×271 } }
```
- `read_endpoint`: `/movie/novel/sakuranovel/read/{chapterSlug}` → novel reader (chapter content).
- `genres` real (Action/Adventure…) — unlike mangasusuku's empty genres.
- `poster` real URL → `coverImage`.

## Novel as a Media type
`api.ts` already has `MediaType = 'anime'|'manga'|'movie'|'donghua'|'comic'|'novel'` — **`'novel'` exists**.
- `mapSakuranovelDetail(ref, raw) → Media` with `type:'novel'`.
- `chapters` → `Chapter[]` (slug=chapter slug, title, createdAt=date).
- `nsfw` heuristic: sakuranovel SFW source; flag on NSFW genre/substring (none observed).

## Reader integration
- Novel reader reuses existing `src/app/api/media/[slug]/chapters/[chapterSlug]/pages/route.ts`
  (chapter pages concept maps to novel paragraphs). `getChapterPages` branch for `ref.provider==='sakuranovel'`
  → fetch `read_endpoint`.
- Surface: novel appears in `/discover`, `/latest`, search — gated by NSFW policy like other media.

## Verification before merge
- Probe live (done). `bun run build` green. Extend `api.test.ts`:
  - sakuranovel detail → `Media.type==='novel'`, `synopsis` non-empty, `chapters.length>0`.
  - `coverImage` set (real poster URL).
  - `nsfw` false (SFW), gated exclusion enforced.
  - reader route returns chapter content for a valid `read_endpoint`.

## Skipped (ponytail)
- `read_endpoint` content shape not probed (novel paragraphs) — verify when wiring reader; ponytail: assume paragraph list.
- `info.tags` → map to Media tags only if type extended.
