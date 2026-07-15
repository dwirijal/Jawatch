'use client';

import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

// Domains that require a Referer header — use native <img> to bypass
// Next.js server-side fetch (which lacks the correct Referer).
const BLOCKED_DOMAINS = new Set([
  'sakuranovel.id',
  'cdnkomikindo.xyz',
]);

function isBlockedDomain(src: string): boolean {
  try {
    const u = new URL(src);
    return BLOCKED_DOMAINS.has(u.hostname);
  } catch {
    return false;
  }
}

interface NativeImgProps {
  className?: string;
  style?: React.CSSProperties;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  [key: string]: unknown;
}

export default function RefererImage(props: Props & Partial<NativeImgProps>) {
  const { src, alt, fill, priority, sizes, className, style, ...rest } = props;

  // Blocked domain → native <img> so browser sends correct Referer
  if (isBlockedDomain(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        referrerPolicy="strict-origin-when-cross-origin"
        style={
          fill
            ? { objectFit: 'cover', width: '100%', height: '100%', ...style }
            : style
        }
        {...(rest as NativeImgProps)}
      />
    );
  }

  // Normal: use Next.js optimized Image
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      style={style}
      {...(rest as Omit<React.ComponentProps<typeof Image>, keyof Props>)}
    />
  );
}
