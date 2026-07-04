import { getMediaBySlug, getChapters, getEpisodes, getMediaRelated } from '@/lib/api';
import { Badge, Button, Tabs, Gauge, Strip } from '@/components/ui';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function MediaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getMediaBySlug(slug);

  if (!content) notFound();

  const isVideo = ['anime', 'donghua', 'movie'].includes(content.type);
  const [items, related] = await Promise.all([
    isVideo ? getEpisodes(slug) : getChapters(slug),
    getMediaRelated(slug)
  ]);

  const tabs = [isVideo ? 'Episodes' : 'Chapters', 'Related', 'Reviews', 'Comments'];

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-96">
        {content.coverImage && <Image src={content.coverImage} alt={content.title} fill className="object-cover opacity-25" />}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
      </div>

      <div className="max-w-[1160px] mx-auto px-8 -mt-24 relative">
        <div className="flex gap-6 mb-8">
          <div className="w-32 shrink-0 aspect-[2/3] bg-surface relative shadow-2xl">
            {content.coverImage && <Image src={content.coverImage} alt={content.title} fill className="object-cover" />}
          </div>
          <div className="flex-1 pt-12">
            <h1 className="font-serif text-4xl font-semibold text-paper mb-4">{content.title}</h1>
            <div className="flex gap-3">
              <Badge variant="amber">{content.type}</Badge>
              {content.status && <Badge>{content.status}</Badge>}
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} />

        <div className="mt-8">
          <p className="text-muted leading-relaxed max-w-[640px] mb-8">{content.synopsis}</p>
          <Strip items={items.map((it: any, i: number) => ({
             number: `${isVideo ? 'EP' : 'CH'} ${it.episodeNumber || it.chapterNumber || i + 1}`,
             name: it.title || 'Untitled',
             href: `/media/${slug}/${isVideo ? 'episodes' : 'chapters'}/${it.slug}`
          }))} />
        </div>
      </div>
    </div>
  );
}
