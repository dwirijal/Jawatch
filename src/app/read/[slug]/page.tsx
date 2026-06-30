import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getItem, getEpisodes, contentType } from '@/lib/db';

export const revalidate = 300;

export default async function ReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item) notFound();
  const episodes = await getEpisodes(slug);
  const ct = contentType(item.type);

  // TV/movie content has no pages — point readers at the watch experience.
  if (ct === 'anime' || ct === 'movie') {
    return (
      <div className="min-h-screen container mx-auto px-4 md:px-8 py-16 text-center">
        <div className="relative w-48 mx-auto aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10">
          {item.cover_url && <Image src={item.cover_url} alt={item.title} fill className="object-cover" sizes="192px" />}
        </div>
        <h1 className="heading-display text-3xl md:text-5xl text-white mb-3">{item.title}</h1>
        <p className="text-[rgb(var(--color-fg-secondary))] mb-8 max-w-md mx-auto">
          This title is a {ct}. Read its chapters or watch episodes instead.
        </p>
        <Link href={`/watch/${item.slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] text-white font-bold rounded-lg transition-colors">
          Go to Watch Page →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 md:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs text-[rgb(var(--color-fg-muted))] mb-6">
        <Link href="/" className="hover:text-[rgb(var(--color-fg-primary))]">Home</Link>
        <span>/</span>
        <span className="capitalize text-[rgb(var(--color-fg-secondary))]">{ct}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-shrink-0">
          <div className="relative w-40 md:w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {item.cover_url && <Image src={item.cover_url} alt={item.title} fill className="object-cover" sizes="192px" priority />}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="heading-display text-3xl md:text-5xl text-white mb-4">{item.title}</h1>
          {item.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.genres.map(g => (
                <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className="px-2.5 py-1 text-xs rounded-full bg-[rgba(var(--color-fg-primary),0.06)] text-[rgb(var(--color-fg-secondary))] hover:text-white hover:bg-[rgb(var(--color-accent))] transition-colors">{g}</Link>
              ))}
            </div>
          )}
          <p className="text-[rgb(var(--color-fg-secondary))] leading-relaxed max-w-2xl">{item.synopsis || 'No synopsis available.'}</p>
        </div>
      </div>

      {episodes.length > 0 ? (
        <section>
          <h2 className="heading-section text-2xl md:text-3xl text-[rgb(var(--color-fg-primary))] mb-6">Chapters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {episodes.map(ep => (
              <div key={ep.id} className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(var(--color-fg-primary),0.03)] ring-1 ring-[rgba(var(--color-fg-primary),0.06)]">
                <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-bg-elevated))] flex items-center justify-center font-bold text-[rgb(var(--color-accent))]">{Math.floor(ep.number)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[rgb(var(--color-fg-primary))] truncate">{ep.title || `Chapter ${Math.floor(ep.number)}`}</p>
                  <p className="text-xs text-[rgb(var(--color-fg-muted))]">Available</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">No Chapters Yet</h2>
          <p className="text-[rgb(var(--color-fg-secondary))]">Chapters haven't been indexed for this title.</p>
        </div>
      )}
    </div>
  );
}
