'use server';
import { getUserId } from '@/lib/session';
import { toggleBookmark, upsertProgress, recordHistory, type BookmarkInput, type ProgressInput } from '@/lib/library';

// Server action: toggle a bookmark for the signed-in user. Returns the new state,
// or null when signed out (client redirects to login). Never throws into the client.
export async function toggleBookmarkAction(media: BookmarkInput): Promise<boolean | null> {
  const userId = await getUserId();
  if (!userId) return null;
  return toggleBookmark(userId, media);
}

// Fire-and-forget: record resume point when user switches episode/chapter in-player.
// No-op when signed out. Keeps continue-rail + resume CTA in sync with actual position.
export async function recordProgressAction(p: ProgressInput): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await Promise.all([upsertProgress(userId, p), recordHistory(userId, p.mediaRef, p.itemSlug)]);
}
