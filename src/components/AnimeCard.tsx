"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnimeCard } from "@/lib/api";
import { coverUrl, statusColor } from "@/lib/api";

export default function AnimeCardView({ anime }: { anime: AnimeCard }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link href={`/stream/${anime.slug}`} className="anime-card block group">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#141428]">
        <img
          src={imgFailed ? "/placeholder-cover.jpg" : coverUrl(anime)}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white ${statusColor(anime.status)}`}>
          {anime.status || "Unknown"}
        </span>
        {anime.score != null && anime.score > 0 && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-black/60 text-yellow-400">
            ★ {anime.score.toFixed(1)}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">{anime.title}</h3>
          <p className="text-xs text-gray-300 mt-1 line-clamp-1">
            {anime.genres?.slice(0, 3).join(" · ") || anime.entry_kind || "Anime"}
          </p>
        </div>
      </div>
    </Link>
  );
}