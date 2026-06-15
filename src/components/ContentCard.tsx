'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Content } from '@/lib/api';

export function ContentCard({ content }: { content: Content }) {
  const isNew = new Date(content.scraped_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={content.content_type === 'anime' ? `/watch/${content.id}` : `/read/${content.id}`}
      className="group block"
    >
      <div className="aspect-[2/3] bg-slate-800 rounded-lg overflow-hidden mb-3 relative">
        {content.cover_url && !imgError ? (
          <Image
            src={content.cover_url}
            alt={content.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isNew && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
            NEW
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="text-white">
            <p className="text-sm font-semibold">
              {content.content_type === 'anime' ? 'Watch Now' : 'Read Now'}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {content.content_type === 'anime' ? 'Stream episodes' : 'Start reading'}
            </p>
          </div>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-500 transition-colors">
        {content.title}
      </h3>
    </Link>
  );
}
