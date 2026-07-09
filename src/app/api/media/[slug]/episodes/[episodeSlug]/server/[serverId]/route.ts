import { NextResponse } from 'next/server';
import { resolveEpisodeMirror } from '@/lib/api';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; serverId: string }> }) {
  const { slug, serverId } = await params;

  try {
    return NextResponse.json({ url: await resolveEpisodeMirror(slug, serverId) });
  } catch {
    return NextResponse.json({ error: 'Media belum tersedia' }, { status: 502 });
  }
}
