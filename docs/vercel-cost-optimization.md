# Vercel Cost Optimization — jawatch

> Goal: **hemat resource Vercel tanpa mengorbankan kecepatan load user.**
> Status: VERY LOW consumption. One both-goal change shipped (detail page → ISR).
> Constraints: preview/dev only, no prod deploy without owner approval. No provider/upstream names in UI/errors.

## 1. Baseline — how the app spends Vercel resources

Vercel Hobby limits (2026): ~100 GB bandwidth/mo · Fluid Compute Active-CPU billing (idle upstream waits ≈ free, CPU work billed) · Image Optimization transform caps · 6000 build-min/mo · **non-commercial use only**.

### Cost-driver ranking (audit synthesis)

| Rank | Driver | Tier | Why | Evidence |
|------|--------|------|-----|----------|
| 1 | SSR per-request on 3 media pages | HIGH (at scale) | `getUserId()`→`headers()` opted routes out of caching → 1 invocation + CPU per pageview | `session.ts:6-12`, `media/[type]/[slug]/page.tsx`, `.../episodes/.../page.tsx:49`, `.../chapters/.../page.tsx` |
| 2 | Cold-start provider fan-out (`/api/media`) | MED (cold only) | `resolveCanonicalRef` probes 4–5 candidates in parallel when no `?src` hint | `api.ts:171-190` |
| 3 | Image Optimization on covers | LOW | `next/image` transforms, but `minimumCacheTTL: 2678400` (31d) → bounded, not per-request | `next.config.js:21-35`, `ContentCard.tsx:20` |
| 4 | Bandwidth | VERY LOW | manga pages served as raw `<img>` (off-Vercel, 0 egress); only covers hit Vercel | `MangaReader.tsx:216` |
| 5 | Build / middleware / cron | NONE | no middleware, no cron, light build, upstream fetched at request-time not build-time | `vercel.json`, `package.json` |

**Key finding:** the classic silent Hobby-killer (manga pages via `/_next/image`) is **already avoided by design** — raw `<img>` keeps that volume off Vercel.

### What was already good (kept as-is)

- **Upstream fetches Data-Cached** — `fetchUpstreamJsonOnce` uses `next: { revalidate: 300 }` (`api.ts:368`). One upstream hit per path per 300s across all requests.
- **Browse pages ISR** — `/`, `/discover`, `/latest`, `/popular`, `/genres`, `/studios`, `/sitemap` all `export const revalidate = 300`.
- **Cover art immutable cache** — 31-day image TTL.

## 2. What changed — detail page → ISR

The #1 driver was the indexed, highest-traffic route (`/media/[type]/[slug]`) forced to per-request SSR by two dynamic triggers: `getUserId()`→`headers()` and `searchParams.src`. Underlying data was *already* cached; only the per-user bits forced dynamic render.

**Fix: move per-user bits out of the page shell so the shell is cacheable.**

| File | Change |
|------|--------|
| `src/app/media/[type]/[slug]/page.tsx` | `export const revalidate = 300`; removed `getUserId`/`isBookmarked`/`listProgress`, `searchParams.src`, resume-CTA logic; render `<DetailActions>` instead of inline CTA + BookmarkButton |
| `src/components/DetailActions.tsx` (new) | Client component. Renders neutral "Start" CTA + unsaved bookmark in the static shell; on mount fetches signed-in state and upgrades to resume CTA + real bookmark. Progressive enhancement — signed-out/offline keeps the static shell. |
| `src/app/api/user/library-state/route.ts` (new) | `force-dynamic` GET. Returns `{ bookmarked, resume }` for the signed-in user; neutral payload when signed out. The only dynamic bit — fires client-side only for logged-in users; crawlers & signed-out visitors never call it. |

### Why this serves BOTH goal halves

- **Faster load:** signed-out users and every crawler get a static CDN-cached HTML shell — no server render in the request path, best possible TTFB.
- **Cheaper:** the route no longer invokes a function per pageview. Within each 300s window the full-route cache serves hits with ~0 invocation. Per-user API call is tiny and only for authenticated interactive sessions.

### Why episode/chapter pages were NOT converted

Deliberate. They are `robots: noindex` (no crawler traffic), need fresh playback per request, and use `after()` to record resume server-side. Traffic is a fraction of detail-page traffic, conversion risk is higher, benefit lower. Left dynamic.

### On the `ƒ` build glyph

After the change the route still prints `ƒ` (like every `[param]` route without `generateStaticParams`). The glyph only means "not prerendered at build" — it does **not** mean "renders every request." Runtime cost changed fundamentally:

- **Before:** used `headers()` → opted out of cache → rendered on every request (billed each hit).
- **After:** zero dynamic APIs + `revalidate = 300` → **on-demand ISR**: first visit renders and caches, subsequent visits within 300s served from full-route cache (no invocation).

`generateStaticParams` was intentionally **not** added — it would force build-time upstream fetches (slow/fragile builds; the audit flagged avoiding exactly that). On-demand ISR caches on first real visit with no build-time cost.

## 3. Scaling math — which limit hits first

Assume ~1 MB cover egress per pageview (home-heavy ~2 MB, detail ~0.4 MB).

- **Bandwidth (100 GB/mo)** = first ceiling, at **~1,500–3,500 pageviews/day**. Manga volume is off-Vercel, so only covers count.
- **Function invocations** = second ceiling. Detail-page SSR was 1:1 with pageviews; now near-zero within cache windows. Was a concern in the tens-of-thousands/day range — this change removes it as a near-term risk.
- **Image transformations** = third ceiling. Bounded by unique covers × breakpoints, cached 31d.

## 4. Owner-gated recommendations (NOT implemented — need your call)

1. **Lock `remotePatterns` to an allowlist** (`next.config.js:25-34`) — currently `hostname: '**'`. Prevents anyone using the site's `/_next/image` as an open proxy (unbounded transform/bandwidth abuse) and shrinks SSRF surface. *Not done:* upstream host set changes across providers; needs your confirmation of the allowed hosts to avoid breaking covers.
2. ~~**Homepage `/` ISR**~~ — **DONE** (commit `798d0c4`). ContinueRail moved to client fetch via `/api/user/progress`; `/` now builds as `○ Static` (revalidate 300).
3. **Persist provider ref in Data Cache + thread `?src`** so `resolveCanonicalRef` short-circuits cold fan-out. Lower priority now that detail HTML is cached 300s (fan-out runs ≤once/300s/title).

## 5. ⚠️ ToS caveat — Hobby is non-commercial

The repo has donate + shop links (`CryptoDonate.tsx`, `SupportCTA.tsx`, Saweria). Vercel **Hobby prohibits commercial use** regardless of traffic size. If the site solicits donations/monetizes, it violates Hobby ToS → account risk. Action: upgrade to Pro, or remove monetization on this tier. This is an account/legal risk, not a technical one.

## 6. Verification

- `bunx tsc --noEmit` → **EXIT 0**
- `bun run test:run` → **101/101 pass (15 files)**
- `bun run build` → success; detail route no longer uses dynamic APIs (on-demand ISR)
- No prod deploy performed (owner approval required).
