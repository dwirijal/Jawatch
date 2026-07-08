# Jawatch Decoupling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `jawatch` standalone inside `the repo root` by removing private backend/auth/docs coupling.

**Architecture:** Keep one public media adapter: Sanka. Delete private proxy/auth paths instead of replacing them. Unsupported private-only surfaces return empty/null so pages keep rendering empty states.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.8, Bun 1.3, Vitest.

## Global Constraints

- Scope only `the repo root`.
- Do not edit sibling repos.
- Do not change git history.
- Do not add dependencies.
- Remove tracked refs to `private workspace`, `private backend A`, `private backend B`, `legacy private API`.
- Remove runtime use of `legacy public API env`, `legacy adapter toggle env`, `database connection env`, `auth env prefix`.
- Keep `NEXT_PUBLIC_SANKA_API_URL` and `NEXT_PUBLIC_SANKA_TIMEOUT_MS`.

---

## File Structure

- Modify `src/lib/api.ts`: Sanka-only adapter; delete proxy helpers/fallbacks.
- Delete `src/middleware.ts`: removes backend NSFW/auth gate.
- Delete `src/lib/auth.ts`: removes Better Auth + Postgres dependency.
- Modify `src/__tests__/api.test.ts`: Sanka-only behavior tests.
- Modify `package.json` and `bun.lock`: remove unused auth/db deps.
- Modify `.env.example`, `vercel.json`, `AGENT.md`, `README.md`: standalone config/docs.

---

### Task 1: Lock Sanka-only API behavior in tests

**Files:**
- Modify: `src/__tests__/api.test.ts`

**Interfaces:**
- Consumes: exported functions from `@/lib/api`.
- Produces: failing tests that require no proxy env/fallback behavior.

- [ ] **Step 1: Replace env setup**

Use this env block at top of `src/__tests__/api.test.ts`:

```ts
const originalEnv = {
  NEXT_PUBLIC_SANKA_API_URL: process.env.NEXT_PUBLIC_SANKA_API_URL,
  NEXT_PUBLIC_SANKA_TIMEOUT_MS: process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS,
};
```

Use this `beforeEach` body:

```ts
beforeEach(() => {
  vi.restoreAllMocks();
  delete process.env.legacy public API env;
  delete process.env.legacy adapter toggle env;
  process.env.NEXT_PUBLIC_SANKA_API_URL = 'https://www.sankavollerei.web.id';
  process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS = '1';
});
```

Use this `afterAll` body:

```ts
afterAll(() => {
  process.env.NEXT_PUBLIC_SANKA_API_URL = originalEnv.NEXT_PUBLIC_SANKA_API_URL;
  process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS = originalEnv.NEXT_PUBLIC_SANKA_TIMEOUT_MS;
  delete process.env.legacy public API env;
  delete process.env.legacy adapter toggle env;
});
```

- [ ] **Step 2: Delete proxy-mode tests**

Remove the whole `describe('proxy mode', ...)` block.

- [ ] **Step 3: Update Sanka tests**

Remove every `process.env.legacy adapter toggle env = '1';` line.

Change tests that expected proxy calls:

```ts
it('returns empty media page on Sanka timeout', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
  setFetchMock(fetchMock);
  const { getMedia } = await loadApi();

  const result = await getMedia('anime', 1, 10);

  expect(result).toEqual({ data: [], total: 0, hasMore: false });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
```

```ts
it('keeps popular Sanka fetch single-source', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify({ status: 'success', mangaList: [] }),
  });
  setFetchMock(fetchMock);
  const { getPopular } = await loadApi();

  await expect(getPopular(10)).resolves.toEqual([]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toContain('/comic/mangasusuku/popular');
});
```

```ts
it('maps anime and comic genre items without private extras', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { animeList: [{ animeId: 'a', title: 'Anime A', poster: 'https://img/a.jpg' }] } }) })
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ comics: [{ title: 'Comic A', link: 'https://x/comic-a/', image: 'https://img/c.jpg' }] }) });
  setFetchMock(fetchMock);
  const { getMediaByGenre } = await loadApi();

  const result = await getMediaByGenre('action');

  expect(result.map((item) => item.slug)).toEqual(['anime~anime~a', 'comic~generic~comic-a']);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
```

```ts
it('searches Sanka only', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { animeList: [] } }) })
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true, seriesList: [] }) });
  setFetchMock(fetchMock);
  const { searchMedia } = await loadApi();

  await expect(searchMedia('one piece', 20)).resolves.toEqual({ data: [], total: 0 });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[0][0]).toContain('/anime/search/one%20piece');
  expect(fetchMock.mock.calls[1][0]).toContain('/comic/komikstation/search/one%20piece/1');
});
```

- [ ] **Step 4: Run tests to verify RED**

Run:

```bash
bun test src/__tests__/api.test.ts
```

Expected: FAIL. Failures mention old proxy fallback calls or old env branches.

---

### Task 2: Make `src/lib/api.ts` Sanka-only

**Files:**
- Modify: `src/lib/api.ts`

**Interfaces:**
- Consumes: Sanka HTTP endpoints via `fetchSankaJson(path: string)`.
- Produces: same exported API function names: `getMedia`, `getTrending`, `getPopular`, `getLatest`, `getRandom`, `getMediaBySlug`, `getGenres`, `getMediaByGenre`, `getStudios`, `getMediaByStudio`, `getAuthors`, `getMediaByAuthor`, `getMediaRelated`, `getMediaReviews`, `getMediaComments`, `getEpisodes`, `getEpisodeSources`, `getChapters`, `getChapterPages`, `searchMedia`.

- [ ] **Step 1: Remove private env constants**

Replace top constants with:

```ts
const SANKA_API_BASE = process.env.NEXT_PUBLIC_SANKA_API_URL || 'https://www.sankavollerei.web.id';
const SANKA_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS || 8000);
const EMPTY_DATE = '1970-01-01T00:00:00.000Z';
```

- [ ] **Step 2: Delete proxy helpers**

Delete these functions from `src/lib/api.ts`:

```ts
proxyReq
proxyGetMedia
proxyGetTrending
proxyGetPopular
proxyGetLatest
proxyGetRandom
proxyGetMediaBySlug
proxyGetGenres
proxyGetMediaByGenre
proxyGetStudios
proxyGetMediaByStudio
proxyGetAuthors
proxyGetMediaByAuthor
proxyGetMediaRelated
proxyGetMediaReviews
proxyGetMediaComments
proxyGetEpisodes
proxyGetEpisodeSources
proxyGetChapters
proxyGetChapterPages
proxySearchMedia
useSankaOrProxy
proxySupplementTypes
```

- [ ] **Step 3: Add tiny safe helper**

Add after `getSankaMediaByType`:

```ts
function emptyMediaPage(): { data: Media[]; total: number; hasMore: boolean } {
  return { data: [], total: 0, hasMore: false };
}
```

- [ ] **Step 4: Replace exported aggregate functions**

Use these function bodies:

```ts
export async function getMedia(type?: string, page?: number, limit?: number): Promise<{ data: Media[]; total: number; hasMore: boolean }> {
  try {
    const size = limit || 20;

    if (type) {
      const data = await getSankaMediaByType(type as MediaType, size);
      return { data, total: data.length, hasMore: data.length === size };
    }

    const perTypeLimit = Math.max(1, Math.ceil(size / 3));
    const [anime, donghua, comic] = await Promise.all([
      getSankaMediaByType('anime', perTypeLimit),
      getSankaMediaByType('donghua', perTypeLimit),
      getSankaMediaByType('comic', perTypeLimit),
    ]);

    const data = [...anime, ...donghua, ...comic].slice(0, size);
    return { data, total: data.length, hasMore: data.length === size };
  } catch (error) {
    if (error instanceof SankaTimeoutError) return emptyMediaPage();
    throw error;
  }
}

export async function getTrending(type?: string, limit?: number): Promise<Media[]> {
  const { data } = await getMedia(type, 1, limit || 20);
  return data;
}

export async function getPopular(limit?: number): Promise<Media[]> {
  const body = unwrapSanka('/comic/mangasusuku/popular', await fetchSankaJson('/comic/mangasusuku/popular'));
  return (Array.isArray(body.mangaList) ? body.mangaList : []).map((item: any) => {
    const slug = String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return mapComicListItem({ ...item, slug }, 'mangasusuku');
  }).slice(0, limit || 20);
}

export async function getLatest(type?: string, limit?: number): Promise<Media[]> {
  if (type === 'comic') {
    const body = unwrapSanka('/comic/mangasusuku/latest', await fetchSankaJson('/comic/mangasusuku/latest'));
    return (Array.isArray(body.mangaList) ? body.mangaList : []).map((item: any) => {
      const slug = String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return mapComicListItem({ ...item, slug }, 'mangasusuku');
    }).slice(0, limit || 20);
  }

  if (type === 'donghua') {
    const body = unwrapSanka('/anime/donghub/latest', await fetchSankaJson('/anime/donghub/latest'));
    const list = Array.isArray(body.data) ? body.data : Array.isArray(body.latest_release) ? body.latest_release : [];
    return list.map((item: any) => ({
      ...baseMedia('donghua', encodeSankaSlug('donghua', 'donghub', item.slug), item.title, item.poster),
      status: item.status,
    })).slice(0, limit || 20);
  }

  const { data } = await getMedia(type, 1, limit || 20);
  return data;
}

export async function getRandom(): Promise<Media | null> {
  const { data } = await getMedia(undefined, 1, 24);
  if (data.length === 0) return null;
  return data[Math.floor(Math.random() * data.length)] || null;
}
```

- [ ] **Step 5: Replace detail/metadata functions**

Use these bodies:

```ts
export async function getMediaBySlug(slug: string): Promise<Media | null> {
  const ref = decodeSankaSlug(slug);
  if (!ref) return null;

  if (ref.type === 'anime') return mapAnimeDetail(ref, await fetchSankaJson(`/anime/anime/${ref.slug}`));
  if (ref.type === 'donghua') return mapDonghuaDetail(ref, await fetchSankaJson(`/anime/donghub/detail/${ref.slug}`));

  if (ref.type === 'comic') {
    if (ref.provider === 'komikstation') return mapComicDetail(ref, await fetchSankaJson(`/comic/komikstation/manga/${ref.slug}`));
    if (ref.provider === 'generic') return mapComicDetail(ref, await fetchSankaJson(`/comic/comic/${ref.slug}`));
    if (ref.provider === 'mangasusuku') return mapComicDetail(ref, await fetchSankaJson(`/comic/mangasusuku/detail/${ref.slug}`));
  }

  return null;
}

export async function getGenres(): Promise<{ slug: string; name: string }[]> {
  const [animeBody, comicBody] = await Promise.all([
    unwrapSanka('/anime/genre', await fetchSankaJson('/anime/genre')),
    fetchSankaJson('/comic/genres'),
  ]);

  const genres = new Map<string, { slug: string; name: string }>();
  mapGenres(animeBody.data?.genreList).forEach((genre) => genres.set(genre.slug, genre));

  Object.values(comicBody || {}).forEach((item: any) => {
    const slug = String(item?.value || '').trim();
    const name = String(item?.name || '').trim();
    if (slug && name && !genres.has(slug)) genres.set(slug, { slug, name });
  });

  return Array.from(genres.values());
}

export async function getMediaByGenre(slug: string): Promise<Media[]> {
  const [animeBody, comicBody] = await Promise.all([
    fetchSankaJson(`/anime/genre/${slug}`),
    fetchSankaJson(`/comic/genre/${slug}`),
  ]);

  const animeData = unwrapSanka(`/anime/genre/${slug}`, animeBody).data;
  const animeItems = (Array.isArray(animeData?.animeList) ? animeData.animeList : []).map(mapAnimeGenreItem);
  const comicItems = (Array.isArray(comicBody?.comics) ? comicBody.comics : []).map(mapComicGenreItem);

  return [...animeItems, ...comicItems];
}

export async function getStudios(): Promise<{ slug: string; name: string }[]> { return []; }
export async function getMediaByStudio(slug: string): Promise<Media[]> { return []; }
export async function getAuthors(): Promise<{ slug: string; name: string }[]> { return []; }
export async function getMediaByAuthor(slug: string): Promise<Media[]> { return []; }
export async function getMediaRelated(slug: string): Promise<Media[]> { return []; }
export async function getMediaReviews(slug: string): Promise<any[]> { return []; }
export async function getMediaComments(slug: string): Promise<any[]> { return []; }
```

- [ ] **Step 6: Replace episode/chapter/search functions**

Keep existing Sanka mapping branches, but replace all fallback calls with empty values:

```ts
return [];
```

Specifically:
- `getEpisodes`: `if (!ref) return [];`, final fallback `return [];`
- `getEpisodeSources`: `if (!ref) return [];`, final fallback `return [];`
- `getChapters`: `if (!ref) return [];`, `if (ref.type !== 'comic') return [];`, final fallback `return [];`
- `getChapterPages`: `if (!ref) return [];`, `if (ref.type !== 'comic') return [];`, final fallback `return [];`

Replace `searchMedia` with:

```ts
export async function searchMedia(query: string, limit?: number): Promise<{ data: Media[]; total: number }> {
  const encoded = encodeURIComponent(query);
  const [animeBody, comicBody] = await Promise.all([
    fetchSankaJson(`/anime/search/${encoded}`),
    fetchSankaJson(`/comic/komikstation/search/${encoded}/1`),
  ]);

  const anime = (Array.isArray(animeBody?.data?.animeList) ? animeBody.data.animeList : []).map(mapAnimeListItem);
  const comic = (Array.isArray(comicBody?.seriesList) ? comicBody.seriesList : []).map((item: any) => mapComicListItem(item, 'komikstation'));
  const data = [...anime, ...comic].slice(0, limit || 20);

  return { data, total: data.length };
}
```

- [ ] **Step 7: Run API tests to verify GREEN**

Run:

```bash
bun test src/__tests__/api.test.ts
```

Expected: PASS.

---

### Task 3: Remove private auth/backend config

**Files:**
- Delete: `src/middleware.ts`
- Delete: `src/lib/auth.ts`
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `.env.example`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: no private backend/auth env.
- Produces: standalone Sanka env config only.

- [ ] **Step 1: Delete middleware and auth files**

Run:

```bash
rm src/middleware.ts src/lib/auth.ts
```

Expected: files removed.

- [ ] **Step 2: Remove unused auth/db dependencies**

Run:

```bash
bun remove better-auth pg @types/pg
```

Expected: `package.json` no longer contains `better-auth`, `pg`, `@types/pg`; `bun.lock` updated.

- [ ] **Step 3: Replace `.env.example`**

Use this exact file content:

```dotenv
# jawatch env
NEXT_PUBLIC_SANKA_API_URL=https://www.sankavollerei.web.id
NEXT_PUBLIC_SANKA_TIMEOUT_MS=8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 4: Replace `vercel.json` env block**

Use this exact file content:

```json
{
  "framework": "nextjs",
  "regions": [
    "sin1"
  ],
  "installCommand": "bun install --frozen-lockfile",
  "env": {
    "NEXT_PUBLIC_SANKA_API_URL": "https://www.sankavollerei.web.id",
    "NEXT_PUBLIC_SANKA_TIMEOUT_MS": "8000"
  }
}
```

- [ ] **Step 5: Run tests/type check**

Run:

```bash
bun test src/__tests__/api.test.ts
bunx tsc --noEmit
```

Expected: both PASS.

---

### Task 4: Purge docs and final references

**Files:**
- Modify: `AGENT.md`
- Modify: `README.md`
- Modify: any tracked file found by grep except the spec/plan files that document the removal request.

**Interfaces:**
- Consumes: current standalone app docs.
- Produces: docs with no private project/backend names.

- [ ] **Step 1: Replace `README.md`**

Use this exact file content:

```md
# Jawatch

Standalone Next.js media frontend backed by the public Sanka API.

## Env

```dotenv
NEXT_PUBLIC_SANKA_API_URL=https://www.sankavollerei.web.id
NEXT_PUBLIC_SANKA_TIMEOUT_MS=8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See `.env.example`.

## Routes

```text
/                  home
/discover          catalog browse
/latest            latest releases
/search?q=         search results
/media/[slug]      media detail
/watch/[slug]/[ep] video player
/read/[slug]/[ch]  reader
/sitemap.xml       public sitemap
```

## Run

```bash
cp .env.example .env.local
bun install
bun dev
bun test
bun build
```
```

- [ ] **Step 2: Replace `AGENT.md`**

Use this exact file content:

```md
# AI Agent Guidelines — Jawatch

## Purpose

- **Description**: Standalone cinematic media streaming and reading frontend.
- **Use Case**: Consumes the public Sanka API to render anime, manga/comic, and donghua content.
- **Core Logic**: Next.js 15 App Router, React 19, server-side data fetching with ISR, responsive mobile-first layout.

## Architecture

```text
Sanka API → jawatch (Next.js SSR + ISR) → user browser
```

## Content Types

- `anime` — watch content
- `donghua` — watch content
- `comic` — read content

Unsupported private-only types should render empty states instead of reaching a private backend.

## Routes

- `/` — homepage
- `/discover` — catalog browse
- `/latest` — latest releases
- `/search?q=` — search results
- `/media/[slug]` — media detail
- `/watch/[slug]/[episode]` — video player
- `/read/[slug]/[chapter]` — reader

## API Client

- File: `src/lib/api.ts`
- Base URL: `NEXT_PUBLIC_SANKA_API_URL`, default `https://www.sankavollerei.web.id`
- Timeout: `NEXT_PUBLIC_SANKA_TIMEOUT_MS`, default `8000`

## Local Commands

- Dev: `bun dev`
- Build: `bun build`
- Start: `bun start`
- Test: `bun test`

## Rules

- Stay inside this repo.
- Do not add private backend, auth, database, or sibling-repo coupling.
- No hardcoded secrets.
- Keep async route failures visible or mapped to explicit empty states.
```

- [ ] **Step 3: Final grep**

Run:

```bash
git grep -n -E 'private workspace|private backend A|private backend B|legacy private API|legacy public API env|legacy adapter toggle env|database connection env|auth env prefix' -- ':!docs/superpowers/specs/2026-07-06-jawatch-decoupling-design.md' ':!docs/superpowers/plans/2026-07-06-jawatch-decoupling.md'
```

Expected: no output.

- [ ] **Step 4: Full verification**

Run:

```bash
bun test
bunx tsc --noEmit
bun build
```

Expected: all PASS.

- [ ] **Step 5: Review diff**

Run:

```bash
git diff --stat
git diff -- src/lib/api.ts src/__tests__/api.test.ts .env.example vercel.json README.md AGENT.md package.json
```

Expected: only files in this repo changed; no private backend refs remain.

---

## Self-Review

- Spec coverage: runtime API purge Task 2; auth/config purge Task 3; docs purge Task 4; verification Task 4.
- Placeholder scan: no TBD/TODO/fill-later steps.
- Type consistency: exported API names unchanged; unsupported private-only routes return `[]` or `null`.
