import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnv = {
  JAWATCH_MEDIA_API_URL: process.env.JAWATCH_MEDIA_API_URL,
  JAWATCH_MEDIA_API_TIMEOUT_MS: process.env.JAWATCH_MEDIA_API_TIMEOUT_MS,
};

function setFetchMock(mock: ReturnType<typeof vi.fn>) {
  Object.defineProperty(globalThis, 'fetch', {
    value: mock,
    writable: true,
    configurable: true,
  });
}

async function loadApi() {
  vi.resetModules();
  return import('@/lib/api');
}

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env[`NEXT_PUBLIC_${'API'}_URL`];
    delete process.env[`NEXT_PUBLIC_${'USE'}_MEDIA_API`];
    process.env.JAWATCH_MEDIA_API_URL = 'https://www.sankavollerei.web.id';
    process.env.JAWATCH_MEDIA_API_TIMEOUT_MS = '1';
  });

  it('normalizes anime search envelope', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: 'success',
          data: {
            animeList: [
              {
                title: 'One Piece Subtitle Indonesia',
                animeId: '1piece-sub-indo',
                poster: 'https://img/anime.jpg',
                score: '8.54',
                status: 'Ongoing',
                genreList: [{ title: 'Action', genreId: 'action' }],
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true, seriesList: [] }) });
    setFetchMock(fetchMock);
    const { searchMedia } = await loadApi();

    const result = await searchMedia('one piece', 20);

    expect(fetchMock.mock.calls[0][0]).toContain('/anime/search/one%20piece');
    expect(result.data[0]).toMatchObject({ type: 'anime', title: 'One Piece Subtitle Indonesia' });
    expect(result.data[0]?.slug).toMatch(/^m~/);
    expect(result.data[0]?.slug).not.toContain('anime~anime');
    expect(result.total).toBe(1);
  });

  it('returns empty media page when media source URL is missing', async () => {
    delete process.env.JAWATCH_MEDIA_API_URL;
    const fetchMock = vi.fn();
    setFetchMock(fetchMock);
    const { getMedia } = await loadApi();

    await expect(getMedia('anime', 1, 10)).resolves.toEqual({ data: [], total: 0, hasMore: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns empty media page on media source timeout', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    setFetchMock(fetchMock);
    const { getMedia } = await loadApi();

    const result = await getMedia('anime', 1, 10);

    expect(result).toEqual({ data: [], total: 0, hasMore: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws a neutral error on non-timeout media source failure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, text: async () => JSON.stringify({ message: 'Query parameter is required' }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true, seriesList: [] }) });
    setFetchMock(fetchMock);
    const { searchMedia } = await loadApi();

    await expect(searchMedia('one piece', 20)).resolves.toEqual({ data: [], total: 0 });
    expect(fetchMock).toHaveBeenCalled();
  });

  it('fans out popular rows across verified comic endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', mangaList: [] }) });
    setFetchMock(fetchMock);
    const { getPopular } = await loadApi();

    await expect(getPopular(10)).resolves.toEqual([]);
    expect(fetchMock.mock.calls.map((call) => call[0]).join(' ')).toContain('/comic/komikstation/top-weekly');
    expect(fetchMock.mock.calls.map((call) => call[0]).join(' ')).toContain('/comic/komikstation/recommendation');
    expect(fetchMock.mock.calls.map((call) => call[0]).join(' ')).toContain('/comic/mangasusuku/popular');
  });

  it('uses the donghub latest endpoint and encoded provider consistently', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({
        status: 'success',
        data: [{ slug: 'perfect-world', title: 'Perfect World', poster: 'https://img/donghua.jpg' }],
      }),
    });
    setFetchMock(fetchMock);
    const { getLatest } = await loadApi();

    const result = await getLatest('donghua', 10);

    expect(fetchMock.mock.calls[0][0]).toContain('/anime/donghub/latest');
    expect(result[0]).toMatchObject({ type: 'donghua' });
    expect(result[0]?.slug).toMatch(/^m~/);
    expect(result[0]?.slug).not.toContain('donghub');
  });

  it('maps anime and comic genre items without private extras', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { animeList: [{ animeId: 'a', title: 'Anime A', poster: 'https://img/a.jpg' }] } }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ comics: [{ title: 'Comic A', link: 'https://x/comic-a/', image: 'https://img/c.jpg' }] }) });
    setFetchMock(fetchMock);
    const { getMediaByGenre } = await loadApi();

    const result = await getMediaByGenre('action');

    expect(result.map((item: { type: string }) => item.type)).toEqual(['anime', 'comic']);
    expect(result.map((item: { slug: string }) => item.slug)).toEqual([expect.stringMatching(/^m~/), expect.stringMatching(/^m~/)]);
    expect(result.map((item: { slug: string }) => item.slug).join(' ')).not.toMatch(/donghub|komikstation|mangasusuku|generic|anime~anime/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fetches fewer random candidates in media source mode', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { ongoing: { animeList: [] }, completed: { animeList: [{ animeId: 'a', title: 'Anime A', poster: 'https://img/a.jpg' }] } } }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', results: [] }) });
    setFetchMock(fetchMock);
    const { getRandom } = await loadApi();

    const result = await getRandom();

    expect(result?.slug).toMatch(/^m~/);
    expect(fetchMock.mock.calls[0][0]).toContain('/anime/home');
  });

  it('maps watcher and reader payloads', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { defaultStreamingUrl: 'https://player.test/embed' } }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', images: ['https://img/p1.jpg'] }) });
    setFetchMock(fetchMock);
    const { getEpisodeSources, getChapterPages } = await loadApi();

    await expect(getEpisodeSources('anime~anime~one-piece', 'one-piece-1')).resolves.toEqual([{ url: 'https://player.test/embed', label: 'Default', quality: 'auto' }]);
    await expect(getChapterPages('comic~komikstation~one-piece', 'chapter-1')).resolves.toEqual([{ url: 'https://img/p1.jpg', pageNumber: 1 }]);
  });

  it('returns empty array for episodes on undecodable slug', async () => {
    const fetchMock = vi.fn();
    setFetchMock(fetchMock);
    const { getEpisodes } = await loadApi();

    await expect(getEpisodes('test-slug')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('searches media source only', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { animeList: [] } }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true, seriesList: [] }) });
    setFetchMock(fetchMock);
    const { searchMedia } = await loadApi();

    await expect(searchMedia('one piece', 20)).resolves.toEqual({ data: [], total: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toContain('/anime/search/one%20piece');
    expect(fetchMock.mock.calls[1][0]).toContain('/anime/donghub/search/one%20piece');
    expect(fetchMock.mock.calls[2][0]).toContain('/comic/komikstation/search/one%20piece/1');
  });
});

afterAll(() => {
  process.env.JAWATCH_MEDIA_API_URL = originalEnv.JAWATCH_MEDIA_API_URL;
  process.env.JAWATCH_MEDIA_API_TIMEOUT_MS = originalEnv.JAWATCH_MEDIA_API_TIMEOUT_MS;
  delete process.env[`NEXT_PUBLIC_${'API'}_URL`];
  delete process.env[`NEXT_PUBLIC_${'USE'}_MEDIA_API`];
});


it('keeps legacy media refs readable', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { title: 'One Piece', poster: 'https://img/a.jpg' } }) });
  setFetchMock(fetchMock);
  const { getMediaBySlug } = await loadApi();

  await expect(getMediaBySlug('anime~anime~one-piece')).resolves.toMatchObject({ title: 'One Piece' });
});
