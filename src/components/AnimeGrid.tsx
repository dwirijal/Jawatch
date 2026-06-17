"use client";

import { useEffect, useState } from "react";
import { browse, type AnimeCard } from "@/lib/api";
import AnimeCardView from "./AnimeCard";

export default function AnimeGrid({ title, sort, genre, limit = 12 }: {
  title: string;
  sort?: string;
  genre?: string;
  limit?: number;
}) {
  const [anime, setAnime] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    browse({ media_type: "anime", sort, genre, limit })
      .then(r => setAnime(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, genre, limit]);

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-white mb-5">{title}</h2>
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
      </div>
    </section>
  );
}