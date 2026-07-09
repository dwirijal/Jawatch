import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock('@/components/VideoPlayer', () => ({
  VideoPlayer: ({ episodes, initialEpIndex }: any) => (
    <div data-testid="video-player-props">
      {initialEpIndex}:{episodes.map((episode: any) => episode.slug).join(',')}
    </div>
  ),
}));

// BookmarkButton is a client component (useRouter/useTransition) — stub it in server-page tests.
vi.mock('@/components/BookmarkButton', () => ({ BookmarkButton: () => <button type="button">Bookmark</button> }));
vi.mock('@/lib/session', () => ({ getUserId: vi.fn(async () => null) }));

vi.mock('@/lib/api', async () => {
  const api = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...api,
    getMediaBySlug: vi.fn(),
    getEpisodeSources: vi.fn(),
    getEpisodes: vi.fn(),
    getChapters: vi.fn(),
    getMediaRelated: vi.fn(),
  };
});

const api = await import('@/lib/api');
const media = {
  slug: 'anime~anime~night-signal',
  type: 'anime' as const,
  title: 'Night Signal',
  synopsis: 'A signal in the dark.',
  coverImage: 'https://image.test/cover.jpg',
  status: 'ongoing',
  createdAt: '',
  updatedAt: '',
};
const episodes = [
  { slug: 'episode-1', episodeNumber: 1, title: 'Opening Night', createdAt: '' },
  { slug: 'episode-2', episodeNumber: 2, title: 'Second Signal', createdAt: '' },
];

describe('watch-room pages', () => {
  it('passes the real episode list and matching index to the episode player', async () => {
    vi.mocked(api.getMediaBySlug).mockResolvedValue(media);
    vi.mocked(api.getEpisodes).mockResolvedValue(episodes);
    vi.mocked(api.getEpisodeSources).mockResolvedValue([{ url: 'https://player.test/episode-2' }]);
    const { default: EpisodePage } = await import('@/app/media/[type]/[slug]/episodes/[episodeSlug]/page');

    render(await EpisodePage({ params: Promise.resolve({ type: media.type, slug: media.slug, episodeSlug: 'episode-2' }) }));

    expect(screen.getByTestId('video-player-props')).toHaveTextContent('1:episode-1,episode-2');
  });

  it('falls back to the current episode when the queue fails', async () => {
    vi.mocked(api.getMediaBySlug).mockResolvedValue(media);
    vi.mocked(api.getEpisodes).mockRejectedValue(new Error('queue down'));
    vi.mocked(api.getEpisodeSources).mockResolvedValue([{ url: 'https://player.test/episode-2' }]);
    const { default: EpisodePage } = await import('@/app/media/[type]/[slug]/episodes/[episodeSlug]/page');

    render(await EpisodePage({ params: Promise.resolve({ type: media.type, slug: media.slug, episodeSlug: 'episode-2' }) }));

    expect(screen.getByTestId('video-player-props')).toHaveTextContent('0:episode-2');
  });

  it('renders a soft-404 EmptyState when no episode sources are available', async () => {
    // Intended behavior: no sources -> in-page EmptyState (robots noindex), not a hard 404 throw.
    vi.mocked(api.getMediaBySlug).mockResolvedValue(media);
    vi.mocked(api.getEpisodes).mockResolvedValue(episodes);
    vi.mocked(api.getEpisodeSources).mockRejectedValue(new Error('Media source unavailable'));
    const { default: EpisodePage } = await import('@/app/media/[type]/[slug]/episodes/[episodeSlug]/page');

    render(await EpisodePage({ params: Promise.resolve({ type: 'anime', slug: 'anime-slug', episodeSlug: 'not-real' }) }));
    expect(screen.getByText('Episode tidak tersedia')).toBeInTheDocument();
  });

  it('renders a start watching CTA on video media details', async () => {
    vi.mocked(api.getMediaBySlug).mockResolvedValue(media);
    vi.mocked(api.getEpisodes).mockResolvedValue(episodes);
    vi.mocked(api.getMediaRelated).mockResolvedValue([]);
    const { default: MediaPage } = await import('@/app/media/[type]/[slug]/page');

    render(await MediaPage({ params: Promise.resolve({ type: media.type, slug: media.slug }) }));

    expect(screen.getByRole('link', { name: /start watching/i })).toHaveAttribute('href', '/media/anime/night-signal/episodes/episode-1');
  });
});
