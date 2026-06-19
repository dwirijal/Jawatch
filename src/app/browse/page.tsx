"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { browse, type AnimeCard } from "@/lib/api";
import AnimeCardView from "@/components/AnimeCard";

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
      const filtered = result.items.filter(item => {
        const kind = item.entry_kind || "";
        if (mediaType === "anime") {
          return !["manga", "comic", "manhwa", "manhua", "novel"].includes(kind);
        } else {
          return ["manga", "comic", "manhwa", "manhua", "novel"].includes(kind);
        }
      });
      setAnime(reset ? filtered : prev => [...prev, ...filtered]);
      cursorRef.current = result.next_cursor;
      setHasMore(result.has_next);
    } catch {} finally { setLoading(false); }
  }, [sort, genre, mediaType]); // ponytail: cursorRef avoids infinite re-render loop

  useEffect(() => { cursorRef.current = undefined; load(true); }, [load]);

  return (
    <>
      {/* Media Type Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--ja-border)]">
        {[
          { key: "anime", label: "Anime", href: `/browse?sort=${sort}${genre ? `&genre=${genre}` : ""}` },
          { key: "manga", label: "Manga", href: `/browse?type=manga&sort=${sort}${genre ? `&genre=${genre}` : ""}` },
        ].map(t => (
          <button key={t.key} onClick={() => router.push(t.href)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              mediaType === t.key
                ? "border-[var(--ja-purple)] text-white"
                : "border-transparent text-[var(--ja-text-secondary)] hover:text-white hover:border-white/30"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">
          {genre ? `Genre: ${genre}` : `Browse All ${mediaType === "manga" ? "Manga" : "Anime"}`}
        </h1>
        <div className="flex gap-2">
          {["latest", "popular", "score"].map(s => (
            <button
              key={s}
              onClick={() => router.push(`/browse?sort=${s}${genre ? `&genre=${genre}` : ""}`)}
              className={`px-4 py-2 rounded-[var(--ja-r-sm)] text-sm font-medium transition-all ${
                sort === s ? "bg-[var(--ja-purple)] text-white" : "bg-[var(--ja-surface)] text-[var(--ja-text-secondary)] hover:bg-[var(--ja-surface-hover)] hover:text-white"
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
            className="px-8 py-3 rounded-[var(--ja-r-md)] bg-[var(--ja-surface)] hover:bg-[var(--ja-surface-hover)] text-white font-medium transition-all disabled:opacity-50"
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