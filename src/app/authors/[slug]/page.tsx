import { getMediaByAuthor } from '@/lib/api';
import { Card } from '@/components/ui';

export default async function AuthorSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contents = await getMediaByAuthor(slug);

  return (
    <div className="max-w-[1160px] mx-auto px-8 py-12">
      <div className="mb-8">
        <div className="font-mono text-xs text-amber uppercase tracking-[.1em]">Author</div>
        <h1 className="font-serif text-3xl font-semibold text-paper capitalize mt-2">{slug.replace('-', ' ')}</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-[2px] bg-hairline border border-hairline overflow-hidden">
        {contents.map((item) => (
          <Card
            key={item.slug}
            href={`/media/${item.slug}`}
            kind={item.type}
            title={item.title}
            coverImage={item.coverImage}
          />
        ))}
      </div>
    </div>
  );
}
