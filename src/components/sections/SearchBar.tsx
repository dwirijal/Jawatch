'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mediaHref } from '@/lib/mediaHref';
import { suggestMedia } from '@/lib/localApi';

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ title: string; type: string; slug: string; provider?: string }>>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: / to focus
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await suggestMedia(q, 8);
        setSuggestions(items);
        setOpen(items.length > 0);
        setHighlight(-1);
      } catch { setSuggestions([]); }
    }, 200);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelect = (item: { title: string; type: string; slug: string }) => {
    setOpen(false);
    setQuery('');
    router.push(mediaHref(item.slug, item.type));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); handleSelect(suggestions[highlight]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={wrapRef} className="relative flex-1">
      <form onSubmit={handleSubmit} className="relative transition-all duration-300 focus-within:max-w-[520px] max-w-[420px]">
        <div className="relative">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            name="q"
            type="search"
            placeholder="Search titles…  (press /)"
            aria-label="Search titles"
            aria-expanded={open}
            aria-autocomplete="list"
            role="combobox"
            className="w-full bg-card border border-border rounded-page px-3.5 py-2 text-body font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-[2px] focus:ring-primary/25 focus:shadow-[0_0_16px_oklch(var(--primary)/0.25)] transition-all duration-250"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full max-w-[520px] rounded-card border border-border bg-card shadow-lg overflow-hidden">
          {suggestions.map((item, i) => (
            <li
              key={`${item.slug}-${i}`}
              role="option"
              aria-selected={highlight === i}
              onMouseDown={() => handleSelect(item)}
              onMouseEnter={() => setHighlight(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm transition-colors ${highlight === i ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
            >
              <span className="truncate font-mono">{item.title}</span>
              <span className="ml-auto shrink-0 rounded-pill border border-border px-1.5 py-0.5 font-mono text-micro uppercase text-muted-foreground">{item.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
