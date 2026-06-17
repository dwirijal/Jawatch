"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { browse, coverUrl, type AnimeCard } from "@/lib/api";

export default function HeroSection() {
  const [featured, setFeatured] = useState<AnimeCard | null>(null);

  useEffect(() => {
    browse({ media_type: "anime", sort: "popular", limit: 5 }).then(r => {
      if (r.items.length > 0) setFeatured(r.items[0]);
    }).catch(() => {});
  }, []);

  if (!featured) return <HeroSkeleton />;

  return (
    <section className="relative w-full h-[75vh] min-h-[500px] max-h-[700px] overflow-hidden">
      <img src={coverUrl(featured)} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-transparent" />
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-20">
        <div className="max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-600/80 text-white mb-4">Trending This Week</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">{featured.title}</h1>
          <p className="text-sm sm:text-base text-gray-300 mb-6 line-clamp-2">{featured.genres?.join(" · ") || "Anime"}</p>
          <div className="flex gap-3">
            <Link href={`/stream/${featured.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all hover:scale-105">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
              Watch Now
            </Link>
            <Link href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10">
              Browse All
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="w-full h-[75vh] min-h-[500px] max-h-[700px] bg-[#141428]">
      <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-20">
        <div className="skeleton h-6 w-32 mb-4" />
        <div className="skeleton h-12 w-96 mb-3" />
        <div className="skeleton h-5 w-64 mb-6" />
        <div className="flex gap-3">
          <div className="skeleton h-12 w-36 rounded-xl" />
          <div className="skeleton h-12 w-36 rounded-xl" />
        </div>
      </div>
    </section>
  );
}