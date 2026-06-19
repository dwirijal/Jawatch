"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { browse, type AnimeCard } from "@/lib/api";
import AnimeCardView from "@/components/AnimeCard";

const GENRES = ["", "action", "adventure", "comedy", "drama", "fantasy", "horror", "isekai", "mecha", "music", "mystery", "psychological", "romance", "sci-fi", "slice-of-life", "sports", "supernatural", "thriller"];
const SORTS = ["latest", "popular", "rating", "newest"];

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [anime, setAnime] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<string | undefined>(undefined);

  const genre = searchParams.get("genre") || "";
  const sort = searchParams.get("sort") || "latest";
  const mediaType = searchParams.get("type") || "anime";

  const load = useCallback(async (reset?: boolean) => {
    setLoading(true);
    try {
      const result = await browse({
        sort, genre: genre || undefined,
        limit: 24, cursor: reset ? undefined : cursorRef.current,
      });
      const READ_KINDS = new Set(["manga", "comic", "manhwa", "manhua", "novel"]);
      const filtered = result.items.filter(item => {
        const kind = item.entry_kind || item.media_type || "";
        return mediaType === "anime" ? !READ_KINDS.has(kind) : READ_KINDS.has(kind);
      });
      setAnime(reset ? filtered : prev => [...prev, ...filtered]);
      cursorRef.current = result.next_cursor;
      setHasMore(result.has_next);
    } catch (err) {
      if (reset) setAnime([]);
      console.error("[browse] load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [sort, genre, mediaType]); // ponytail: cursorRef avoids infinite re-render loop

  useEffect(() => { cursorRef.current = undefined; load(true); }, [load]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    router.push(`/browse?${params.toString()}`);
  };

  const isAnime = mediaType !== "manga";

  return (
    <>
      {/* Media Type Tabs — single <a> per tab, no button wrap */}
      <nav className="flex gap-1 mb-6 border-b border-[var(--ja-border)]" aria-label="Media type">
        <Link
          href={`/browse?sort=${sort}${genre ? `&genre=${genre}` : ""}`}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${isAnime ? "text-[var(--ja-text)] border-[var(--ja-accent)]" : "text-[var(--ja-text-muted)] border-transparent hover:text-[var(--ja-text-secondary)]"}`}
          aria-current={isAnime ? "page" : undefined}
        >
          Anime
        </Link>
        <Link
          href={`/browse?type=manga&sort=${sort}${genre ? `&genre=${genre}` : ""}`}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${!isAnime ? "text-[var(--ja-text)] border-[var(--ja-accent)]" : "text-[var(--ja-text-muted)] border-transparent hover:text-[var(--ja-text-secondary)]"}`}
          aria-current={!isAnime ? "page" : undefined}
        >
          Manga
        </Link>
      </nav>

      {/* Filters — native elements, no double wrapping */}
      <div className="flex flex-wrap gap-3 mb-8" role="toolbar" aria-label="Filter options">
        <select
          value={genre}
          onChange={e => updateParams({ genre: e.target.value })}
          className="bg-[var(--ja-card-bg)] text-[var(--ja-text)] border border-[var(--ja-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--ja-accent)] focus:outline-none"
          aria-label="Filter by genre"
        >
          {GENRES.map(g => (
            <option key={g} value={g}>{g ? g.charAt(0).toUpperCase() + g.slice(1) : "All Genres"}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={e => updateParams({ sort: e.target.value })}
          className="bg-[var(--ja-card-bg)] text-[var(--ja-text)] border border-[var(--ja-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--ja-accent)] focus:outline-none"
          aria-label="Sort order"
        >
          {SORTS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading && anime.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" role="status" aria-label="Loading">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-[var(--ja-card-bg)] animate-pulse" />
          ))}
        </div>
      ) : anime.length === 0 ? (
        <div className="text-center py-16" role="status">
          <p className="text-[var(--ja-text-muted)]">No results found. Try different filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {anime.map((item) => (
              <AnimeCardView key={item.item_key || item.slug} anime={item} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => load(false)}
                disabled={loading}
                className="px-6 py-3 bg-[var(--ja-accent)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                aria-label={loading ? "Loading more..." : "Load more results"}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function BrowsePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[var(--ja-text)]">Browse</h1>
      <Suspense fallback={<div className="text-center py-16 text-[var(--ja-text-muted)]">Loading...</div>}>
        <BrowseContent />
      </Suspense>
    </main>
  );
}
