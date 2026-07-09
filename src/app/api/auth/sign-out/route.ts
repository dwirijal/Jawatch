import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { siteUrl } from '@/lib/site-url';

export async function POST() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // ponytail: no active session -> signOut throws; redirect still lands home. No data-loss path.
  }
  return NextResponse.redirect(new URL('/', siteUrl()));
}
