import { NextResponse } from 'next/server';
import { getEpisodeSources } from '@/lib/api';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; episodeSlug: string }> }) {
  const { slug, episodeSlug } = await params;

  try {
    return NextResponse.json(await getEpisodeSources(slug, episodeSlug));
  } catch {
    return NextResponse.json({ error: 'Media belum tersedia' }, { status: 502 });
  }
}
