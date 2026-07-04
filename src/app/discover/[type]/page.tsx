import { getMedia } from '@/lib/api';
import { Card } from '@/components/ui';
import { notFound } from 'next/navigation';

export default async function DiscoverTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const validTypes = ['anime', 'manga', 'movie', 'donghua', 'comic', 'novel'];

  if (!validTypes.includes(type)) {
    notFound();
  }

  const { data: contents } = await getMedia(type, 1, 60);

  return (
    <div className="max-w-[1160px] mx-auto px-8 py-12">
      <div className="mb-8">
        <div className="font-mono text-xs text-amber uppercase tracking-[.1em]">Discover</div>
        <h1 className="font-serif text-3xl font-semibold text-paper capitalize mt-2">{type}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-[2px] bg-hairline border border-hairline overflow-hidden">
        {contents.map((item) => (
          <Card
            key={item.slug}
            href={(item.type === 'anime' || item.type === 'donghua' || item.type === 'movie') ? `/watch/${item.slug}` : `/read/${item.slug}`}
            kind={item.type}
            title={item.title}
            coverImage={item.coverImage}
          />
        ))}
      </div>
    </div>
  );
}
