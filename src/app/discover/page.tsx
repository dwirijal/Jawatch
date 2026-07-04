import { getMedia } from '@/lib/api';
import { Card } from '@/components/ui';

export default async function DiscoverPage() {
  const { data: contents } = await getMedia(undefined, 1, 60);

  return (
    <div className="max-w-[1160px] mx-auto px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-paper">Discover</h1>
          <p className="font-mono text-xs text-muted mt-2">Jelajahi seluruh koleksi media jawatch</p>
        </div>
        <div className="flex gap-2">
          {['anime', 'manga', 'movie', 'donghua', 'comic', 'novel'].map((t) => (
            <a
              key={t}
              href={`/discover/${t}`}
              className="font-mono text-[11px] uppercase tracking-[.06em] border border-hairline px-3 py-1.5 hover:border-amber hover:text-amber transition-colors"
            >
              {t}
            </a>
          ))}
        </div>
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
