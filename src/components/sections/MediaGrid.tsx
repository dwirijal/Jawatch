'use client';
import { Card } from '@/components/ui';
import type { Media } from '@/lib/api';
import { motion } from 'motion/react';

// ─── client-safe mediaHref (no server-only api.ts dependency) ───
function mediaHref(slug: string): string {
  // Handle canonical "type/slug" refs from local DB
  if (slug.includes('/')) {
    const parts = slug.split('/');
    if (parts.length === 2) return `/media/${parts[1]}?type=${parts[0]}`;
  }
  return `/media/${slug}`;
}

// ─── Stagger wrapper for media grids ───
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type MediaGridProps = {
  items: Media[];
  limit?: number;
};

export function MediaGrid({ items, limit }: MediaGridProps) {
  const visibleItems = typeof limit === 'number' ? items.slice(0, limit) : items;

  return (
    <motion.div
      className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-hairline sm:grid-cols-3 md:grid-cols-5 rounded-page shadow-lg shadow-black/50"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {visibleItems.length === 0 ? (
        <div className="col-span-full py-16 text-center">
          <p className="text-sm text-muted-foreground">No titles found.</p>
        </div>
      ) : (
        visibleItems.map((item) => (
          <motion.div
            key={item.slug}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT_EXPO } },
            }}
          >
            <Card
              href={mediaHref(item.slug)}
              kind={item.type}
              title={item.title}
              rating={item.rating?.average}
              coverImage={item.coverImage}
            />
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
