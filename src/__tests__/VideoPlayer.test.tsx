import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoPlayer } from '@/components/VideoPlayer';
import { getEpisodeSources } from '@/lib/api';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    getEpisodeSources: vi.fn(),
  };
});

const episodes = [
  { slug: 'episode-1', episodeNumber: 1, title: 'Opening Night', createdAt: '' },
  { slug: 'episode-2', episodeNumber: 2, title: 'Second Signal', createdAt: '' },
  { slug: 'episode-3', episodeNumber: 3, title: 'Third Door', createdAt: '' },
];

const getEpisodeSourcesMock = vi.mocked(getEpisodeSources);

describe('VideoPlayer watch room', () => {
  beforeEach(() => {
    getEpisodeSourcesMock.mockReset();
    getEpisodeSourcesMock.mockResolvedValue([{ url: 'https://player.test/prefetch', label: 'Default' }]);
  });

  it('renders the current episode and iframe in a watch room', () => {
    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialSources={[{ url: 'https://player.test/episode-2', label: 'Default' }]}
      />,
    );

    expect(screen.getByText(/now watching/i)).toBeInTheDocument();
    expect(screen.getByText(/episode 2/i)).toBeInTheDocument();
    expect(screen.getByText('Second Signal')).toBeInTheDocument();
    expect(screen.getByTitle('Second Signal')).toHaveAttribute('src', 'https://player.test/episode-2');
  });

  it('loads the next episode and updates the visible episode', async () => {
    getEpisodeSourcesMock.mockResolvedValue([{ url: 'https://player.test/episode-3', label: 'Default' }]);

    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialSources={[{ url: 'https://player.test/episode-2', label: 'Default' }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /next episode/i }));

    await waitFor(() => expect(getEpisodeSourcesMock).toHaveBeenCalledWith('anime-slug', 'episode-3'));
    expect(await screen.findByText(/episode 3/i)).toBeInTheDocument();
    expect(screen.getByTitle('Third Door')).toHaveAttribute('src', 'https://player.test/episode-3');
  });

  it('shows a visible error and keeps the old stream when switching fails', async () => {
    getEpisodeSourcesMock.mockRejectedValue(new Error('source down'));

    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialSources={[{ url: 'https://player.test/episode-2', label: 'Default' }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /next episode/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat episode');
    expect(screen.getByText(/episode 2/i)).toBeInTheDocument();
    expect(screen.getByTitle('Second Signal')).toHaveAttribute('src', 'https://player.test/episode-2');
  });

  it('treats an empty source list as a visible switch failure', async () => {
    getEpisodeSourcesMock.mockResolvedValue([]);

    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialSources={[{ url: 'https://player.test/episode-2', label: 'Default' }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /next episode/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat episode');
    expect(screen.getByText(/episode 2/i)).toBeInTheDocument();
    expect(screen.getByTitle('Second Signal')).toHaveAttribute('src', 'https://player.test/episode-2');
  });

  it('opens the full episode queue', () => {
    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={0}
        initialSources={[{ url: 'https://player.test/episode-1', label: 'Default' }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open episode queue/i }));

    expect(screen.getByRole('region', { name: /episode queue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /episode 3 third door/i })).toBeInTheDocument();
  });

  it('shows a visible warning when the episode queue is unavailable', () => {
    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={[episodes[1]]}
        initialEpIndex={0}
        initialSources={[{ url: 'https://player.test/episode-2', label: 'Default' }]}
        episodeListError
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Daftar episode gagal dimuat');
  });
});
