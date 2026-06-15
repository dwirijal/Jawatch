import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getContents, getTrending, getContent, searchContents, getStreams } from '@/lib/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContents', () => {
    it('should fetch paginated contents with default params', async () => {
      const mockResponse = {
        data: [{ id: 1, title: 'Test', content_type: 'anime' }],
        meta: { page: 1, limit: 20, total: 1, has_next: false },
        error: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getContents();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contents'),
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include query params when provided', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {}, error: null }),
      });

      await getContents('anime', 2, 10);

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

      const result = await getContents();
      expect(result).toEqual({});
    });
  });

  describe('getTrending', () => {
    it('should fetch trending contents', async () => {
      const mockResponse = {
        data: [{ id: 1, title: 'Trending' }],
        meta: { limit: 10, total: 1 },
        error: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getTrending('anime', 10);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/trending'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchContents', () => {
    it('should include search query in request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: { query: 'test', total: 0 }, error: null }),
      });

      await searchContents('test', 20);

      const call = (global.fetch as any).mock.calls[0][0];
      expect(call).toContain('q=test');
      expect(call).toContain('limit=20');
    });
  });

  describe('fetchApi error handling', () => {
    it('should return empty object on network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await getContents();
      expect(result).toEqual({});
    });

    it('should return empty array for list endpoints on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await getStreams(1);
      expect(result).toEqual([]);
    });
  });
});