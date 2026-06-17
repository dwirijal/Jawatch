"use client";

import { useState } from "react";

export default function PosterImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? "/placeholder-cover.jpg" : src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}