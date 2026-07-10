import { getMediaByStudio } from '@/lib/api';
import { Card } from '@/components/ui';
import { Container } from '@/components/layout/Container';

// ISR: pure content, no per-user data → CDN-cached shell (fast load + ~0 invocation).
// generateStaticParams (empty) is REQUIRED to opt a dynamic segment into ISR caching —
// revalidate alone leaves it fully dynamic. Empty = no build fetch, cache on first visit.
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

export default async function StudioSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contents = await getMediaByStudio(slug);

  return (
    <Container y="48px">
      <div className="mb-8">
        <div className="font-mono text-xs text-primary uppercase tracking-label">Studio</div>
        <h1 className="font-serif text-3xl font-semibold text-foreground capitalize mt-2">{slug.replace('-', ' ')}</h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{contents.length} titles</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-[2px] bg-hairline border border-border overflow-hidden">
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
    </Container>
  );
}
