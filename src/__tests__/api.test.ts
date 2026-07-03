import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMedia, getTrending, getMediaBySlug, searchMedia, getEpisodes } from '@/lib/api';

global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMedia', () => {
    it('should fetch paginated media with default params', async () => {
      const mockResponse = {
        data: [{ slug: 'test', type: 'anime', title: 'Test', createdAt: '', updatedAt: '' }],
        meta: { pagination: { hasMore: false, limit: 20, total: 1 } },
        error: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getMedia();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/media'),
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        })
      );
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should include query params when provided', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: { pagination: {} }, error: null }),
      });

      await getMedia('anime', 2, 10);

      const call = (global.fetch as any).mock.calls[0][0];
      expect(call).toContain('type=anime');
      expect(call).toContain('page=2');
      expect(call).toContain('limit=10');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await getMedia();
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getTrending', () => {
    it('should fetch trending media', async () => {
      const mockResponse = {
        data: [{ slug: 'trend', type: 'anime', title: 'Trending', createdAt: '', updatedAt: '' }],
        meta: { pagination: { limit: 10, total: 1 } },
        error: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getTrending('anime', 10);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/media/trending'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('searchMedia', () => {
    it('should include search query in request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: { pagination: { total: 0 } }, error: null }),
      });

      await searchMedia('test', 20);

      const call = (global.fetch as any).mock.calls[0][0];
      expect(call).toContain('q=test');
      expect(call).toContain('limit=20');
    });
  });

  describe('error handling', () => {
    it('should return empty on network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await getMedia();
      expect(result.data).toEqual([]);
    });

    it('should return empty array for episodes on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await getEpisodes('test-slug');
      expect(result).toEqual([]);
    });
  });
});
