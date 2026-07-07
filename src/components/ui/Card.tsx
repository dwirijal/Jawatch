'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function Card({
  href,
  kind,
  title,
  meta,
  rating,
  coverImage,
  isNew,
}: {
  href: string;
  kind: string;
  title: string;
  meta?: string;
  rating?: number;
  coverImage?: string;
  isNew?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={href} className="group relative aspect-[2/3] overflow-hidden bg-card block transition-all duration-300 hover:-translate-y-1">
      {/* Poster bg */}
      {coverImage && !imgError ? (
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width:640px) 50vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgError(true)}
          unoptimized
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-card" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-all duration-300 group-hover:from-background/95 group-hover:via-background/30" />

      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.07] transition-opacity" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
        backgroundSize: '256px 256px',
      }} />

      {/* Subtle border outline */}
      <div className="absolute inset-0 border border-transparent group-hover:border-amber/20 transition-colors duration-300 pointer-events-none z-20" />

      {/* Perforation line - top */}
      <div className="absolute top-2 left-2 right-2 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, #E8A33D 0 3px, transparent 3px 6px)' }} />

      {/* Perforation line - bottom */}
      <div className="absolute bottom-[72px] left-2 right-2 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, #E8A33D 0 3px, transparent 3px 6px)' }} />

      {/* New badge */}
      {isNew && (
        <span className="absolute top-2 right-2 font-mono text-[9px] tracking-[.07em] uppercase px-[6px] py-[2px] bg-amber text-void rounded-[2px] z-10 text-shadow-sm font-semibold">
          New
        </span>
      )}

      {/* Rating badge */}
      {rating && rating > 0 && (
        <span className="absolute top-2 left-2 font-mono text-[9px] tracking-[.05em] px-[6px] py-[2px] bg-void/80 backdrop-blur-sm text-amber rounded-[2px] z-10 border border-hairline/80">
          ★ {rating.toFixed(1)}
        </span>
      )}

      {/* Bottom info */}
      <div className="absolute left-0 right-0 bottom-0 p-3 z-10 bg-gradient-to-t from-void via-void/40 to-transparent">
        <div className="font-mono text-[9px] tracking-[.1em] uppercase text-teal-bright font-semibold">{kind}</div>
        <div className="font-serif font-medium text-[13.5px] leading-tight mt-1 text-paper line-clamp-2 group-hover:line-clamp-none transition-all duration-200">{title}</div>
        {meta && <div className="font-mono text-[9px] text-muted mt-1">{meta}</div>}
      </div>
    </Link>
  );
}