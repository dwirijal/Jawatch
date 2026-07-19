import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';
import { VideoPlayer } from '@/components/VideoPlayer';

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(axeMatchers);
import { getEpisodePlaybackClient, resolveMirrorClient } from '@/lib/client-media';
import type { EpisodePlayback } from '@/lib/api';

vi.mock('@/lib/client-media', () => ({
  getEpisodePlaybackClient: vi.fn(),
  resolveMirrorClient: vi.fn(),
}));

// server action — no-op in jsdom
vi.mock('@/app/[type]/[slug]/actions', () => ({
  recordProgressAction: vi.fn(),
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
        mediaType="anime"
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
        mediaType="anime"
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
        mediaType="anime"
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
        mediaType="anime"
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
        mediaType="anime"
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
        mediaType="anime"
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
        mediaType="anime"
      />,
    );

    // grouped by resolution: heading carries resolution + size, link carries provider label
    expect(screen.getByRole('heading', { name: /360p.*40 MB/i })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Download Mirror 360p/i });
    expect(link).toHaveAttribute('href', 'https://dl.test/360');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('groups download links by resolution', () => {
    render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={0}
        initialPlayback={playback('https://player.test/episode-1', {
          downloads: [
            { url: 'https://dl.test/360a', label: 'Filedon', quality: '360p', size: '40 MB' },
            { url: 'https://dl.test/360b', label: 'Mega', quality: '360p', size: '40 MB' },
            { url: 'https://dl.test/720a', label: 'Filedon', quality: '720p', size: '90 MB' },
          ],
        })}
        mediaType="anime"
      />,
    );

    expect(screen.getByRole('heading', { name: /360p.*40 MB/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /720p.*90 MB/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download Mega 360p/i })).toHaveAttribute('href', 'https://dl.test/360b');
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
        mediaType="anime"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Putar Mirror 720p/i }));

    await waitFor(() => expect(mirrorMock).toHaveBeenCalledWith('anime-slug', 'srv-720'));
    expect(await screen.findByTitle('Opening Night')).toHaveAttribute('src', 'https://player.test/mirror-720');
  });

  it('has no WCAG violations with grouped mirrors and downloads', async () => {
    const { container } = render(
      <VideoPlayer
        slug="anime-slug"
        episodes={episodes}
        initialEpIndex={0}
        initialPlayback={playback('https://player.test/episode-1', {
          mirrors: [
            { serverId: 'a1', label: 'filedon', quality: '360p' },
            { serverId: 'a2', label: 'filedon', quality: '480p' },
            { serverId: 'b1', label: 'mega', quality: '720p' },
          ],
          downloads: [
            { url: 'https://dl.test/360', label: 'Filedon', quality: '360p', size: '40 MB' },
            { url: 'https://dl.test/720', label: 'Mega', quality: '720p', size: '90 MB' },
          ],
        })}
        mediaType="anime"
      />,
    );

    // axe-core cannot enter cross-frame content under jsdom — drop the <iframe> before scanning.
    container.querySelector('iframe')?.remove();
    expect(await axe(container)).toHaveNoViolations();
  });
});
