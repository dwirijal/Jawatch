import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8484';

async function checkNSFW(slug: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/v1/jw/media/${slug}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return false;
    const data = await res.json();
    const media = Array.isArray(data.data) ? data.data[0] : data.data;
    return media?.nsfw === true;
  } catch {
    return false;
  }
}

function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in cookies (adjust cookie name based on your auth system)
  const token = request.cookies.get('auth-token')?.value || request.cookies.get('jwt')?.value;
  return !!token;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect media detail routes
  const mediaMatch = pathname.match(/^\/media\/([^\/]+)/);
  if (mediaMatch) {
    const slug = mediaMatch[1];
    if (slug.includes('~')) return NextResponse.next();

    const isNSFW = await checkNSFW(slug);
    
    if (isNSFW && !isAuthenticated(request)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/media/:path*',
  ],
};
