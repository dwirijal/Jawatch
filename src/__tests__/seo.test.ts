import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  getMedia: vi.fn(),
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
    process.env.NEXT_PUBLIC_SITE_URL = 'https://jawatch.test';
  });

  it('builds a public-only sitemap with media detail URLs', async () => {
    vi.mocked(api.getMedia).mockResolvedValue({ data: [media], total: 1, hasMore: false });
    const { default: sitemap } = await import('@/app/sitemap');

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain('https://jawatch.test/discover');
    expect(urls).toContain('https://jawatch.test/media/anime~anime~night-signal');
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
        disallow: ['/library', '/profile', '/notifications', '/login'],
      },
      sitemap: 'https://jawatch.test/sitemap.xml',
    });
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
