"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { browse, type AnimeCard } from "@/lib/api";
import AnimeCardView from "@/components/AnimeCard";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [anime, setAnime] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const genre = searchParams.get("genre") || "";
  const sort = searchParams.get("sort") || "latest";

  const load = useCallback(async (reset?: boolean) => {
    setLoading(true);
    try {
      const result = await browse({
        media_type: "anime", sort, genre: genre || undefined,
        limit: 24, cursor: reset ? undefined : cursor,
      });
      if (reset) {
        setAnime(result.items);
        setCursor(result.next_cursor);
      } else {
        setAnime(prev => [...prev, ...result.items]);
        setCursor(result.next_cursor);
      }
      setHasMore(result.has_next);
    } catch {} finally { setLoading(false); }
  }, [sort, genre, cursor]);

  useEffect(() => { load(true); }, [sort, genre]);

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">
          {genre ? `Genre: ${genre}` : "Browse All Anime"}
        </h1>
        <div className="flex gap-2">
          {["latest", "popular", "score"].map(s => (
            <button
              key={s}
              onClick={() => router.push(`/browse?sort=${s}${genre ? `&genre=${genre}` : ""}`)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sort === s ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s === "latest" ? "Latest" : s === "popular" ? "Popular" : "Top Rated"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {anime.map(item => <AnimeCardView key={item.item_key} anime={item} />)}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => load()}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}

export default function BrowsePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Suspense fallback={<div className="skeleton h-[60vh] rounded-xl" />}>
        <BrowseContent />
      </Suspense>
    </div>
  );
}