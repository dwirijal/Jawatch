import { Card } from '@/components/ui';
import type { Media } from '@/lib/api';

export function mediaHref(item: Pick<Media, 'slug'>): string {
  return `/media/${item.slug}`;
}

type MediaGridProps = {
  items: Media[];
  limit?: number;
};

export function MediaGrid({ items, limit }: MediaGridProps) {
  const visibleItems = typeof limit === 'number' ? items.slice(0, limit) : items;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-3 md:grid-cols-5 rounded-[4px] shadow-lg shadow-black/50">
      {visibleItems.map((item) => (
        <Card
          key={item.slug}
          href={mediaHref(item)}
          kind={item.type}
          title={item.title}
          rating={item.rating?.average}
          coverImage={item.coverImage}
        />
      ))}
    </div>
  );
}
