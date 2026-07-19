'use client';

import { useEffect, useRef } from 'react';

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <form action="/search" className="relative flex-1" suppressHydrationWarning>
      <div className="relative transition-all duration-300 focus-within:max-w-[520px] max-w-[420px]">
        <input
          suppressHydrationWarning
          ref={inputRef}
          name="q"
          type="search"
          placeholder="Search titles…  (press /)"
          aria-label="Search titles"
          className="w-full bg-card border border-border rounded-page px-3.5 py-2 text-body font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-[2px] focus:ring-primary/25 focus:shadow-[0_0_16px_oklch(var(--primary)/0.25)] transition-all duration-250"
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </form>
  );
}
