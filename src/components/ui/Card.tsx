'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function Card({
  href,
  kind,
  title,
  meta,
  coverImage,
  isNew,
}: {
  href: string;
  kind: string;
  title: string;
  meta?: string;
  coverImage?: string;
  isNew?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={href} className="group relative aspect-[2/3] overflow-hidden bg-void block">
      {/* Poster bg */}
      {coverImage && !imgError ? (
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width:640px) 50vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2530] to-[#141318]" />
      )}

      {/* Film grain overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-void/92 via-void/10 to-transparent transition-all duration-200 group-hover:from-void/97 group-hover:via-void/35" />

      {/* Perforation on hover */}
      <div
        className="absolute top-[10px] left-[10px] right-[10px] h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(242,239,233,.35) 0 4px, transparent 4px 8px)' }}
      />

      {/* New badge */}
      {isNew && (
        <span className="absolute top-1.5 right-1.5 font-mono text-[9px] tracking-[.07em] uppercase px-[6px] py-[2px] bg-amber text-void rounded-[2px]">
          New
        </span>
      )}

      {/* Bottom info */}
      <div className="absolute left-0 right-0 bottom-0 p-3">
        <div className="font-mono text-[9.5px] tracking-[.1em] uppercase text-amber">{kind}</div>
        <div className="font-serif font-medium text-[14.5px] leading-tight mt-1 text-paper line-clamp-2">{title}</div>
        {meta && <div className="font-mono text-[10px] text-muted mt-1.5">{meta}</div>}
      </div>
    </Link>
  );
}
