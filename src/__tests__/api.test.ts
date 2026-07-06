import { beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnv = {
  NEXT_PUBLIC_USE_SANKA: process.env.NEXT_PUBLIC_USE_SANKA,
  NEXT_PUBLIC_SANKA_API_URL: process.env.NEXT_PUBLIC_SANKA_API_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SANKA_TIMEOUT_MS: process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS,
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
    process.env.NEXT_PUBLIC_USE_SANKA = '0';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8484';
    process.env.NEXT_PUBLIC_SANKA_API_URL = 'https://www.sankavollerei.web.id';
    process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS = '1';
  });

  describe('proxy mode', () => {
    it('fetches paginated media with current /v1/jw route', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ slug: 'test', type: 'anime', title: 'Test', createdAt: '', updatedAt: '' }] }),
      });
      setFetchMock(fetchMock);
      const { getMedia } = await loadApi();

      const result = await getMedia();

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8484/v1/jw/media?',
        expect.objectContaining({ headers: { Accept: 'application/json' } })
      );
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('includes query params when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
      setFetchMock(fetchMock);
      const { getMedia } = await loadApi();

      await getMedia('anime', 2, 10);

      const call = fetchMock.mock.calls[0][0];
      expect(call).toContain('/v1/jw/media?');
      expect(call).toContain('type=anime');
      expect(call).toContain('page=2');
      expect(call).toContain('limit=10');
    });

    it('returns empty data on proxy error', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 });
      setFetchMock(fetchMock);
      const { getMedia } = await loadApi();

      const result = await getMedia();
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('preview Sanka mode', () => {
    it('normalizes anime search envelope and keeps proxy extras out when proxy empty', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
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
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true, seriesList: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
      setFetchMock(fetchMock);
      const { searchMedia } = await loadApi();

      const result = await searchMedia('one piece', 20);

      expect(fetchMock.mock.calls[0][0]).toContain('/anime/search/one%20piece');
      expect(result.data[0]).toMatchObject({
        slug: 'anime~anime~1piece-sub-indo',
        type: 'anime',
        title: 'One Piece Subtitle Indonesia',
      });
      expect(result.total).toBe(1);
    });

    it('falls back to proxy on timeout', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
      const fetchMock = vi.fn()
        .mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ slug: 'proxy-item', type: 'anime', title: 'Proxy Item', createdAt: '', updatedAt: '' }] }) });
      setFetchMock(fetchMock);
      const { getMedia } = await loadApi();

      const result = await getMedia('anime', 1, 10);

      expect(result.data[0]?.slug).toBe('proxy-item');
      expect(fetchMock.mock.calls[1][0]).toContain('/v1/jw/media?');
    });

    it('throws visibly on non-timeout Sanka failure', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          text: async () => JSON.stringify({ message: 'Query parameter is required' }),
        })
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true, seriesList: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
      setFetchMock(fetchMock);
      const { searchMedia } = await loadApi();

      await expect(searchMedia('one piece', 20)).rejects.toThrow('Query parameter is required');
    });


    it('keeps popular Sanka and proxy fetches concurrent', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
      const pending: Array<() => void> = [];
      const fetchMock = vi.fn((url: string) => new Promise((resolve) => {
        pending.push(() => resolve(url.includes('mangasusuku')
          ? { ok: true, text: async () => JSON.stringify({ status: 'success', mangaList: [] }) }
          : { ok: true, json: async () => ({ data: [] }) }
        ));
      }));
      setFetchMock(fetchMock);
      const { getPopular } = await loadApi();

      const resultPromise = getPopular(10);
      await Promise.resolve();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      pending.forEach((resolve) => resolve());
      await expect(resultPromise).resolves.toEqual([]);
    });

    it('uses the donghub latest endpoint and encoded provider consistently', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
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
      expect(result[0]).toMatchObject({ slug: 'donghua~donghub~perfect-world', type: 'donghua' });
    });

    it('maps anime and comic genre items without a bogus truthy genre gate', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { animeList: [{ animeId: 'a', title: 'Anime A', poster: 'https://img/a.jpg' }] } }) })
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ comics: [{ title: 'Comic A', link: 'https://x/comic-a/', image: 'https://img/c.jpg' }] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
      setFetchMock(fetchMock);
      const { getMediaByGenre } = await loadApi();

      const result = await getMediaByGenre('action');

      expect(result.map((item) => item.slug)).toEqual(['anime~anime~a', 'comic~generic~comic-a']);
    });

    it('fetches fewer random candidates in Sanka mode', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { ongoing: { animeList: [] }, completed: { animeList: [{ animeId: 'a', title: 'Anime A', poster: 'https://img/a.jpg' }] } } }) })
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) })
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', results: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
      setFetchMock(fetchMock);
      const { getRandom } = await loadApi();

      const result = await getRandom();

      expect(result?.slug).toBe('anime~anime~a');
      expect(fetchMock.mock.calls[0][0]).toContain('/anime/home');
    });

    it('maps Sanka watcher and reader payloads', async () => {
      process.env.NEXT_PUBLIC_USE_SANKA = '1';
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', data: { defaultStreamingUrl: 'https://player.test/embed' } }) })
        .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'success', images: ['https://img/p1.jpg'] }) });
      setFetchMock(fetchMock);
      const { getEpisodeSources, getChapterPages } = await loadApi();

      await expect(getEpisodeSources('anime~anime~one-piece', 'one-piece-1')).resolves.toEqual([{ url: 'https://player.test/embed', label: 'Default', quality: 'auto' }]);
      await expect(getChapterPages('comic~komikstation~one-piece', 'chapter-1')).resolves.toEqual([{ url: 'https://img/p1.jpg', pageNumber: 1 }]);
    });
  });

  describe('error handling', () => {
    it('returns empty array for episodes on proxy network error', async () => {
      const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      setFetchMock(fetchMock);
      const { getEpisodes } = await loadApi();

      const result = await getEpisodes('test-slug');
      expect(result).toEqual([]);
    });
  });
});

afterAll(() => {
  process.env.NEXT_PUBLIC_USE_SANKA = originalEnv.NEXT_PUBLIC_USE_SANKA;
  process.env.NEXT_PUBLIC_SANKA_API_URL = originalEnv.NEXT_PUBLIC_SANKA_API_URL;
  process.env.NEXT_PUBLIC_API_URL = originalEnv.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS = originalEnv.NEXT_PUBLIC_SANKA_TIMEOUT_MS;
});
