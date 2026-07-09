import type { ChapterPage, EpisodePlayback } from '@/lib/api';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Media request failed');
  return res.json() as Promise<T>;
}

export function getEpisodePlaybackClient(slug: string, episodeSlug: string): Promise<EpisodePlayback> {
  return getJson<EpisodePlayback>(`/api/media/${encodeURIComponent(slug)}/episodes/${encodeURIComponent(episodeSlug)}/sources`);
}

export async function resolveMirrorClient(slug: string, serverId: string): Promise<string> {
  const { url } = await getJson<{ url: string }>(
    `/api/media/${encodeURIComponent(slug)}/episodes/_/server/${encodeURIComponent(serverId)}`,
  );
  return url;
}

export function getChapterPagesClient(slug: string, chapterSlug: string): Promise<ChapterPage[]> {
  return getJson<ChapterPage[]>(`/api/media/${encodeURIComponent(slug)}/chapters/${encodeURIComponent(chapterSlug)}/pages`);
}
