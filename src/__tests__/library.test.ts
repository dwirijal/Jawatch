import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the pg pool before importing the module under test.
const query = vi.fn();
vi.mock('@/lib/db', () => ({ pool: { query: (...a: unknown[]) => query(...a) } }));

async function load() {
  vi.resetModules();
  return import('@/lib/library');
}

describe('library repository', () => {
  beforeEach(() => { query.mockReset(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('rejects invalid media refs without querying', async () => {
    const { isBookmarked, toggleBookmark } = await load();
    expect(await isBookmarked('u1', 'not-a-ref')).toBe(false);
    expect(await toggleBookmark('u1', { mediaRef: 'bad', mediaType: 'anime', title: 'x' })).toBe(false);
    expect(query).not.toHaveBeenCalled();
  });

  it('requires a userId', async () => {
    const { listBookmarks } = await load();
    expect(await listBookmarks('')).toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });

  it('toggles bookmark on (insert) when none exists', async () => {
    query.mockResolvedValueOnce({ rowCount: 0 }); // delete removed nothing
    query.mockResolvedValueOnce({ rowCount: 1 }); // insert
    const { toggleBookmark } = await load();
    const on = await toggleBookmark('u1', { mediaRef: 'anime~x~y', mediaType: 'anime', title: 'T', coverImage: 'c' });
    expect(on).toBe(true);
    expect(query.mock.calls[0][0]).toContain('delete from library_bookmark');
    expect(query.mock.calls[1][0]).toContain('insert into library_bookmark');
    expect(query.mock.calls[1][1]).toEqual(['u1', 'anime~x~y', 'anime', 'T', 'c']);
  });

  it('toggles bookmark off when one exists', async () => {
    query.mockResolvedValueOnce({ rowCount: 1 }); // delete removed a row
    const { toggleBookmark } = await load();
    const on = await toggleBookmark('u1', { mediaRef: 'anime~x~y', mediaType: 'anime', title: 'T' });
    expect(on).toBe(false);
    expect(query).toHaveBeenCalledTimes(1); // no insert
  });

  it('maps watch vs read progress to the right media types', async () => {
    query.mockResolvedValue({ rows: [] });
    const { listProgress } = await load();
    await listProgress('u1', 'watch');
    expect(query.mock.calls[0][1][1]).toEqual(['anime', 'donghua', 'movie']);
    await listProgress('u1', 'read');
    expect(query.mock.calls[1][1][1]).toEqual(['manga', 'comic', 'novel']);
  });

  it('returns [] and does not throw when table is missing (42P01)', async () => {
    query.mockRejectedValue(Object.assign(new Error('relation does not exist'), { code: '42P01' }));
    const { listBookmarks, isBookmarked } = await load();
    expect(await listBookmarks('u1')).toEqual([]);
    expect(await isBookmarked('u1', 'anime~x~y')).toBe(false);
  });

  it('rethrows unexpected DB errors', async () => {
    query.mockRejectedValue(Object.assign(new Error('syntax error'), { code: '42601' }));
    const { listBookmarks } = await load();
    await expect(listBookmarks('u1')).rejects.toThrow('syntax error');
  });
});
