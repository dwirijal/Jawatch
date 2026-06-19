"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnimeCard } from "@/lib/api";
import { coverUrl, contentUrl } from "@/lib/api";
import { Badge, statusBadge } from "./atoms/Badge";

export default function AnimeCardView({ anime }: { anime: AnimeCard }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link href={contentUrl(anime)} className="block group">
      <div className="relative aspect-[3/4] rounded-[var(--ja-r-lg)] overflow-hidden bg-[var(--ja-surface)] shadow-[var(--ja-shadow-card)] transition-all duration-[var(--ja-normal)] ease-[var(--ja-ease-out)] group-hover:shadow-[var(--ja-shadow-card-hover)] group-hover:scale-[1.03] group-hover:z-10">
        <img
          src={imgFailed ? "/placeholder-cover.jpg" : coverUrl(anime)}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-[var(--ja-slow)] ease-[var(--ja-ease-out)] group-hover:scale-110"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
          {anime.score != null && anime.score > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-black/70 text-[var(--ja-gold)] backdrop-blur-sm">
              ★ {anime.score.toFixed(1)}
            </span>
          )}
          <Badge tone={statusBadge(anime.status)} className="ml-auto">
            {anime.status || "Unknown"}
          </Badge>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Genre badges */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {anime.genres.slice(0, 2).map(genre => (
                <span key={genre} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--ja-purple)/0.3] text-white backdrop-blur-sm">
                  {genre}
                </span>
              ))}
            </div>
          )}
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1 drop-shadow-lg">
            {anime.title}
          </h3>
          <p className="text-xs text-gray-300 line-clamp-1 drop-shadow">
            {anime.genres?.slice(0, 3).join(" · ") || anime.entry_kind || "Anime"}
          </p>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-t from-[var(--ja-purple)]/20 via-transparent to-transparent" />
      </div>
    </Link>
  );
}
