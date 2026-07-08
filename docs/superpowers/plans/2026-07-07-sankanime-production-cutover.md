# Sankanime Production Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut Jawatch production traffic over to Sanka while keeping the existing app contract stable and shrinking the sitemap to the intended public SEO surface.

**Architecture:** Keep `src/lib/api.ts` as the only Sanka boundary. Make the smallest production diff: remove unsupported sitemap routes, verify the federated search fanout stays spec-correct, then run the existing verification gates.

**Tech Stack:** Next.js App Router, TypeScript, Bun, Vitest.

## Global Constraints

- Use `JAWATCH_MEDIA_API_URL=https://www.sankavollerei.web.id`.
- Keep it server-only. Do not add `NEXT_PUBLIC_*` upstream config.
- Use the existing Jawatch facade in `src/lib/api.ts` as the only Sanka boundary.
- Pages, components, and client helpers should not know raw Sanka endpoints.
- Slug contract stays `m~base64url({ type, provider, slug })`.
- Legacy `type~provider~slug` refs remain readable.
- Primary anime/donghua: aggregate `/anime/*`, `samehadaku`, `donghub`.
- Primary comic: `komikstation`, `mangasusuku`, `komikindo`.
- Keep sitemap minimal and high-signal.
- Include only `/`, `/discover`, `/discover/anime`, `/discover/donghua`, `/discover/comic`, `/popular`, `/latest`, `/genres`, `/genres/[slug]`, bounded `/media/[slug]`.
- Exclude unsupported content types: manga/movie/novel until real Sanka-backed flows exist.
- No full generated OpenAPI SDK.
- No new dependency.
- No custom cache layer.
- Build gates:

```bash
bunx vitest run
bun run build
```

---

## File Structure

- Modify `src/app/sitemap.ts`: remove unsupported static routes; keep one sitemap function, one static route list, one media limit constant.
- Verify `src/lib/api.ts`: keep `searchMedia()` fanout spec-correct; samehadaku must stay query-style while aggregate/animasu stay path-style.
- Modify `src/__tests__/seo.test.ts`: lock the sitemap surface so unsupported static routes stay out.
- Reuse `src/__tests__/api.test.ts`: existing search assertions already pin the 7-call search fanout and URL format.

---

### Task 1: Lock the sitemap to supported SEO routes only

**Files:**
- Modify: `src/__tests__/seo.test.ts`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `sitemap()` from `src/app/sitemap.ts`, mocked `getGenres()` and `getMedia()` from `@/lib/api`.
- Produces: sitemap entries containing `/discover/anime`, `/discover/donghua`, `/discover/comic`, `/popular`, `/latest`, `/genres`, genre URLs, media URLs; no `/discover/manga`, `/discover/movie`, `/discover/novel`, `/trending`.

- [ ] **Step 1: Write the failing sitemap assertion**

Add or update a test in `src/__tests__/seo.test.ts` to assert the exact unsupported routes are absent:

```ts
it('builds a public-only sitemap with supported discovery routes only', async () => {
  vi.mocked(api.getGenres).mockResolvedValue([]);
  vi.mocked(api.getMedia).mockResolvedValue({
    data: [],
    total: 0,
    hasMore: false,
  });

  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);

  expect(urls).toContain('https://jawatch.example/discover/anime');
  expect(urls).toContain('https://jawatch.example/discover/donghua');
  expect(urls).toContain('https://jawatch.example/discover/comic');
  expect(urls).toContain('https://jawatch.example/popular');
  expect(urls).toContain('https://jawatch.example/latest');
  expect(urls).toContain('https://jawatch.example/genres');

  expect(urls).not.toContain('https://jawatch.example/discover/manga');
  expect(urls).not.toContain('https://jawatch.example/discover/movie');
  expect(urls).not.toContain('https://jawatch.example/discover/novel');
  expect(urls).not.toContain('https://jawatch.example/trending');
});
```

- [ ] **Step 2: Run the focused SEO test to verify RED**

Run:

```bash
bunx vitest run src/__tests__/seo.test.ts
```

Expected: FAIL because `src/app/sitemap.ts` still includes unsupported static routes.

- [ ] **Step 3: Remove the unsupported static routes**

Edit `src/app/sitemap.ts` `staticRoutes` to this exact list:

```ts
const staticRoutes = [
  { path: '', priority: 1, changeFrequency: 'daily' as const },
  { path: '/discover', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/discover/anime', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/donghua', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/comic', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/popular', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/latest', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/genres', priority: 0.5, changeFrequency: 'weekly' as const },
];
```

- [ ] **Step 4: Run the focused SEO test to verify GREEN**

Run:

```bash
bunx vitest run src/__tests__/seo.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/app/sitemap.ts src/__tests__/seo.test.ts
git commit -m "test: lock supported sitemap routes"
```

---

### Task 2: Keep federated search endpoints spec-correct

**Files:**
- Verify: `src/lib/api.ts`
- Verify: `src/__tests__/api.test.ts`
- Modify only if verification fails: `src/lib/api.ts`

**Interfaces:**
- Consumes: `searchMedia(query: string, limit?: number): Promise<{ data: Media[]; total: number }>`.
- Produces: 7-source search fanout with these URL shapes:
  - aggregate: `/anime/search/${encoded}`
  - samehadaku: `/anime/samehadaku/search?q=${encoded}`
  - animasu: `/anime/animasu/search/${encoded}`
  - donghub: `/anime/donghub/search/${encoded}`
  - komikstation: `/comic/komikstation/search/${encoded}/1`
  - kiryuu: `/comic/kiryuu/search/${encoded}/1`
  - komikindo: `/comic/komikindo/search/${encoded}/1`

- [ ] **Step 1: Keep the failing-proof test in view**

Use the existing assertions in `src/__tests__/api.test.ts` as the contract:

```ts
it('searches media source only', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValue({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) });
  setFetchMock(fetchMock);
  const { searchMedia } = await loadApi();

  await expect(searchMedia('one piece', 20)).resolves.toEqual({ data: [], total: 0 });
  expect(fetchMock).toHaveBeenCalledTimes(7);
  expect(fetchMock.mock.calls[0][0]).toContain('/anime/search/one%20piece');
  expect(fetchMock.mock.calls[1][0]).toContain('/anime/samehadaku/search?q=one%20piece');
  expect(fetchMock.mock.calls[2][0]).toContain('/anime/animasu/search/one%20piece');
});
```

- [ ] **Step 2: Run the focused API test to verify current behavior**

Run:

```bash
bunx vitest run src/__tests__/api.test.ts -t "searches media source only"
```

Expected: PASS if the current implementation already matches the approved design.

- [ ] **Step 3: Only if the test fails, replace `searchMedia()` with this minimal body**

```ts
export async function searchMedia(query: string, limit?: number): Promise<{ data: Media[]; total: number }> {
  const encoded = encodeURIComponent(query);
  const [
    otakudesuBody,
    samehadakuBody,
    animasuBody,
    donghuaBody,
    komikstationBody,
    kiryuuBody,
    komikindoBody,
  ] = await Promise.all([
    safeSearchSource(fetchUpstreamJson(`/anime/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/anime/samehadaku/search?q=${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/anime/animasu/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/anime/donghub/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/comic/komikstation/search/${encoded}/1`)),
    safeSearchSource(fetchUpstreamJson(`/comic/kiryuu/search/${encoded}/1`)),
    safeSearchSource(fetchUpstreamJson(`/comic/komikindo/search/${encoded}/1`)),
  ]);

  const animeOtakudesu = otakudesuBody
    ? firstArray(otakudesuBody?.data?.animeList, otakudesuBody?.animeList, otakudesuBody?.data).map((item) => mapAnimeListItem(item, 'anime'))
    : [];

  const animeSamehadaku = samehadakuBody
    ? firstArray(samehadakuBody?.data?.animeList, samehadakuBody?.animeList, samehadakuBody?.data).map((item) => mapAnimeListItem(item, 'samehadaku'))
    : [];

  const animeAnimasu = animasuBody
    ? firstArray(animasuBody?.animes, animasuBody?.data?.animeList, animasuBody?.animeList, animasuBody?.data, animasuBody?.results).map((item) => mapAnimeListItem(item, 'animasu'))
    : [];

  const donghua = donghuaBody
    ? firstArray(donghuaBody?.data, donghuaBody?.results, donghuaBody?.animeList).map(mapDonghuaListItem)
    : [];

  const comicKomikstation = komikstationBody
    ? firstArray(komikstationBody?.seriesList, komikstationBody?.results, komikstationBody?.data).map((item) => mapComicListItem(item, 'komikstation'))
    : [];

  const comicKiryuu = kiryuuBody
    ? firstArray(kiryuuBody?.seriesList, kiryuuBody?.results, kiryuuBody?.mangaList, kiryuuBody?.data).map((item) => mapComicListItem(item, 'kiryuu'))
    : [];

  const comicKomikindo = komikindoBody
    ? firstArray(komikindoBody?.komikList, komikindoBody?.results, komikindoBody?.data, komikindoBody?.seriesList).map((item) => mapComicListItem(item, 'komikindo'))
    : [];

  const data = [
    ...animeOtakudesu,
    ...animeSamehadaku,
    ...animeAnimasu,
    ...donghua,
    ...comicKomikstation,
    ...comicKiryuu,
    ...comicKomikindo,
  ].slice(0, limit || 20);

  return { data, total: data.length };
}
```

- [ ] **Step 4: Run the full API test file to verify GREEN**

Run:

```bash
bunx vitest run src/__tests__/api.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

If `src/lib/api.ts` changed:

```bash
git add src/lib/api.ts src/__tests__/api.test.ts
git commit -m "fix: keep sanka search endpoints spec correct"
```

If no code changed, skip this commit.

---

### Task 3: Run the production cutover verification gates

**Files:**
- No code changes required unless a gate fails.

**Interfaces:**
- Consumes: current repo state after Tasks 1-2.
- Produces: proof that production cutover changes keep tests and build green.

- [ ] **Step 1: Run the full test suite with the correct runner**

Run:

```bash
bunx vitest run
```

Expected: PASS.

- [ ] **Step 2: Run the production build**

Run:

```bash
bun run build
```

Expected: PASS.

- [ ] **Step 3: Review the final diff**

Run:

```bash
git diff --stat
git diff -- src/app/sitemap.ts src/__tests__/seo.test.ts src/lib/api.ts src/__tests__/api.test.ts
```

Expected: only the intended sitemap and any necessary search contract changes appear.

- [ ] **Step 4: Commit Task 3**

```bash
git add -A
git commit -m "fix: cut production traffic over to sanka"
```

---

## Self-Review

- Spec coverage: sitemap scope handled in Task 1; federated search URL contract handled in Task 2; build gates handled in Task 3.
- Placeholder scan: no TBD/TODO/fill-later steps.
- Type consistency: `searchMedia()` signature unchanged; `sitemap()` still returns `MetadataRoute.Sitemap`; existing facade contract remains intact.
