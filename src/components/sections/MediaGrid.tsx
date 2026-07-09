import { Card } from '@/components/ui';
import type { Media } from '@/lib/api';
import { decodeMediaRef, buildMediaLink } from '@/lib/api';

export function mediaHref(item: Pick<Media, 'slug'>): string {
  const ref = decodeMediaRef(item.slug);
  if (!ref) return `/media/${item.slug}`;
  return buildMediaLink(ref);
}

type MediaGridProps = {
  items: Media[];
  limit?: number;
};

export function MediaGrid({ items, limit }: MediaGridProps) {
  const visibleItems = typeof limit === 'number' ? items.slice(0, limit) : items;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-hairline sm:grid-cols-3 md:grid-cols-5 rounded-page shadow-lg shadow-black/50">
      {visibleItems.length === 0 ? (
        <div className="col-span-full py-16 text-center">
          <p className="text-sm text-muted-foreground">No titles found.</p>
        </div>
      ) : (
        visibleItems.map((item) => (
          <Card
            key={item.slug}
            href={mediaHref(item)}
            kind={item.type}
            title={item.title}
            rating={item.rating?.average}
            coverImage={item.coverImage}
          />
        ))
      )}
    </div>
  );
}
