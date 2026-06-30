import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getItem, getEpisodes, contentType } from '@/lib/db';
import { ContentCard } from '@/components/ContentCard';
import { getItems } from '@/lib/db';

export const revalidate = 300;

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item) notFound();

  const episodes = await getEpisodes(slug);
  const [{ rows: related }] = await Promise.all([getItems({ genre: item.genres[0], limit: 8 })]);
  const relatedFiltered = related.filter(r => r.slug !== slug).slice(0, 6);

  const hasStream = episodes.some(e => e.stream_url);
  const current = episodes[0];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={item.cover_url || 'https://images.unsplash.com/photo-1578632767115-35f5973e7e5b?w=1600'}
          alt={item.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-[rgba(10,10,10,0.6)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-bg-primary))] via-[rgba(10,10,10,0.4)] to-transparent" />
      </section>

      {/* Info */}
      <section className="container mx-auto px-4 md:px-8 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-40 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image src={item.cover_url || ''} alt={item.title} fill className="object-cover" sizes="224px" />
            </div>
          </div>

          <div className="flex-1 pt-4 md:pt-32">
            <nav className="flex items-center gap-2 text-xs text-[rgb(var(--color-fg-muted))] mb-3">
              <Link href="/" className="hover:text-[rgb(var(--color-fg-primary))]">Home</Link>
              <span>/</span>
              <span className="capitalize text-[rgb(var(--color-fg-secondary))]">{contentType(item.type)}</span>
            </nav>
            <h1 className="heading-display text-3xl md:text-5xl text-white mb-4">{item.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded bg-[rgb(var(--color-accent))] text-white capitalize">{item.type}</span>
              {item.status === 'ongoing' && (
                <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-[rgb(var(--color-success))] text-black">Ongoing</span>
              )}
              {item.release_year > 0 && <span className="text-[rgb(var(--color-fg-secondary))]">{item.release_year}</span>}
              {episodes.length > 0 && <span className="text-[rgb(var(--color-fg-secondary))]">· {episodes.length} Episodes</span>}
              {item.score > 0 && <span className="text-[rgb(var(--color-fg-secondary))]">· ★ {item.score.toFixed(1)}</span>}
            </div>

            {item.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {item.genres.map(g => (
                  <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className="px-2.5 py-1 text-xs rounded-full bg-[rgba(var(--color-fg-primary),0.06)] text-[rgb(var(--color-fg-secondary))] hover:text-white hover:bg-[rgb(var(--color-accent))] transition-colors">
                    {g}
                  </Link>
                ))}
              </div>
            )}

            <p className="text-[rgb(var(--color-fg-secondary))] text-sm md:text-base leading-relaxed max-w-2xl mb-6 line-clamp-3">
              {item.synopsis || 'No synopsis available for this title.'}
            </p>

            {current?.stream_url && (
              <a
                href={current.stream_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] text-white font-bold rounded-lg transition-colors shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                Watch Episode 1
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Episodes */}
      {episodes.length > 0 ? (
        <section className="container mx-auto px-4 md:px-8 py-12">
          <h2 className="heading-section text-2xl md:text-3xl text-[rgb(var(--color-fg-primary))] mb-6">Episodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {episodes.map(ep => {
              const dlCount = (ep.download_links || []).filter(d => d.url).length;
              return (
                <div key={ep.id} className="group flex items-center gap-4 p-4 rounded-xl bg-[rgba(var(--color-fg-primary),0.03)] hover:bg-[rgba(var(--color-fg-primary),0.06)] ring-1 ring-[rgba(var(--color-fg-primary),0.06)] transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[rgb(var(--color-bg-elevated))] flex items-center justify-center text-lg font-bold text-[rgb(var(--color-accent))]">
                    {Math.floor(ep.number)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[rgb(var(--color-fg-primary))] truncate">{ep.title || `Episode ${Math.floor(ep.number)}`}</p>
                    <p className="text-xs text-[rgb(var(--color-fg-muted))]">
                      {ep.stream_url ? 'Stream available' : 'No stream'}{dlCount > 0 && ` · ${dlCount} downloads`}
                    </p>
                  </div>
                  {ep.stream_url && (
                    <a href={ep.stream_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-full bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] flex items-center justify-center text-white transition-colors" aria-label={`Watch episode ${Math.floor(ep.number)}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 md:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">No Episodes Yet</h2>
          <p className="text-[rgb(var(--color-fg-secondary))]">Episodes for this title haven't been indexed. Check back soon.</p>
        </section>
      )}

      {/* Downloads (consolidated) */}
      {hasStream && episodes.some(e => (e.download_links || []).length > 0) && (
        <section className="container mx-auto px-4 md:px-8 pb-12">
          <h2 className="heading-section text-2xl md:text-3xl text-[rgb(var(--color-fg-primary))] mb-6">Downloads</h2>
          <div className="space-y-3">
            {episodes.filter(e => (e.download_links || []).some(d => d.url)).slice(0, 12).map(ep => {
              const links = (ep.download_links || []).filter(d => d.url).slice(0, 6);
              return (
                <details key={ep.id} className="group rounded-xl bg-[rgba(var(--color-fg-primary),0.03)] ring-1 ring-[rgba(var(--color-fg-primary),0.06)] overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                    <span className="font-semibold text-[rgb(var(--color-fg-primary))]">Episode {Math.floor(ep.number)} — {links.length} links</span>
                    <svg className="w-4 h-4 text-[rgb(var(--color-fg-muted))] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {links.map((d, i) => (
                      <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2 rounded-lg bg-[rgb(var(--color-bg-elevated))] hover:bg-[rgba(var(--color-accent),0.2)] transition-colors text-sm">
                        <span className="font-medium text-[rgb(var(--color-fg-primary))]">{d.provider || 'Download'}</span>
                        <span className="text-xs text-[rgb(var(--color-fg-muted))]">{d.quality}</span>
                      </a>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {/* Related */}
      {relatedFiltered.length > 0 && (
        <section className="container mx-auto px-4 md:px-8 py-12">
          <h2 className="heading-section text-2xl md:text-3xl text-[rgb(var(--color-fg-primary))] mb-6">More like this</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {relatedFiltered.map((r, i) => <ContentCard key={r.slug} item={r} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
