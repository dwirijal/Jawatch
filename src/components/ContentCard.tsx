'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Media } from '@/lib/api';

export function ContentCard({ content }: { content: Media }) {
  const isNew = new Date(content.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={content.type === 'anime' || content.type === 'donghua' || content.type === 'movie' ? `/watch/${content.slug}` : `/read/${content.slug}`}
      className="group block"
    >
      <div className="aspect-[2/3] bg-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden mb-3 relative">
        {content.coverImage && !imgError ? (
          <Image
            src={content.coverImage}
            alt={content.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-elevated))]">
            <svg className="w-16 h-16 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isNew && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-[rgb(var(--color-success))] text-[rgb(var(--color-fg-primary))] text-xs font-bold rounded">
            NEW
          </div>
        )}
      </div>
      <h3 className="text-[rgb(var(--color-fg-primary))] font-semibold text-sm line-clamp-2">{content.title}</h3>
      <p className="text-[rgb(var(--color-fg-secondary))] text-xs mt-1">{new Date(content.createdAt).getFullYear()}</p>
    </Link>
  );
}
