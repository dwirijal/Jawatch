import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoPlayer } from '@/components/VideoPlayer';
import { getEpisodePlaybackClient, resolveMirrorClient } from '@/lib/client-media';
import type { EpisodePlayback } from '@/lib/api';

vi.mock('@/lib/client-media', () => ({
  getEpisodePlaybackClient: vi.fn(),
  resolveMirrorClient: vi.fn(),
}));

const episodes = [
  { slug: 'episode-1', episodeNumber: 1, title: 'Opening Night', createdAt: '' },
  { slug: 'episode-2', episodeNumber: 2, title: 'Second Signal', createdAt: '' },
  { slug: 'episode-3', episodeNumber: 3, title: 'Third Door', createdAt: '' },
];

const playbackMock = vi.mocked(getEpisodePlaybackClient);
const mirrorMock = vi.mocked(resolveMirrorClient);

const playback = (url: string, extra: Partial<EpisodePlayback> = {}): EpisodePlayback => ({
  sources: [{ url, label: 'Default' }],
  mirrors: [],
  downloads: [],
  ...extra,
});

describe('VideoPlayer watch room', () => {
  beforeEach(() => {
    playbackMock.mockReset();
    mirrorMock.mockReset();
    playbackMock.mockResolvedValue(playback('https://player.test/prefetch'));
  });

  it('renders the current episode and iframe in a watch room', () => {
    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialPlayback={playback('https://player.test/episode-2')}
      />,
    );

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
    expect(screen.getByText(/episode 2/i)).toBeInTheDocument();
    expect(screen.getByText('Second Signal')).toBeInTheDocument();
    expect(screen.getByTitle('Second Signal')).toHaveAttribute('src', 'https://player.test/episode-2');
  });

  it('loads the next episode and updates the visible episode', async () => {
    playbackMock.mockResolvedValue(playback('https://player.test/episode-3'));

    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialPlayback={playback('https://player.test/episode-2')}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /next episode/i }));

    await waitFor(() => expect(playbackMock).toHaveBeenCalledWith('anime-slug', 'episode-3'));
    expect(await screen.findByText(/episode 3/i)).toBeInTheDocument();
    expect(screen.getByTitle('Third Door')).toHaveAttribute('src', 'https://player.test/episode-3');
  });

  it('shows a visible error and keeps the old stream when switching fails', async () => {
    playbackMock.mockRejectedValue(new Error('source down'));

    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialPlayback={playback('https://player.test/episode-2')}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /next episode/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat episode');
    expect(screen.getByText(/episode 2/i)).toBeInTheDocument();
    expect(screen.getByTitle('Second Signal')).toHaveAttribute('src', 'https://player.test/episode-2');
  });

  it('treats an empty source list as a visible switch failure', async () => {
    playbackMock.mockResolvedValue({ sources: [], mirrors: [], downloads: [] });

    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={1}
        initialPlayback={playback('https://player.test/episode-2')}
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
        initialPlayback={playback('https://player.test/episode-1')}
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
        initialPlayback={playback('https://player.test/episode-2')}
        episodeListError
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Daftar episode gagal dimuat');
  });

  it('renders download links from playback downloads', () => {
    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={0}
        initialPlayback={playback('https://player.test/episode-1', {
          downloads: [{ url: 'https://dl.test/360', label: 'Mirror', quality: '360p', size: '40 MB' }],
        })}
      />,
    );

    const link = screen.getByRole('link', { name: /Mirror · 360p · 40 MB/i });
    expect(link).toHaveAttribute('href', 'https://dl.test/360');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('resolves a mirror on click and swaps the stream', async () => {
    mirrorMock.mockResolvedValue('https://player.test/mirror-720');

    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={0}
        initialPlayback={playback('https://player.test/episode-1', {
          mirrors: [{ serverId: 'srv-720', label: 'Mirror', quality: '720p' }],
        })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Mirror 720p/i }));

    await waitFor(() => expect(mirrorMock).toHaveBeenCalledWith('anime-slug', 'srv-720'));
    expect(await screen.findByTitle('Opening Night')).toHaveAttribute('src', 'https://player.test/mirror-720');
  });
});
