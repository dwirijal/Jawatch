import { headers } from 'next/headers';
import { auth } from './auth';

// Resolve the current user id from the better-auth session, or null when signed out
// / auth not configured. Never throws into a render — a broken/absent session = signed out.
export async function getUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
