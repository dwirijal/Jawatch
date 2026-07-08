import { NextResponse } from 'next/server';
import { decodeMediaRef, buildCanonicalPath } from '@/lib/api';

export async function GET(request: Request, { params }: { params: Promise<{ type: string[] }> }) {
  const { type: slug } = await params;

  if (!slug || slug.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const legacySlug = slug[0];
  const ref = decodeMediaRef(legacySlug);
  if (!ref) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const canonicalMedia = buildCanonicalPath(ref);

  if (slug.length === 1) {
    return NextResponse.redirect(new URL(canonicalMedia, request.url), 301);
  }

  if (slug.length === 3) {
    const subType = slug[1];
    const itemSlug = slug[2];
    if (subType === 'episodes' || subType === 'chapters') {
      const canonicalPath = `${canonicalMedia}/${subType}/${itemSlug}`;
      return NextResponse.redirect(new URL(canonicalPath, request.url), 301);
    }
  }

  return new NextResponse('Not Found', { status: 404 });
}
