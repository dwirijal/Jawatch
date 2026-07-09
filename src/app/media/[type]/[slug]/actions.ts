'use server';
import { getUserId } from '@/lib/session';
import { toggleBookmark, type BookmarkInput } from '@/lib/library';

// Server action: toggle a bookmark for the signed-in user. Returns the new state,
// or null when signed out (client redirects to login). Never throws into the client.
export async function toggleBookmarkAction(media: BookmarkInput): Promise<boolean | null> {
  const userId = await getUserId();
  if (!userId) return null;
  return toggleBookmark(userId, media);
}
