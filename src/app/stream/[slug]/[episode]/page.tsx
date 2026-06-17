import { notFound } from "next/navigation";
import Link from "next/link";
import { getDetail, getEpisodes, getEpisodeDetail, coverUrl } from "@/lib/api";
import EpisodeList from "@/components/EpisodeList";

export default async function EpisodePage({ params }: { params: Promise<{ slug: string; episode: string }> }) {
  const { slug, episode } = await params;
  let detail: Awaited<ReturnType<typeof getDetail>>;
  let episodes: Awaited<ReturnType<typeof getEpisodes>> = [];
  try { detail = await getDetail(slug); } catch { notFound(); }
  try { episodes = await getEpisodes(detail.item_key); } catch {}

  const ep = episodes.find(e => e.unit_key === episode)
    || episodes.find(e => String(e.unit_number) === episode);

  let epDetail = null;
  if (ep?.unit_number != null) {
    try { epDetail = await getEpisodeDetail(detail.item_key, ep.unit_number); } catch {}
  }

  const downloadLinks = epDetail?.download_links || [];
  const streamLinks = epDetail?.stream_links || [];

  if (!ep) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">{detail.title}</h1>
        <p className="text-gray-400 mb-6">Episode {episode} not found.</p>
        <EpisodeList slug={detail.slug} episodes={episodes} />
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
        <Link href={`/stream/${slug}`} className="hover:text-purple-400 transition-colors">{detail.title}</Link>
        <span>/</span>
        <span className="text-white">Episode {ep.unit_number}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {/* Video Player Placeholder */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{ep.title || `Episode ${ep.unit_number}`}</h2>
                <p className="text-gray-400 text-sm mb-4">{detail.title}</p>
                {streamLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {streamLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all hover:scale-105">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                        {link.source ? `Watch on ${link.source}` : "Watch Now"}
                      </a>
                    ))}
                  </div>
                )}
                {streamLinks.length === 0 && (
                  <p className="text-gray-500 text-sm">No streaming sources available</p>
                )}
              </div>
            </div>
          </div>

          {/* Episode Navigation */}
          <div className="flex items-center justify-between mb-6">
            {prevEp ? (
              <Link href={`/stream/${slug}/${prevEp.unit_key}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                Prev
              </Link>
            ) : <div />}
            <span className="text-gray-400 text-sm font-medium">Episode {ep.unit_number}</span>
            {nextEp ? (
              <Link href={`/stream/${slug}/${nextEp.unit_key}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </Link>
            ) : <div />}
          </div>

          {/* Download Links */}
          {downloadLinks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Download</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {downloadLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#141428] hover:bg-[#1e1e3a] border border-white/5 hover:border-purple-500/30 transition-all group">
                    <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-white">{link.provider || "Download"}</p>
                      {link.quality && <p className="text-xs text-gray-400">{link.quality}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {detail.overview && (
            <div className="bg-[#141428] rounded-xl p-4 border border-white/5 mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Synopsis</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{detail.overview}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={coverUrl(detail)} alt={detail.title} className="w-16 h-20 rounded-lg object-cover" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{detail.title}</h3>
                <p className="text-xs text-gray-400">Episode {ep.unit_number}</p>
              </div>
            </div>
            <EpisodeList slug={detail.slug} episodes={episodes} />
          </div>
        </div>
      </div>
    </div>
  );
}