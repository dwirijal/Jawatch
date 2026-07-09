// ponytail: no `import 'server-only'` — pkg isn't installed and pg import already keeps this
// off the client bundle. Add server-only if a client component ever tries to import this.
import { pool } from './db';

// M5 library persistence. Repository over pg. All queries parameterized.
// Graceful fallback: if a table is missing (env set, migration not run yet) or the
// DB is unreachable, reads return [] and writes no-op with a warning — never throw
// into a page render. (see learned skill: pg-missing-table-graceful-fallback)

export interface BookmarkInput {
  mediaRef: string;
  mediaType: string;
  title: string;
  coverImage?: string | null;
}

export interface ProgressInput {
  mediaRef: string;
  mediaType: string;
  itemSlug: string;
  itemNumber: number;
  title?: string | null;
}

const UNDEFINED_TABLE = '42P01';

function isRecoverable(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === UNDEFINED_TABLE || code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === '57P03';
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T, op: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isRecoverable(err)) {
      console.warn(`[library] ${op} skipped — DB unavailable/unmigrated:`, (err as Error).message);
      return fallback;
    }
    throw err;
  }
}

// mediaRef is whatever the pages pass to decodeMediaRef: the canonical slash form
// `type/slug` (e.g. anime/one-piece), the legacy `type~provider~slug`, or an opaque `m~…`.
// Reject only empty/oversized/separatorless junk — a real ref always has a `/` or `~`.
function isValidRef(ref: string): boolean {
  return typeof ref === 'string' && ref.length > 0 && ref.length < 512 && (ref.includes('/') || ref.includes('~'));
}

const VIDEO_TYPES = ['anime', 'donghua', 'movie'];

export async function isBookmarked(userId: string, mediaRef: string): Promise<boolean> {
  if (!userId || !isValidRef(mediaRef)) return false;
  return safeQuery(async () => {
    const { rowCount } = await pool.query(
      'select 1 from library_bookmark where user_id = $1 and media_ref = $2',
      [userId, mediaRef],
    );
    return (rowCount ?? 0) > 0;
  }, false, 'isBookmarked');
}

// Toggle: returns the new bookmarked state (true = now saved).
export async function toggleBookmark(userId: string, media: BookmarkInput): Promise<boolean> {
  if (!userId || !isValidRef(media.mediaRef)) return false;
  return safeQuery(async () => {
    const existing = await pool.query(
      'delete from library_bookmark where user_id = $1 and media_ref = $2',
      [userId, media.mediaRef],
    );
    if ((existing.rowCount ?? 0) > 0) return false;
    await pool.query(
      `insert into library_bookmark (user_id, media_ref, media_type, title, cover_image)
       values ($1, $2, $3, $4, $5)
       on conflict (user_id, media_ref) do nothing`,
      [userId, media.mediaRef, media.mediaType, media.title, media.coverImage ?? null],
    );
    return true;
  }, false, 'toggleBookmark');
}

export async function listBookmarks(
  userId: string,
  opts: { type?: string; limit?: number; offset?: number } = {},
): Promise<BookmarkInput[]> {
  if (!userId) return [];
  const limit = Math.min(Math.max(opts.limit ?? 60, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);
  return safeQuery(async () => {
    const params: unknown[] = [userId];
    let where = 'user_id = $1';
    if (opts.type) {
      params.push(opts.type);
      where += ` and media_type = $${params.length}`;
    }
    params.push(limit, offset);
    const { rows } = await pool.query(
      `select media_ref, media_type, title, cover_image
       from library_bookmark where ${where}
       order by created_at desc limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return rows.map((r) => ({ mediaRef: r.media_ref, mediaType: r.media_type, title: r.title, coverImage: r.cover_image }));
  }, [], 'listBookmarks');
}

export async function upsertProgress(userId: string, p: ProgressInput): Promise<void> {
  if (!userId || !isValidRef(p.mediaRef)) return;
  await safeQuery(async () => {
    await pool.query(
      `insert into library_progress (user_id, media_ref, media_type, item_slug, item_number, title, updated_at)
       values ($1, $2, $3, $4, $5, $6, now())
       on conflict (user_id, media_ref)
       do update set item_slug = excluded.item_slug, item_number = excluded.item_number,
                     title = excluded.title, updated_at = now()`,
      [userId, p.mediaRef, p.mediaType, p.itemSlug, p.itemNumber, p.title ?? null],
    );
    return null;
  }, null, 'upsertProgress');
}

// ponytail: no optimistic return — caller revalidates the rail via server action.
export async function deleteProgress(userId: string, mediaRef: string): Promise<void> {
  if (!userId || !isValidRef(mediaRef)) return;
  await safeQuery(async () => {
    await pool.query(
      'delete from library_progress where user_id = $1 and media_ref = $2',
      [userId, mediaRef],
    );
    return null;
  }, null, 'deleteProgress');
}

export async function listProgress(userId: string, kind: 'watch' | 'read'): Promise<ProgressInput[]> {
  if (!userId) return [];
  return safeQuery(async () => {
    const { rows } = await pool.query(
      `select media_ref, media_type, item_slug, item_number, title
       from library_progress
       where user_id = $1 and (media_type = any($2))
       order by updated_at desc limit 100`,
      [userId, kind === 'watch' ? VIDEO_TYPES : ['manga', 'comic', 'novel']],
    );
    return rows.map((r) => ({
      mediaRef: r.media_ref, mediaType: r.media_type,
      itemSlug: r.item_slug, itemNumber: r.item_number, title: r.title,
    }));
  }, [], 'listProgress');
}

export async function recordHistory(userId: string, mediaRef: string, itemSlug: string): Promise<void> {
  if (!userId || !isValidRef(mediaRef) || !itemSlug) return;
  await safeQuery(async () => {
    await pool.query(
      `insert into library_history (user_id, media_ref, item_slug, viewed_at)
       values ($1, $2, $3, now())
       on conflict (user_id, media_ref, item_slug) do update set viewed_at = now()`,
      [userId, mediaRef, itemSlug],
    );
    return null;
  }, null, 'recordHistory');
}

export async function listHistory(userId: string, limit = 50): Promise<{ mediaRef: string; itemSlug: string }[]> {
  if (!userId) return [];
  const capped = Math.min(Math.max(limit, 1), 200);
  return safeQuery(async () => {
    const { rows } = await pool.query(
      `select media_ref, item_slug from library_history
       where user_id = $1 order by viewed_at desc limit $2`,
      [userId, capped],
    );
    return rows.map((r) => ({ mediaRef: r.media_ref, itemSlug: r.item_slug }));
  }, [], 'listHistory');
}
