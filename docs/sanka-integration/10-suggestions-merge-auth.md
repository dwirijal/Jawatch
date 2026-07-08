# Plan #10 — Cross-source suggestion merge + auth/route strategy (cycle close)

**Status:** planned · **Verified inputs:** alqanime `recommendations[5]`+`related[9]` (iter #1), samehadaku `episodeList[220]` (iter #8).
**Covers:** suggestion media (unified) · locks route strategy · plans auth/login LAST (per directive).

## A. Cross-source suggestion merge
Each source exposes its own "more like this":
- alqanime detail → `recommendations[]` + `related[]` (slug + title + poster).
- samehadaku detail → `episodeList[]` (not suggestions, but proves same title across sources).
- komikstation/mangasusuku home → `latestUpdates`/`trending` (implicit suggestions).

**Merge contract** (reuse `getMediaSuggestions(slug)` already in api.ts):
1. For a canonical `Media`, collect suggestion slugs from EVERY registered provider's detail response.
2. Map each suggestion slug → `MediaRef` via `registerMedia` (dedup; a suggestion may itself be multi-source).
3. Exclude `nsfw` suggestions when gate closed (BLUEPRINT §NSFW #2).
4. Cap at 12, de-dupe by canonical slug, prefer suggestions with poster.
5. No new route — surface on `/media/[type]/[slug]` detail page.

## B. Route strategy (locked before auth)
- Keep existing URLs: `/media/[type]/[slug]` (detail), `/media/[type]/[slug]/episodes/[episodeSlug]`, `/media/[type]/[slug]/chapters/[chapterSlug]`.
- Canonical slug already encodes `provider` (`encodeMediaRef`) → surface always knows source (collision-guard §4).
- API routes reused: `/api/media/[slug]/episodes/[episodeSlug]/sources`, `/api/media/[slug]/chapters/[chapterSlug]/pages`.
- New provider branches added per plan; NO new top-level routes needed.

## C. Auth/login plan (BUILT LAST — after routes optimal)
1. **Why last:** NSFW gate + all endpoint routes must be stable first; auth only unlocks gated reveal.
2. **Session model:** `session = { loggedIn: bool, ageVerified: bool }` (21+).
3. **Gated reveal:** `getMedia`/feeders check `session.loggedIn && session.ageVerified` → include `nsfw` items. Until auth exists, NSFW simply excluded everywhere (safe default, already planned in #5).
4. **Endpoints (future, not this cycle):** `POST /api/auth/login`, `POST /api/auth/age-verify` (21+), session cookie.
5. **Novel/comic/anime reader** stays open; only NSFW surface reveal is gated.

## Verification before merge
- `bun run build` green. Extend `api.test.ts`:
  - `getMediaSuggestions(slug)` merges alqanime `recommendations`+`related` → ≥1 suggestion, deduped by canonical slug.
  - nsfw suggestions excluded when gate closed.
  - route-strategy doc matches actual `src/app/media` + `src/app/api` tree (no orphan routes).

## Skipped (ponytail)
- Actual auth implementation deferred to a later cycle (directive: auth LAST). This plan only locks the strategy + NSFW gate contract.
- Per-user watch-history / library personalization — out of scope this cycle.
