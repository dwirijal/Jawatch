import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health|robots.txt|sitemap.xml).*)'],
};

export function middleware(_req: NextRequest) {
  // ponytail: Better Auth uses cookie-based sessions; Next middleware cannot read
  // the session without the secret, so we just pass through. Auth gating happens
  // server-side in pages that need it. Upgrade to edge session check if needed.
  return NextResponse.next();
}
