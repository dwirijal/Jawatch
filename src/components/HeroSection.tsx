"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { browse, coverUrl, type AnimeCard } from "@/lib/api";
import { Button, LinkButton } from "./atoms/Button";
import { HeroSkeleton } from "./atoms/Skeleton";

export default function HeroSection() {
  const [featured, setFeatured] = useState<AnimeCard | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    browse({ media_type: "anime", sort: "popular", limit: 5 })
      .then(r => {
        if (r.items.length > 0) setFeatured(r.items[0]);
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <section className="relative w-full h-[50vh] min-h-[300px] max-h-[500px] bg-[var(--ja-surface)] flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-[var(--ja-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Tidak dapat memuat konten</h2>
          <p className="text-[var(--ja-text-secondary)] text-sm">Pastikan koneksi internet stabil, lalu coba lagi.</p>
          <Button className="mt-6" onClick={() => window.location.reload()}>Muat Ulang</Button>
        </div>
      </section>
    );
  }

  if (!featured) return <HeroSkeleton />;

  return (
    <section className="relative w-full h-[75vh] min-h-[500px] max-h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={coverUrl(featured)}
          alt=""
          className="w-full h-full object-cover scale-105"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ja-bg)] via-[var(--ja-bg)/60] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ja-bg)/95] via-[var(--ja-bg)/40] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ja-bg)]" />
      </div>

      <div className="relative z-10 h-full max-w-[var(--ja-content-max)] mx-auto px-4 flex flex-col justify-end pb-20 animate-fade-up">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--ja-purple)/0.9] backdrop-blur-sm text-white text-sm font-medium mb-6 shadow-[var(--ja-shadow-glow)]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Trending This Week
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.1] drop-shadow-2xl">
            {featured.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-200 mb-8 line-clamp-2 drop-shadow-lg">
            {featured.genres?.join(" · ") || "Anime"}
          </p>

          <div className="flex flex-wrap gap-3">
            <LinkButton href={`/stream/${featured.slug}`} size="lg" aria-label={`Watch ${featured.title}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
              Watch Now
            </LinkButton>
            <LinkButton href="/browse" variant="secondary" size="lg">
              Browse All
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
