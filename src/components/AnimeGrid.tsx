"use client";

import { useEffect, useState } from "react";
import { browse, type AnimeCard } from "@/lib/api";
import AnimeCardView from "./AnimeCard";
import { CardSkeleton } from "./atoms/Skeleton";

export default function AnimeGrid({ title, icon, sort, genre, limit = 12 }: {
  title: string;
  icon?: React.ReactNode;
  sort?: string;
  genre?: string;
  limit?: number;
}) {
  const [anime, setAnime] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    browse({ media_type: "anime", sort, genre, limit })
      .then(r => {
        setAnime(r.items);
        if (r.items.length === 0) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sort, genre, limit]);

  return (
    <section className="py-8">
      <div className="max-w-[var(--ja-content-max)] mx-auto px-4">
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          {icon && <span className="text-[var(--ja-purple)]">{icon}</span>}
          <span>{title}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[var(--ja-border)] to-transparent ml-4" />
        </h2>
        {error ? (
          <div className="text-center py-12">
            <p className="text-[var(--ja-text-secondary)]">Tidak ada anime ditemukan</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {anime.map(item => <AnimeCardView key={item.item_key} anime={item} />)}
          </div>
        )}
      </div>
    </section>
  );
}
