"use client";

import { useState } from "react";
import Image from "next/image";

export default function PosterImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const finalSrc = failed ? "/placeholder-cover.jpg" : src;

  // Fallback to regular img for invalid URLs
  if (!finalSrc.startsWith("http") && !finalSrc.startsWith("/")) {
    return <img src={finalSrc} alt={alt} className={className} />;
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      className={className}
      width={192}
      height={288}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      priority={false}
      onError={() => setFailed(true)}
      style={{ objectFit: "cover" }}
    />
  );
}