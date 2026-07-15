'use client';

import Link from 'next/link';
import Image from '@/components/ui/RefererImage';
import { useState, type PointerEvent } from 'react';
import { Media, decodeMediaRef, buildMediaLink } from '@/lib/api';

export function ContentCard({ content }: { content: Media }) {
  const isNew = new Date(content.createdAt).getTime() > Date.now() - 7 * 86400000;
  const [imgError, setImgError] = useState(false);
  const ref = decodeMediaRef(content.slug);
  const href = ref ? buildMediaLink(ref) : `/media/${content.slug}`;

  // ponytail: reactbits-style SpotlightCard — pointer-follow glow via CSS vars.
  // Fine-pointer only (no touch/keyboard cost), token-colored, opacity gated by
  // group-hover so it costs nothing at rest and needs no reduced-motion handling.
  const handlePointer = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <Link href={href} className="group block motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1">
      <div
        onPointerMove={handlePointer}
        className="aspect-[2/3] bg-card rounded-card overflow-hidden mb-2 relative motion-safe:transition-shadow motion-safe:duration-300 group-hover:shadow-lg group-hover:shadow-background/50"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-base group-hover:opacity-100"
          style={{ background: 'radial-gradient(180px circle at var(--mx) var(--my), oklch(var(--primary) / 0.18), transparent 60%)' }}
        />
        {content.coverImage && !imgError ? (
          <Image
            src={content.coverImage}
            alt={content.title}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
            className="object-cover motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-surface">
            <svg className="w-10 h-10 text-muted-foreground opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isNew && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-teal text-foreground text-eyebrow font-bold rounded">NEW</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
          <span className="text-foreground text-tag font-bold uppercase">{content.type}</span>
        </div>
      </div>
      <h3 className="text-foreground font-medium text-xs sm:text-sm line-clamp-2 leading-tight transition-colors group-hover:text-primary">{content.title}</h3>
    </Link>
  );
}
