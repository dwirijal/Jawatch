import { NextResponse } from 'next/server';
import { getChapterPages } from '@/lib/api';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; chapterSlug: string }> }) {
  const { slug, chapterSlug } = await params;

  try {
    return NextResponse.json(await getChapterPages(slug, chapterSlug));
  } catch {
    return NextResponse.json({ error: 'Media belum tersedia' }, { status: 502 });
  }
}
