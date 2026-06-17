import { notFound } from "next/navigation";
import Link from "next/link";
import { getDetail, getEpisodes, coverUrl, statusColor } from "@/lib/api";
import PosterImage from "@/components/PosterImage";
import EpisodeList from "@/components/EpisodeList";

export default async function StreamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let detail: Awaited<ReturnType<typeof getDetail>>;
  try { detail = await getDetail(slug); } catch { notFound(); }

  const episodes = await getEpisodes(detail!.item_key).catch(() => []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative w-full h-[45vh] min-h-[350px]">
        <img src={coverUrl(detail)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-[#0a0a0f]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-28 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            <PosterImage src={coverUrl(detail)} alt={detail.title} className="w-40 sm:w-48 rounded-xl shadow-2xl border-2 border-white/10" />
          </div>

          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{detail.title}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusColor(detail.status)}`}>{detail.status || "Unknown"}</span>
              {detail.entry_kind && detail.entry_kind !== "other" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300">{detail.entry_kind.toUpperCase()}</span>
              )}
              {detail.release_year != null && detail.release_year > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300">{detail.release_year}</span>
              )}
              {detail.score != null && detail.score > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">★ {detail.score.toFixed(1)}</span>
              )}
            </div>
            {detail.genres && detail.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {detail.genres.map(g => (
                  <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`}
                    className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400 hover:bg-purple-600/30 hover:text-purple-300 transition-colors">
                    {g}
                  </Link>
                ))}
              </div>
            )}
            {detail.overview && (
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{detail.overview}</p>
            )}
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Episodes</h2>
        <EpisodeList slug={slug} episodes={episodes} />
      </div>
    </div>
  );
}