# End-to-End Flow — jawatch

> How a request travels from browser → route → data layer → upstream → render.
> Companion to `README.md` (setup) and `docs/vercel-cost-optimization.md` (caching rationale).
> Upstream media source is referred to generically; provider names live only in `docs/sanka-integration/`.

## 1. Request lifecycle (the whole story)

```
Browser
  │  GET /media/anime/<slug>
  ▼
Next.js App Router  (src/app/media/[type]/[slug]/page.tsx)
  │  export const revalidate = 300  + generateStaticParams([]) → ISR-cacheable shell
  ▼
Data layer  (src/lib/api.ts)
  │  getMediaBySlug → resolveCanonicalRef → decodeMediaRef
  ▼
fetchUpstreamJsonOnce  (api.ts:~360)
  │  fetch(MEDIA_API_BASE + path, { next: { revalidate: 300 }, signal: AbortController })
  ▼
Upstream media API  (JAWATCH_MEDIA_API_URL, 8s timeout)
  ▲
  │  JSON → mapped to Media/Episode/Chapter types
Render static HTML shell  →  CDN cache (x-nextjs-cache: HIT within 300s)
  │
  ▼
Client hydration (signed-in only)
     <DetailActions> → GET /api/user/library-state (force-dynamic) → real bookmark + resume CTA
```

**Two data paths, by design:**
- **Content** (title, episodes, covers) — cached, static shell, ~0 function invocation within a 300s window.
- **Per-user state** (bookmark, resume) — `force-dynamic` API route, fetched client-side, only for authenticated sessions. Crawlers and signed-out visitors never trigger it.

## 2. Layers

| Layer | Files | Responsibility |
|-------|-------|----------------|
| Routes | `src/app/**/page.tsx`, `**/route.ts` | ISR config, param decode, render |
| Data | `src/lib/api.ts` | upstream fetch, ref resolution, type mapping, `next.revalidate` cache |
| Client fetch | `src/lib/client-media.ts` | on-demand playback / mirror / pages (browser → own API routes) |
| Session | `src/lib/session.ts` | `getUserId()` — never throws into render; absent session = signed out |
| Auth | `src/lib/auth.ts` + `/api/auth/[...all]` | better-auth handler |

## 3. Key routes and their cache posture

| Route | Glyph | Cached? | Notes |
|-------|-------|---------|-------|
| `/` | ○ Static | yes (300s) | ContinueRail hydrates client-side |
| `/discover/[type]` | ● SSG | yes | fixed `validTypes` prerendered |
| `/media/[type]/[slug]` | ● ISR | yes (on first visit) | per-user bits in `<DetailActions>` |
| `/genres|authors|studios/[slug]` | ● ISR | yes (on first visit) | empty `generateStaticParams` |
| `/media/.../episodes/[episodeSlug]` | ƒ Dynamic | no | `noindex`, fresh playback, `after()` records resume |
| `/api/user/library-state`, `/progress` | ƒ Dynamic | no | neutral payload when signed out |
| `/search`, `/library/*` | ƒ Dynamic | no | per-request |

## 4. Canonical ref resolution (why `?src` and slug encoding exist)

Multiple upstream providers can serve the same title. jawatch dedups at the
**canonical-slug** layer, never by merging payloads across sources:

```
resolveCanonicalRef(type, canonicalSlug, srcHint?)
  → if srcHint present: use it (fast path, no fan-out)
  → else: probe candidate providers in parallel, pick first hit
  → returns MediaRef { type, provider, upstreamSlug }
buildCanonicalPath / buildMediaLink → encode ref into the URL
decodeMediaRef → reverse, for the next request
```

`?src` on links short-circuits the cold fan-out (§2.5 of cost doc).

## 5. Watch/read playback flow

```
episode page (SSR, dynamic)
  → getEpisodePlayback(slug, epSlug)  → { sources, mirrors, downloads }
       sources   = playable now (default stream)
       mirrors   = resolve on click → /api/media/.../server/[serverId] → { url }
       downloads = direct links (rendered as-is)
VideoPlayer (client)
  → mirror click → resolveMirrorClient → iframe swap (old stream stays if resolve fails)
  → switchEpisode → refetch playback, prefetch next
```

Manga pages are served as raw `<img>` from upstream (off-Vercel egress).

## 6. Failure semantics

- Upstream timeout (8s) → `AbortController` aborts → `safeGet*` returns `{ ok:false }` → route renders empty/not-found state, never a 500.
- `getUserId()` on broken/absent session → `null` (signed out), never throws.
- Invalid `[type]`/`[slug]` → `notFound()` → renders not-found body with `noindex` meta. (Known: returns HTTP 200 soft-404 in ISR segments — see cost doc / verify notes.)
- Catch-all `/media/[...type]` → real 404 for structurally bad paths.

## 7. Auth flow

Better Auth instance in `src/lib/auth.ts`, served by the catch-all handler at
`src/app/api/auth/[...all]/route.ts` (`toNextJsHandler(auth)` → `GET`/`POST`).
Google OAuth is env-gated; when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are
absent the provider map is `{}` and only email+password is offered.

```text
login/register page (client form)
└─ POST /api/auth/sign-in/email | /sign-up/email   (credentials)
   └─ better-auth → sets signed session cookie (httpOnly, SameSite)
└─ OR /api/auth/sign-in/oauth/google               (env-gated)
   └─ better-auth OAuth redirect → session cookie
→ router.refresh() + window.location.href='/'      (login/register page.tsx)
```

**Sign-out** (`src/app/api/auth/sign-out/route.ts`): `POST` → `auth.api.signOut({ headers })`
then `NextResponse.redirect('/')`. The call is wrapped in try/catch — no active
session makes `signOut` throw, but the redirect still lands home (no data-loss path).

**Session resolution** (`src/lib/session.ts`): `getUserId()` calls
`auth.api.getSession({ headers })` and returns `user.id` or `null`. It never
throws into a render — any failure (broken/absent session) = signed out. This is
the single gate every per-user path uses (`library.ts`, `DetailActions`, episode
& chapter pages, library/* pages).

**Per-user UI hydration** — the shell stays ISR-static; signed-in bits are
upgraded client-side after mount (`src/components/DetailActions.tsx`):

```text
SSR/CDN: neutral "Start watching/reading" CTA + un-saved bookmark
  → useEffect fetch /api/user/library-state?ref=<mediaRef>&kind=watch|read
  → 200: setState({ bookmarked, resume }) → upgrade to "Resume EP/CH n" + real bookmark
  → signed-out / error: shell unchanged (progressive enhancement)
```

Signed-out visitors and crawlers never call `/api/user/library-state` (forced
`force-dynamic`, returns neutral `{ bookmarked:false, resume:null }`).

## 8. Library / progress flow

Two persisted tables back the Library surfaces (`src/lib/library.ts`, repository
over pg, all queries parameterized). Every write/delete returns the fallback and
no-ops when `DB unreachable / table missing (42P01) / ECONNREFUSED / ENOTFOUND /
57P03` — reads return `[]`, writes silently skip. Never throws into a page render.
`mediaRef` is validated (non-empty, <512 chars, contains `/` or `~`) before any query.

| Concern | Read | Write | Write path |
|---------|------|-------|-----------|
| Bookmarks | `isBookmarked`, `listBookmarks` | `toggleBookmark` (delete-then-insert, idempotent `on conflict`) | `toggleBookmarkAction` server action |
| Resume point | `listProgress(kind)` → where `media_type = any(video|read types)` | `upsertProgress` (`on conflict (user, media_ref) do update`) | `recordProgressAction` server action |
| History | `listHistory` | `recordHistory` (`on conflict ... do update viewed_at`) | inside `recordProgressAction` |

**Post-response write on episode/chapter pages** (`src/app/media/[type]/[slug]/
{episodes,chapters}/[…Slug]/page.tsx`): on the server, after resolving content,
if `getUserId()` is set, `after(Promise.all([upsertProgress, recordHistory]))`
runs *post-response*. `after()` keeps the serverless instance alive until the
DB work settles (a bare `void` promise could be dropped when the instance
freezes), so resume point + history update without blocking render. Both are
`.catch(()=>{})` — failure is silent, render already shipped.

The same `recordProgressAction` is fired fire-and-forget from the client when a
user switches episode/chapter in `VideoPlayer` / `MangaReader`, so the resume
point tracks what they actually open.

**Homepage continue-rail**: `/api/user/progress` (`force-dynamic`) returns
`{ watch, read }` for the signed-in user (empty arrays when signed out). Split
out of `/` so the homepage stays ISR-static.

**Library rendering**: `library/*` pages are server components that `await
getUserId()`; signed-out → `EmptyState` with a `/login` CTA. They call
`listProgress`/`listBookmarks` directly and pass rows to `ProgressList`
(`src/components/sections/ProgressList.tsx`), which `decodeMediaRef`s each
`mediaRef`, rebuilds the canonical href via `buildCanonicalPath`, and deep-links
to the saved `itemSlug`. `RemoveProgressButton` calls `removeProgressAction`
(server action) which `deleteProgress` + `revalidatePath('/')` and
`revalidatePath('/library')`. Detail-page bookmark toggle uses `toggleBookmarkAction`.

## 9. Sitemap + SEO posture

**Sitemap** (`src/app/sitemap.ts`, `revalidate = 300`): built from `siteUrl()`
(origin) plus:
- static routes table (home, `/discover*`, `/popular`, `/latest`, `/genres`, `/studios`) with per-route priority/changeFrequency
- genre pages `/genres/<slug>` and studio pages `/studios/<slug>`
- media: `getMedia(undefined, 1, 1000)`, deduped by slug, each mapped to
  `${baseUrl}${buildCanonicalPath(decodeMediaRef(item.slug))}`, priority 0.8,
  `safeDate` falls back when `updatedAt`/`createdAt` absent or epoch zero.
- All upstream fetches `.catch(()=>[])` so a media-API outage yields a slim sitemap, not a 500.
- Episode/chapter URLs are intentionally **excluded** (no `…/episodes/<slug>` entries) — they're noindex and churn per release.

**Robots** (`src/app/robots.ts`): `allow: '/'`; `disallow: /api, /library,
/profile, /notifications, /login, /search`; `sitemap: <origin>/sitemap.xml`.

**Noindex / canonical** (`Metadata` per route):
- Episode & chapter pages: `robots: { index:false, follow:true }` (`…/[episodeSlug]/page.tsx:13`, `…/[chapterSlug]/page.tsx:12`).
- Library hub + `watch-progress`/`reading-progress`/etc.: `robots: { index:false, follow:false }` (`library/page.tsx:7`).
- Detail page emits `alternates.canonical = buildCanonicalPath(ref)` and JSON-LD with the same canonical (`…/[slug]/page.tsx:39,47,52`).

Net: only stable, link-worthy shells (detail, discover, genres, studios, home) are
indexable; playback leaves no crawlable footprint beyond the canonical detail page.

## 10. Health check

`src/app/api/health/route.ts` (`force-dynamic`): always `200`, payload
`{ ok:true, upstream: 'up'|'down'|'unconfigured', ts }`. If
`JAWATCH_MEDIA_API_URL` is set, it issues a `HEAD` with a 2.5s `AbortController`
timeout, `cache:'no-store'`; `upstream` = `'up'` when `r.ok || r.status < 500`,
`'down'` on non-2xx/5xx or fetch error, `'unconfigured'` when the var is unset.
Crawlers/monitors read this; it never reveals secrets or per-route detail.

## 11. Manga reader flow

`src/components/MangaReader.tsx` (`'use client'`): receives `initialPages`
(server-fetched on the chapter page) and renders each page as a **raw `<img>`**
pointing directly at the upstream media URL — deliberately NOT `next/image`,
which would route every page through Vercel's image optimizer (more compute,
opposite of the cost goal). `referrerPolicy="no-referrer"`, first 3 images
`eager`, rest `lazy`.

```text
Chapter SSR page → getChapterPages(slug, chapterSlug) → initialPages
  → MangaReader renders <img src={page.url}>  (img hotlinked off-Vercel to upstream)
switchChapter(idx):
  → getChapterPagesClient(slug, ch.slug)        (client fetch /api/media/.../chapters/.../pages)
  → setPages + recordProgressAction(...)        (fire-and-forget resume write)
  → preload next chapter's pages (warm cache)
reader controls: fit mode (width/screen/medium, persisted in localStorage),
  scroll % progress bar (rAF-throttled), auto-advance via IntersectionObserver
  on the end sentinel, prev/next + chapter dropdown.
```

`getChapterPagesClient` (`src/lib/client-media.ts`) hits
`/api/media/<slug>/chapters/<chapterSlug>/pages`; the page images themselves
egress directly from the upstream media API to the browser (not proxied through
Vercel's optimizer). No provider name appears in the component — the source is
referred to generically as the upstream media API.

## 12. Env contract (additions)

| Var | Purpose |
|-----|---------|
| `JAWATCH_MEDIA_API_URL` | upstream base (server-only) |
| `JAWATCH_MEDIA_API_TIMEOUT_MS` | fetch timeout (default 8000) |
| `NEXT_PUBLIC_SITE_URL` | canonical/sitemap origin |

No secrets in client bundle. Auth/DB vars server-only.
