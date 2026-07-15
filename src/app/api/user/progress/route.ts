import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { listProgress } from '@/lib/library';

// ponytail: ProgressInput now includes coverImage — listProgress does a JOIN
// on the media table so the continue-rail can render posters without a
// separate per-item fetch. Falls back gracefully when cover is unavailable.
export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ watch: [], read: [] });

  const [watch, read] = await Promise.all([
    listProgress(userId, 'watch').catch(() => []),
    listProgress(userId, 'read').catch(() => []),
  ]);
  return NextResponse.json({ watch, read });
}
