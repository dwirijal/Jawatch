import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDetail, getEpisodes, getEpisodeDetail, coverUrl } from "@/lib/api";
import EpisodeList from "@/components/EpisodeList";

export const revalidate = 7200; // ISR: cache 2h at edge, chapter images static once released

export async function generateMetadata({ params }: { params: Promise<{ slug: string; chapter: string }> }): Promise<Metadata> {
  const { slug, chapter } = await params;
  try {
    const detail = await getDetail(slug);
    const title = `${detail.title} — Chapter ${chapter}`;
    const description = `Baca ${detail.title} chapter ${chapter} gratis di Jawatch.`;
    const image = coverUrl(detail);
    return {
      title,
      description,
      alternates: { canonical: `https://jawatch.vercel.app/read/${slug}/${chapter}` },
      openGraph: { type: "article", title, description, images: image ? [{ url: image, width: 780, height: 1200, alt: title }] : [] },
      twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; chapter: string }> }) {
  const { slug, chapter } = await params;
  let detail: Awaited<ReturnType<typeof getDetail>>;
  try { detail = await getDetail(slug); } catch { notFound(); }
  
  const episodes = await getEpisodes(detail.item_key).catch(() => []);
  const ep = episodes.find(e => e.unit_key === chapter) || episodes.find(e => String(e.unit_number) === chapter);
  
  let epDetail = null;
  if (ep?.unit_number != null) {
    try { epDetail = await getEpisodeDetail(detail.item_key, ep.unit_number); } catch {}
  }

  const downloadLinks = epDetail?.download_links || [];
  const streamLinks = epDetail?.stream_links || [];
  const activeStream = ep?.preferred_source
    ? streamLinks.find(l => l.source === ep.preferred_source) || streamLinks[0]
    : streamLinks[0];

  if (!ep) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">{detail.title}</h1>
        <p className="text-gray-400 mb-6">Chapter {chapter} not found.</p>
        <EpisodeList slug={detail.slug} episodes={episodes} mediaType={detail.media_type || "manga"} />
      </div>
    );
  }

  const epIndex = [...episodes].sort((a, b) => (a.unit_number || 0) - (b.unit_number || 0)).findIndex(e => e.unit_key === ep.unit_key);
  const prevEp = epIndex > 0 ? [...episodes].sort((a, b) => (a.unit_number || 0) - (b.unit_number || 0))[epIndex - 1] : null;
  const nextEp = epIndex >= 0 && epIndex < episodes.length - 1 ? [...episodes].sort((a, b) => (a.unit_number || 0) - (b.unit_number || 0))[epIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/read/${slug}`} className="hover:text-purple-400 transition-colors">{detail.title}</Link>
        <span>/</span>
        <span className="text-white">Chapter {ep.unit_number}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {/* Chapter Reader */}
          <div className="relative w-full min-h-[600px] rounded-xl overflow-hidden bg-black border border-white/10 mb-4">
            {activeStream ? (
              <iframe
                src={activeStream.url}
                title={`${detail.title} — Chapter ${ep.unit_number}`}
                className="absolute inset-0 w-full h-full min-h-[600px]"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-400 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{ep.title || `Chapter ${ep.unit_number}`}</h2>
                  <p className="text-gray-400 text-sm mb-4">{detail.title}</p>
                  {downloadLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {downloadLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all hover:scale-105">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          {link.quality ? `Download ${link.quality}` : link.provider || "Download"}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No reading sources available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Source Switcher */}
          {streamLinks.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {streamLinks.map((link, i) => (
                <Link key={i} href={`/read/${slug}/${ep.unit_key}?src=${encodeURIComponent(link.source || i.toString())}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    link === activeStream
                      ? "bg-purple-600 text-white"
                      : "bg-[var(--ja-surface)] text-[var(--ja-text-secondary)] hover:bg-[var(--ja-surface-hover)]"
                  }`}>
                  {link.source || `Source ${i + 1}`}
                </Link>
              ))}
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link href={prevEp ? `/read/${slug}/${prevEp.unit_key}` : "#"}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                prevEp ? "bg-[var(--ja-surface)] hover:bg-[var(--ja-surface-hover)] text-white" : "opacity-40 cursor-not-allowed bg-[var(--ja-surface)] text-gray-500"
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Previous
            </Link>
            <h2 className="text-lg font-bold text-white hidden sm:block">{ep.title || `Chapter ${ep.unit_number}`}</h2>
            <Link href={nextEp ? `/read/${slug}/${nextEp.unit_key}` : "#"}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                nextEp ? "bg-purple-600 hover:bg-purple-500 text-white" : "opacity-40 cursor-not-allowed bg-[var(--ja-surface)] text-gray-500"
              }`}>
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {/* Download Links */}
          {downloadLinks.length > 0 && activeStream && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Download</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {downloadLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--ja-surface)] hover:bg-[var(--ja-surface-hover)] text-[var(--ja-text-secondary)] hover:text-white text-sm transition-colors">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <span className="truncate">{link.quality ? `${link.quality}` : link.provider || "Download"}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {detail.overview && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
              <p className="text-[var(--ja-text-secondary)] leading-relaxed text-sm">{detail.overview}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <img src={coverUrl(detail)} alt={detail.title} className="w-full aspect-[3/4] rounded-xl object-cover shadow-xl" />
            <div>
              <h3 className="text-lg font-bold text-white">{detail.title}</h3>
              <p className="text-sm text-gray-400">{episodes.length} Chapters</p>
            </div>
            <EpisodeList slug={detail.slug} episodes={episodes} mediaType={detail.media_type || "manga"} />
          </div>
        </div>
      </div>
    </div>
  );
}
