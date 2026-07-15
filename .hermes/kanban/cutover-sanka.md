# Jawatch Cutover: Sanka → Self-Hosted (7-day plan)

**Target:** 0 Sanka calls in production by D7.
**Switch:** `JAWATCH_USE_LOCAL_API=1` (already default in Dockerfile).
**Fallback:** Sanka removed D7 (kept via env flag for 7 days).

## ⚠️ PIVOT 2026-07-15: Sanka IP ban

Host IP `182.8.66.29` is **permanently banned** by Sanka (Cloudflare 403 on all
paths). Ban was triggered by 2-pass seeder request volume. 1proxy rotation
has no https proxies. Options:

| Option | Cost | Impact |
|--------|------|--------|
| A. Pay 15k IDR for unban | $1 | Unblocks all paths |
| B. Use alternate egress (Tor, residential proxy) | varies | Unblocks all paths |
| C. Defer source-URL migration (D1+ ship list-only) | free | 80% self-hosted now |
| D. Use Sanka `defaultStreamingUrl` HTML-embed extracts | free | partial, fragile |

**Decision:** Go with **C** (list/browse/search 100% local, source URLs stay
on Sanka per-request until unban) — keeps the 1-week plan alive.

**This means:** we ship 80% of the migration now. Remaining 20% (play time)
needs option A or B later.

## Backlog

### D1 — 2-pass seeder for source URLs [BLOCKED on Sanka ban]
- [ ] Wait for Sanka unban (option A) or alternate egress (option B)
- [ ] Then: add `seedDetailSources` mode in `internal/seed/seed.go`
- [ ] For each `episode` in DB, follow upstream episode URL endpoint → store `episode_source` rows
- [ ] For each `chapter` in DB, follow upstream chapter URL endpoint → store `chapter_page` rows
- [ ] Sanka: `/anime/episode/{episodeId}` returns `streamUrl` map
- [ ] Skip if `synced_at < NOW() - INTERVAL '24 hours'`
- [ ] Backoff: 800ms between Sanka requests
- **Accept:** `episode_source` count > 0, `chapter_page` count > 0
- **PIVOT:** Ship as D7-task after unban

### D1' — Wire detail-reads to local [NOW]
- [x] Local API has 81 media, 1267 episodes, 11104 chapters
- [x] `/api/v1/media/{slug}` works
- [x] `/api/v1/media/{slug}/episodes` works
- [x] `/api/v1/media/{slug}/chapters` works
- [ ] Build canonical `mapLocalDetail(ref, localMedia)` in `localApi.ts`
- [ ] Wire `getMediaBySlug`, `getEpisodes`, `getChapters` to local
- [ ] Keep `getEpisodeSources`, `getChapterPages` on Sanka until unban
- **Accept:** detail page + episode list + chapter list render from local

### D2 — Seed remaining providers
- [ ] komikstation via `/comic/komikstation/list` (works, vs `top-weekly` which 500s)
- [ ] donghua via alternate Sanka endpoint
- [ ] mangasusuku via `/comic/mangasusuku/list` (skip if 500 persists — NSFW, low pri)
- [ ] animasu via `/anime/animasu/list`
- **BLOCKED on Sanka ban** — defer until D7
- **Accept:** each provider media count > 0

### D3 — Canonical `mapLocalDetail` [IN PROGRESS]
- [ ] Single function: `mapLocalDetail(localMedia) → Media`
- [ ] Normalize `episodeList`, `chapterList`, `synopsis`, `genres`, `studios`
- [ ] Replace 7 provider-specific `mapXxxDetail` calls
- **Accept:** `getMediaBySlug` returns full detail from local

### D4 — Wire detail/episode/chapter reads to local API [IN PROGRESS]
- [ ] `getMediaBySlug` → `localApi.getMediaBySlug`
- [ ] `getEpisodes` → `localApi.getEpisodes`
- [ ] `getEpisodeSources` → Sanka (ban-blocked) or local (D1')
- [ ] `getChapters` → `localApi.getChapters`
- [ ] `getChapterPages` → Sanka (ban-blocked) or local (D1')
- **Accept:** 3/5 pages render from local, 2/5 with Sanka fallback for sources

### D5 — Visuals & UX polish [IN PROGRESS]
- [ ] Improve ContinueRail scroll UX (fade edges, snap scroll, progress pills)
- [ ] MediaGrid stagger entrance animation (Stagger component)
- [ ] SectionHeader animated underline accent + eyebrow glow
- [ ] ContentCard hover: scale-up + shadow deepen + rating badge
- [ ] Skeleton shimmer animation (CSS gradient wave)
- [ ] EmptyState floating icon + gradient border
- [ ] SearchBar focus glow + expand animation
- [ ] Page transitions (Reveal wrapper on route change)
- [ ] Bottom nav polish (active indicator, micro-interactions)
- [ ] Detail page hero enhancement
- **Owner:** visual subagent (deleg_1dba1fa6)

### D6 — Source URL health check [DEFERRED]
- [ ] Add `episode_source.is_dead BOOL`, `last_checked_at TIMESTAMPTZ`
- [ ] `seedHealth` mode: HEAD request each source URL, mark dead
- [ ] Prometheus counter `jawatch_dead_sources_total`
- **Defer until D1 unblocks**

### D7 — Cron schedule
- [ ] `0 3 * * *` home seed (if D1 unblocked)
- [ ] `0 4 * * 0` full detail seed
- [ ] `0 5 * * *` source health check
- [ ] Mount as systemd timer or Docker restart policy
- **Accept:** logs visible for 3 consecutive runs

### D8 — Cutover (partial)
- [ ] Set `JAWATCH_USE_LOCAL_API=1` permanent
- [ ] For play-time pages, set `JAWATCH_USE_SANKA_SOURCES=1` (new flag)
- [ ] Monitor `fetchUpstreamJson` calls in prod logs for 24h
- [ ] Source URL calls must drop to 0 (after D1 unblocks)
- **Accept:** list/browse/search at 0 Sanka hits; sources at 0 after D1 unblocks

## Done

- ✅ Local API Go binary (15.9MB static, 20MB RAM)
- ✅ Schema `jawatch.*` applied to DOS-pg (12 tables)
- ✅ Initial seed: 81 media / 1267 eps / 11104 chs / 47 genres
- ✅ Wire list/home/popular/trending/latest/random/search/genre/studio to local
- ✅ `JAWATCH_USE_LOCAL_API` env flag in Dockerfile
- ✅ Build + tests + 12/12 E2E pages verified

## Risks

- ~~Sanka rate limit~~ → not the issue, full IP ban is
- **Sanka unban** → need user decision on option A or B
- Dead stream URLs → mitigated by D5 (deferred)
- Hentai providers → keep `nsfw` flag
- Schema migrations → new columns need `schema.sql` update + `ALTER TABLE`
