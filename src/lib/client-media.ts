import type { ChapterPage, EpisodeSource } from '@/lib/api';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Media request failed');
  return res.json() as Promise<T>;
}

export function getEpisodeSourcesClient(slug: string, episodeSlug: string): Promise<EpisodeSource[]> {
  return getJson<EpisodeSource[]>(`/api/media/${encodeURIComponent(slug)}/episodes/${encodeURIComponent(episodeSlug)}/sources`);
}

export function getChapterPagesClient(slug: string, chapterSlug: string): Promise<ChapterPage[]> {
  return getJson<ChapterPage[]>(`/api/media/${encodeURIComponent(slug)}/chapters/${encodeURIComponent(chapterSlug)}/pages`);
}
