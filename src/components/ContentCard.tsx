import Link from 'next/link';
import Image from 'next/image';
import { contentType, type Item } from '@/lib/db';

export function ContentCard({ item, index = 0 }: { item: Item; index?: number }) {
  const ct = contentType(item.type);
  const href = ct === 'movie' || ct === 'anime' ? `/watch/${item.slug}` : `/read/${item.slug}`;
  const topGenre = item.genres?.[0];

  return (
    <Link
      href={href}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[rgb(var(--color-bg-secondary))] ring-1 ring-[rgba(var(--color-fg-primary),0.06)] content-card">
        {item.cover_url ? (
          <Image
            src={item.cover_url}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-elevated))]">
            <svg className="w-14 h-14 text-[rgb(var(--color-fg-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* gradient + meta on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

        {/* top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          {item.status === 'ongoing' && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded bg-[rgb(var(--color-success))] text-black">
              Ongoing
            </span>
          )}
          {item.episode_count > 0 && (
            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded bg-black/60 backdrop-blur-sm text-white">
              EP {item.episode_count}
            </span>
          )}
        </div>

        {/* bottom title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs font-semibold text-[rgb(var(--color-fg-secondary))] mb-0.5 line-clamp-1">
            {topGenre ? `${topGenre} · ${item.release_year || 'TBA'}` : item.release_year ? String(item.release_year) : 'New'}
          </p>
          <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[rgb(var(--color-accent))] transition-colors drop-shadow">
            {item.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
