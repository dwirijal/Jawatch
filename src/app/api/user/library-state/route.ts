import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/session';
import { isBookmarked, listProgress } from '@/lib/library';

// Per-user detail-page state (bookmark + resume point). Split out of the detail
// page so that page can be ISR-static (CDN-cached, ~0 invocation). This route is
// the only dynamic bit and fires client-side only for signed-in users — crawlers
// and signed-out visitors never hit it. Signed-out => neutral payload, no throw.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  const kind = req.nextUrl.searchParams.get('kind') === 'read' ? 'read' : 'watch';
  const empty = { bookmarked: false, resume: null };
  if (!ref) return NextResponse.json(empty);

  const userId = await getUserId();
  if (!userId) return NextResponse.json(empty);

  const [bookmarked, progress] = await Promise.all([
    isBookmarked(userId, ref),
    listProgress(userId, kind).catch(() => []),
  ]);
  const p = progress.find((x) => x.mediaRef === ref);
  return NextResponse.json({
    bookmarked,
    resume: p ? { itemSlug: p.itemSlug, itemNumber: p.itemNumber } : null,
  });
}
