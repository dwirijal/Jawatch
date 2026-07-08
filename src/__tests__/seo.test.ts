import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notFound } from 'next/navigation';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
  }),
}));

vi.mock('@/lib/api', async () => {
  const api = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...api,
    getMedia: vi.fn(),
    getGenres: vi.fn(),
    getMediaBySlug: vi.fn(),
    getChapters: vi.fn(),
    getEpisodes: vi.fn(),
    getMediaRelated: vi.fn(),
  };
});

const api = await import('@/lib/api');

const media = {
  slug: 'anime~anime~night-signal',
  type: 'anime' as const,
  title: 'Night Signal',
  synopsis: 'A signal in the dark.',
  coverImage: 'https://image.test/night.jpg',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('SEO routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getGenres).mockResolvedValue([]);
    process.env.SITE_URL = 'https://jawatch.test';
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('builds a public-only sitemap with supported discovery routes only', async () => {
    vi.mocked(api.getMedia).mockResolvedValue({ data: [media], total: 1, hasMore: false });
    const { default: sitemap } = await import('@/app/sitemap');

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain('https://jawatch.test/discover');
    expect(urls).toContain('https://jawatch.test/discover/anime');
    expect(urls).toContain('https://jawatch.test/discover/donghua');
    expect(urls).toContain('https://jawatch.test/discover/comic');
    expect(urls).toContain('https://jawatch.test/popular');
    expect(urls).toContain('https://jawatch.test/latest');
    expect(urls).toContain('https://jawatch.test/genres');
    expect(urls).toContain('https://jawatch.test/media/anime/night-signal');

    expect(urls).not.toContain('https://jawatch.test/discover/manga');
    expect(urls).not.toContain('https://jawatch.test/discover/movie');
    expect(urls).not.toContain('https://jawatch.test/discover/novel');
    expect(urls).not.toContain('https://jawatch.test/trending');
  });

  it('publishes robots policy that keeps private pages out of crawl', async () => {
    const { default: robots } = await import('@/app/robots');

    expect(robots()).toMatchObject({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/library', '/profile', '/notifications', '/login', '/search'],
      },
      sitemap: 'https://jawatch.test/sitemap.xml',
    });
  });

  it('adds genre URLs and dedupes media URLs in the sitemap', async () => {
    vi.mocked(api.getGenres).mockResolvedValue([{ name: 'Action', slug: 'action' }]);
    vi.mocked(api.getMedia).mockResolvedValue({
      data: [
        media,
        media,
        { ...media, slug: 'anime~anime~empty-date', updatedAt: '1970-01-01T00:00:00.000Z', createdAt: '1970-01-01T00:00:00.000Z' },
      ],
      total: 3,
      hasMore: false,
    });
    const { default: sitemap } = await import('@/app/sitemap');

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    const fallbackEntry = entries.find((entry) => entry.url === 'https://jawatch.test/media/anime/empty-date');

    expect(urls).toContain('https://jawatch.test/genres/action');
    expect(urls.filter((url) => url === 'https://jawatch.test/media/anime/night-signal')).toHaveLength(1);
    expect(fallbackEntry?.lastModified).not.toEqual(new Date('1970-01-01T00:00:00.000Z'));
    expect(api.getMedia).toHaveBeenCalledTimes(1);
  });

  it('returns not found for unsupported discover types', async () => {
    const { generateMetadata, default: DiscoverTypePage } = await import('@/app/discover/[type]/page');
    const { default: DiscoverPage } = await import('@/app/discover/page');
    const rendered = await DiscoverPage();

    await expect(DiscoverTypePage({ params: Promise.resolve({ type: 'manga' }) })).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
    await expect(generateMetadata({ params: Promise.resolve({ type: 'manga' }) })).resolves.toEqual({ robots: { index: false, follow: false } });
    expect(notFound).toHaveBeenCalledTimes(1);
    expect(String(rendered)).not.toContain('/discover/manga');
    expect(String(rendered)).not.toContain('/discover/movie');
    expect(String(rendered)).not.toContain('/discover/novel');
  });

  it('uses media data for detail metadata', async () => {
    vi.mocked(api.getMediaBySlug).mockResolvedValue(media);
    const { generateMetadata } = await import('@/app/media/[type]/[slug]/page');

    const metadata = await generateMetadata({ params: Promise.resolve({ type: media.type, slug: media.slug }) });

    expect(metadata.title).toEqual({ absolute: 'Night Signal | jawatch' });
    expect(metadata.description).toBe('A signal in the dark.');
    expect(metadata.openGraph).toMatchObject({
      title: 'Night Signal | jawatch',
      description: 'A signal in the dark.',
      images: [{ url: 'https://image.test/night.jpg' }],
    });
  });
});
