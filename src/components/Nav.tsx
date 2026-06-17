"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { searchAnime } from "@/lib/api";

export default function Nav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  async function handleChange(val: string) {
    setQuery(val);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    try {
      const items = await searchAnime(val);
      setResults(items.slice(0, 6));
      setOpen(items.length > 0);
    } catch { setOpen(false); }
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
          <span className="text-purple-500">JA</span>
          <span className="text-white">WATCH</span>
        </Link>

        <div className="hidden sm:flex gap-1 text-sm ml-4">
          <Link href="/" className="px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link href="/browse" className="px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">Browse</Link>
          <Link href="/browse?sort=latest" className="px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">Latest</Link>
        </div>

        <div className="flex-1" />

        <div ref={ref} className="relative w-full max-w-md">
          <form onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search anime..."
              value={query}
              onChange={e => handleChange(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </form>
          {open && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#141428] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {results.map((item: any) => (
                <Link
                  key={item.item_key}
                  href={`/stream/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <img src={item.cover_url?.startsWith("//") ? `https:${item.cover_url}` : item.cover_url || "/placeholder-cover.jpg"} alt="" className="w-10 h-14 rounded object-cover shrink-0 bg-[#1e1e3a]" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.genres?.slice(0, 3).join(", ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}