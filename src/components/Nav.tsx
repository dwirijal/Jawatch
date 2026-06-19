"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { searchAnime, coverUrl, type AnimeCard } from "@/lib/api";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Anime" },
  { href: "/browse?type=manga", label: "Manga" },
  { href: "/browse?sort=latest", label: "Latest" },
];

export default function Nav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeCard[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
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
    setMobileMenu(false);
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
    <nav className="glass sticky top-0 z-50 border-b border-[var(--ja-border)]" aria-label="Main navigation">
      <div className="max-w-[var(--ja-content-max)] mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight shrink-0 group">
          <span className="text-[var(--ja-purple)] group-hover:text-[var(--ja-purple-hover)] transition-colors">JA</span>
          <span className="text-white">WATCH</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex gap-1 text-sm ml-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-[var(--ja-r-sm)] hover:bg-[var(--ja-surface)] text-[var(--ja-text-secondary)] hover:text-white transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div ref={ref} className="relative w-full max-w-md">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ja-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="search"
                placeholder="Search anime..."
                aria-label="Search anime"
                value={query}
                onChange={e => handleChange(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--ja-surface)] border border-[var(--ja-border)] rounded-[var(--ja-r-md)] text-sm text-white placeholder-[var(--ja-text-muted)] focus:outline-none focus:border-[var(--ja-purple)] focus:bg-[var(--ja-surface-hover)] transition-all"
              />
            </div>
          </form>

          {/* Search results dropdown */}
          {open && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[var(--ja-surface)] border border-[var(--ja-border)] rounded-[var(--ja-r-lg)] overflow-hidden shadow-[var(--ja-shadow-card)] animate-scale-in">
              {results.map((item) => (
                <Link
                  key={item.item_key}
                  href={`/stream/${item.slug}`}
                  onClick={() => { setOpen(false); setMobileMenu(false); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--ja-surface-hover)] transition-colors"
                >
                  <img
                    src={coverUrl(item)}
                    alt=""
                    className="w-10 h-14 rounded-[var(--ja-r-sm)] object-cover shrink-0 bg-[var(--ja-surface-raised)]"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-[var(--ja-text-secondary)] truncate">
                      {item.genres?.slice(0, 3).join(", ") || item.media_type}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="sm:hidden p-2 rounded-[var(--ja-r-sm)] hover:bg-[var(--ja-surface)] transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenu ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="sm:hidden border-t border-[var(--ja-border)] animate-fade-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className="block px-3 py-2.5 rounded-[var(--ja-r-sm)] hover:bg-[var(--ja-surface)] text-[var(--ja-text-secondary)] hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
