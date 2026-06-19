"use client";

import Link from "next/link";
import type { Episode } from "@/lib/api";

const READ_TYPES = new Set(["manga", "comic", "manhwa", "manhua", "novel"]);

export default function EpisodeList({ slug, episodes, mediaType = "anime" }: { slug: string; episodes: Episode[]; mediaType?: string }) {
  const isRead = READ_TYPES.has(mediaType);
  const prefix = isRead ? "/read" : "/stream";
  const unitLabel = isRead ? "Chapter" : "Episode";
  if (episodes.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--ja-text-muted)]">
        <p>No {unitLabel.toLowerCase()}s available yet.</p>
      </div>
    );
  }

  const sorted = [...episodes].sort((a, b) => (a.unit_number || 0) - (b.unit_number || 0));

  return (
    <div className="grid gap-2">
      {sorted.map(ep => (
        <Link
          key={ep.unit_key}
          href={`${prefix}/${slug}/${ep.unit_key}`}
          className="flex items-center gap-4 p-4 rounded-[var(--ja-r-md)] bg-[var(--ja-surface)] hover:bg-[var(--ja-surface-hover)] border border-[var(--ja-border)] hover:border-[var(--ja-purple)/0.3] transition-all duration-[var(--ja-normal)] group"
        >
          <div className="w-10 h-10 rounded-[var(--ja-r-sm)] bg-[var(--ja-purple)/0.2] flex items-center justify-center shrink-0 group-hover:bg-[var(--ja-purple)/0.4] transition-colors">
            <svg className="w-5 h-5 text-[var(--ja-purple)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{unitLabel} {ep.unit_number || "?"}</p>
            <p className="text-xs text-[var(--ja-text-secondary)] truncate">{ep.title}</p>
          </div>
          <svg className="w-5 h-5 text-[var(--ja-text-muted)] group-hover:text-[var(--ja-purple)] shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      ))}
    </div>
  );
}
