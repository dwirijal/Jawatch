"use client";

import Link from "next/link";
import type { Episode } from "@/lib/api";

export default function EpisodeList({ slug, episodes }: { slug: string; episodes: Episode[] }) {
  if (episodes.length === 0) {
    return <div className="text-center py-12 text-gray-500"><p>No episodes available yet.</p></div>;
  }

  const sorted = [...episodes].sort((a, b) => (a.unit_number || 0) - (b.unit_number || 0));

  return (
    <div className="grid gap-2">
      {sorted.map(ep => (
        <Link
          key={ep.unit_key}
          href={`/stream/${slug}/${ep.unit_key}`}
          className="flex items-center gap-4 p-4 rounded-xl bg-[#141428] hover:bg-[#1e1e3a] border border-white/5 hover:border-purple-500/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600/40 transition-colors">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Episode {ep.unit_number || "?"}</p>
            <p className="text-xs text-gray-400 truncate">{ep.title}</p>
          </div>
          <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      ))}
    </div>
  );
}