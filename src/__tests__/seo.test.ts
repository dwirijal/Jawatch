import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  getMedia: vi.fn(),
  getGenres: vi.fn(),
  getMediaBySlug: vi.fn(),
  getChapters: vi.fn(),
  getEpisodes: vi.fn(),
  getMediaRelated: vi.fn(),
}));

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
    vi.mocked(api.getGenres).mockResolvedValue([]);
    vi.mocked(api.getMedia).mockResolvedValue({ data: [], total: 0, hasMore: false });
    const { default: sitemap } = await import('@/app/sitemap');

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain('https://jawatch.test/discover/anime');
    expect(urls).toContain('https://jawatch.test/discover/donghua');
    expect(urls).toContain('https://jawatch.test/discover/comic');
    expect(urls).toContain('https://jawatch.test/popular');
    expect(urls).toContain('https://jawatch.test/latest');
    expect(urls).toContain('https://jawatch.test/genres');

    expect(urls).not.toContain('https://jawatch.test/discover/manga');
    expect(urls).not.toContain('https://jawatch.test/discover/movie');
    expect(urls).not.toContain('https://jawatch.test/discover/novel');
    expect(urls).not.toContain('https://jawatch.test/trending');
    expect(urls).not.toContain('https://jawatch.test/search');
    expect(urls).not.toContain('https://jawatch.test/random');
    expect(urls).not.toContain('https://jawatch.test/library');
    expect(urls).not.toContain('https://jawatch.test/profile');
    expect(urls).not.toContain('https://jawatch.test/notifications');
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
    vi.mocked(api.getMedia).mockResolvedValue({ data: [media, media], total: 2, hasMore: false });
    const { default: sitemap } = await import('@/app/sitemap');

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain('https://jawatch.test/genres/action');
    expect(urls.filter((url) => url === 'https://jawatch.test/media/anime~anime~night-signal')).toHaveLength(1);
    expect(api.getMedia).toHaveBeenCalledTimes(1);
  });

  it('uses media data for detail metadata', async () => {
    vi.mocked(api.getMediaBySlug).mockResolvedValue(media);
    const { generateMetadata } = await import('@/app/media/[slug]/page');

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: media.slug }) });

    expect(metadata.title).toEqual({ absolute: 'Night Signal | jawatch' });
    expect(metadata.description).toBe('A signal in the dark.');
    expect(metadata.openGraph).toMatchObject({
      title: 'Night Signal | jawatch',
      description: 'A signal in the dark.',
      images: [{ url: 'https://image.test/night.jpg' }],
    });
  });
});
