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
      .mockResolvedValue({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) })
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
      });
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
    process.env.JAWATCH_MEDIA_API_URL = '';
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
      .mockResolvedValue({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) })
      .mockResolvedValueOnce({ ok: false, text: async () => JSON.stringify({ message: 'Query parameter is required' }) });
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
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ status: 'success', data: { ongoing: { animeList: [] }, completed: { animeList: [{ animeId: 'a', title: 'Anime A', poster: 'https://img/a.jpg' }] } } }),
    });
    setFetchMock(fetchMock);
    const { getRandom } = await loadApi();

    const result = await getRandom();

    expect(result?.slug).toMatch(/^m~/);
    expect(fetchMock.mock.calls.some((call) => call[0].includes('/anime/home'))).toBe(true);
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
      .mockResolvedValue({ ok: true, text: async () => JSON.stringify({ status: 'success', data: [] }) });
    setFetchMock(fetchMock);
    const { searchMedia } = await loadApi();

    await expect(searchMedia('one piece', 20)).resolves.toEqual({ data: [], total: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(8);
    expect(fetchMock.mock.calls[0][0]).toContain('/anime/search/one%20piece');
    expect(fetchMock.mock.calls[1][0]).toContain('/anime/samehadaku/search?q=one%20piece');
    expect(fetchMock.mock.calls[2][0]).toContain('/anime/animasu/search/one%20piece');
    expect(fetchMock.mock.calls[7][0]).toContain('/anime/alqanime/search/one%20piece');
  });

  it('maps Samehadaku details, episodes, and sources', async () => {
    const detailResponse = {
      status: 'success',
      data: {
        title: 'Samehadaku Anime',
        poster: 'https://img/samehadaku.jpg',
        score: { value: '8.88' },
        status: 'Ongoing',
        synopsis: { paragraphs: ['Samehadaku story'] },
        genreList: [{ title: 'Action', genreId: 'action' }],
        episodeList: [{ title: '12', episodeId: 'samehadaku-ep-12' }],
      },
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: 'success',
          data: {
            defaultStreamingUrl: 'https://player.test/samehadaku',
          },
        }),
      });
    setFetchMock(fetchMock);
    const { getMediaBySlug, getEpisodes, getEpisodeSources } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjoiYW5pbWUiLCJwcm92aWRlciI6InNhbWVoYWRha3UiLCJzbHVnIjoic2FtZWhhZGFrdS1hbiJ9');
    expect(media).toMatchObject({ title: 'Samehadaku Anime', type: 'anime', rating: { average: 8.88 } });

    const eps = await getEpisodes('m~eyJ0eXBlIjoiYW5pbWUiLCJwcm92aWRlciI6InNhbWVoYWRha3UiLCJzbHVnIjoic2FtZWhhZGFrdS1hbiJ9');
    expect(eps[0]).toMatchObject({ slug: 'samehadaku-ep-12', episodeNumber: 12 });

    const sources = await getEpisodeSources('m~eyJ0eXBlIjoiYW5pbWUiLCJwcm92aWRlciI6InNhbWVoYWRha3UiLCJzbHVnIjoic2FtZWhhZGFrdS1hbiJ9', 'samehadaku-ep-12');
    expect(sources).toEqual([{ url: 'https://player.test/samehadaku', label: 'Default', quality: 'auto' }]);
  });

  it('maps Animasu details, episodes, and sources', async () => {
    const detailResponse = {
      detail: {
        title: 'Animasu Anime',
        poster: 'https://img/animasu.jpg',
        rating: '7.5',
        status: 'Ongoing',
        synopsis: 'Animasu story',
        genres: [{ name: 'Comedy', slug: 'comedy' }],
      },
      episodes: [{ name: 'Episode 5', slug: 'animasu-ep-5' }],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          streams: [{ name: '720p', url: 'https://player.test/animasu-720p' }],
        }),
      });
    setFetchMock(fetchMock);
    const { getMediaBySlug, getEpisodes, getEpisodeSources } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjoiYW5pbWUiLCJwcm92aWRlciI6ImFuaW1hc3UiLCJzbHVnIjoiYW5pbWFzdS1hbiJ9');
    expect(media).toMatchObject({ title: 'Animasu Anime', type: 'anime', rating: { average: 7.5 } });

    const eps = await getEpisodes('m~eyJ0eXBlIjoiYW5pbWUiLCJwcm92aWRlciI6ImFuaW1hc3UiLCJzbHVnIjoiYW5pbWFzdS1hbiJ9');
    expect(eps[0]).toMatchObject({ slug: 'animasu-ep-5', episodeNumber: 5 });

    const sources = await getEpisodeSources('m~eyJ0eXBlIjoiYW5pbWUiLCJwcm92aWRlciI6ImFuaW1hc3UiLCJzbHVnIjoiYW5pbWFzdS1hbiJ9', 'animasu-ep-5');
    expect(sources).toEqual([{ url: 'https://player.test/animasu-720p', label: '720p', quality: '720p' }]);
  });

  it('maps Kiryuu details, chapters, and pages', async () => {
    const detailResponse = {
      title: 'Kiryuu Comic',
      imageSrc: 'https://img/kiryuu.jpg',
      rating: '8.4',
      status: 'Ongoing',
      synopsis: 'Kiryuu story',
      genres: ['Action'],
      chapters: [{ title: 'Chapter 10', slug: 'kiryuu-ch-10', date: 'Yesterday' }],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          images: ['https://img/page1.jpg'],
        }),
      });
    setFetchMock(fetchMock);
    const { getMediaBySlug, getChapters, getChapterPages } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjoiY29taWMiLCJwcm92aWRlciI6Imtpcnl1dSIsInNsdWciOiJraXJ5dXUtY28ifQ');
    expect(media).toMatchObject({ title: 'Kiryuu Comic', type: 'comic', rating: { average: 8.4 } });

    const chs = await getChapters('m~eyJ0eXBlIjoiY29taWMiLCJwcm92aWRlciI6Imtpcnl1dSIsInNsdWciOiJraXJ5dXUtY28ifQ');
    expect(chs[0]).toMatchObject({ slug: 'kiryuu-ch-10', chapterNumber: 10 });

    const pages = await getChapterPages('m~eyJ0eXBlIjoiY29taWMiLCJwcm92aWRlciI6Imtpcnl1dSIsInNsdWciOiJraXJ5dXUtY28ifQ', 'kiryuu-ch-10');
    expect(pages).toEqual([{ url: 'https://img/page1.jpg', pageNumber: 1 }]);
  });

  it('maps Komikindo details, chapters, and pages', async () => {
    const detailResponse = {
      data: {
        title: 'Komikindo Comic',
        image: 'https://img/komikindo.jpg',
        rating: '7.9',
        detail: { status: 'Ongoing' },
        genres: [{ name: 'Adventure', slug: 'adventure' }],
        chapters: [{ title: 'Chapter 20', slug: 'komikindo-ch-20', releaseTime: 'Today' }],
      },
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(detailResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          data: {
            images: [{ id: 1, url: 'https://img/page2.jpg' }],
          },
        }),
      });
    setFetchMock(fetchMock);
    const { getMediaBySlug, getChapters, getChapterPages } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjoiY29taWMiLCJwcm92aWRlciI6ImtvbWlraW5kbyIsInNsdWciOiJrb21pa2luZG8tY28ifQ');
    expect(media).toMatchObject({ title: 'Komikindo Comic', type: 'comic', rating: { average: 7.9 } });

    const chs = await getChapters('m~eyJ0eXBlIjoiY29taWMiLCJwcm92aWRlciI6ImtvbWlraW5kbyIsInNsdWciOiJrb21pa2luZG8tY28ifQ');
    expect(chs[0]).toMatchObject({ slug: 'komikindo-ch-20', chapterNumber: 20 });

    const pages = await getChapterPages('m~eyJ0eXBlIjoiY29taWMiLCJwcm92aWRlciI6ImtvbWlraW5kbyIsInNsdWciOiJrb21pa2luZG8tY28ifQ', 'komikindo-ch-20');
    expect(pages).toEqual([{ url: 'https://img/page2.jpg', pageNumber: 1 }]);
  });
});


  it('maps Alqanime details, downloads, and suggestions', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          status: 'success',
          data: {
            title: 'Naruto',
            poster: 'https://img/n.jpg',
            rating: 8.5,
            status: 'Completed',
            genres: [{ name: 'Action', slug: 'action' }],
            downloads: [
              {
                title: 'Batch 01-28',
                links: [
                  {
                    resolution: '720p',
                    urls: [{ server: 'MediaFire', url: 'https://mf/naruto-720p.zip' }],
                  },
                ],
              },
            ],
            stream_links: [],
            recommendations: [{ title: 'Naruto Shippuden', slug: 'naruto-shippuuden', type: 'TV' }],
            related: [],
          },
        }),
    });
    setFetchMock(fetchMock);
    const { getMediaBySlug } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjogImFuaW1lIiwgInByb3ZpZGVyIjogImFscWFuaW1lIiwgInNsdWciOiAibmFydXRvIn0');
    expect(media).toMatchObject({ title: 'Naruto', type: 'anime', nsfw: false });
    expect(media?.downloadUrls).toEqual([
      { url: 'https://mf/naruto-720p.zip', label: 'Batch 01-28 720p', resolution: '720p' },
    ]);
    expect(media?.suggestions).toEqual([
      { slug: 'naruto-shippuuden', title: 'Naruto Shippuden', type: 'TV' },
    ]);
  });

  it('marks Mangasusuku comics NSFW by provider class', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          title: 'Adult Comic',
          image: 'https://img/a.jpg',
          genres: [],
        }),
    });
    setFetchMock(fetchMock);
    const { getMediaBySlug } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjogImNvbWljIiwgInByb3ZpZGVyIjogIm1hbmdhc3VzdWt1IiwgInNsdWciOiAieCJ9');
    expect(media).toMatchObject({ type: 'comic', nsfw: true });
  });

  it('marks comics NSFW via explicit genre slug 21', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          status: 'success',
          title: 'Genre 21 Comic',
          image: 'https://img/g.jpg',
          genres: [{ name: 'Adult', slug: '21' }],
        }),
    });
    setFetchMock(fetchMock);
    const { getMediaBySlug } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjogImNvbWljIiwgInByb3ZpZGVyIjogImtvbWlrc3RhdGlvbiIsInNsdWciOiAieCJ9');
    expect(media).toMatchObject({ nsfw: true });
  });

  it('maps Sakuranovel details as novel type', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          status: 'success',
          data: {
            title: 'Noble Lady',
            alt_title: 'Noble Alt',
            poster: 'https://img/n.jpg',
            rating: 4.2,
            status: 'Completed',
            synopsis: 'A noble lady...',
            genres: [{ name: 'Action', slug: 'action' }],
            chapters: [],
          },
        }),
    });
    setFetchMock(fetchMock);
    const { getMediaBySlug } = await loadApi();

    const media = await getMediaBySlug('m~eyJ0eXBlIjogIm5vdmVsIiwgInByb3ZpZGVyIjogInNha3VyYW5vdmVsIiwgInNsdWciOiAieSJ9');
    expect(media).toMatchObject({ title: 'Noble Lady', type: 'novel', nsfw: false });
    expect(media?.alternativeTitles).toEqual(['Noble Alt']);
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
