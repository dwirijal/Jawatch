import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { listProgress } from '@/lib/library';

// Continue-rail data (watch + read progress) for the signed-in user. Split out of the
// homepage so `/` can be ISR-static (CDN-cached, ~0 invocation). Fires client-side only
// for signed-in users; guests and crawlers get the static shell and never call this.
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
