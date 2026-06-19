import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDetail, getEpisodes, coverUrl, statusColor, browse } from "@/lib/api";
import PosterImage from "@/components/PosterImage";
import EpisodeList from "@/components/EpisodeList";

export const revalidate = 21600; // ISR: cache 6h at edge, detail pages change rarely

export async function generateStaticParams() {
  try {
    const { items } = await browse({ limit: 50, sort: 'popularity' });
    return items
      .filter((item) => !item.slug.startsWith('manga-'))
      .map((item) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const detail = await getDetail(slug);
    const episodes = await getEpisodes(detail.item_key).catch(() => []);
    const title = `${detail.title} — Nonton Anime`;
    const description = detail.overview
      ? `${detail.title}: ${detail.overview.slice(0, 155)}${detail.overview.length > 155 ? "..." : ""}`
      : `Nonton ${detail.title} subtitle Indonesia gratis di Jawatch. ${episodes.length} episode tersedia.`;
    const image = coverUrl(detail);
    return {
      title,
      description,
      alternates: { canonical: `https://jawatch.vercel.app/stream/${slug}` },
      openGraph: {
        type: "video.tv_show",
        title,
        description,
        images: image ? [{ url: image, width: 780, height: 1200, alt: detail.title }] : [],
        url: `https://jawatch.vercel.app/stream/${slug}`,
      },
      twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
      keywords: [detail.title, ...(detail.genres || []).slice(0, 5), "anime", "nonton anime"],
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function StreamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Sequential: fetch detail first, then episodes (avoid duplicate API calls)
  let detail: Awaited<ReturnType<typeof getDetail>>;
  try {
    detail = await getDetail(slug);
  } catch {
    notFound();
  }

  const episodes = await getEpisodes(detail.item_key).catch(() => []);

  if (!detail) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: detail.title,
    description: detail.overview || `Nonton ${detail.title} subtitle Indonesia gratis di Jawatch.`,
    image: coverUrl(detail),
    genre: detail.genres,
    datePublished: detail.release_year ? `${detail.release_year}-01-01` : undefined,
    numberOfEpisodes: episodes.length,
    aggregateRating: detail.score ? { "@type": "AggregateRating", ratingValue: detail.score, bestRating: 10, ratingCount: 1 } : undefined,
    url: `https://jawatch.vercel.app/stream/${slug}`,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero Banner */}
      <div className="relative w-full h-[45vh] min-h-[350px]">
        <img src={coverUrl(detail)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ja-bg)] via-[var(--ja-bg)/40] to-[var(--ja-bg)/80]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ja-bg)/90] via-transparent to-transparent" />
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
                <span className="px-2.5 py-0.5 rounded-[var(--ja-r-sm)] text-xs font-medium bg-[var(--ja-surface)] text-[var(--ja-text-secondary)]">{detail.entry_kind.toUpperCase()}</span>
              )}
              {detail.release_year != null && detail.release_year > 0 && (
                <span className="px-2.5 py-0.5 rounded-[var(--ja-r-sm)] text-xs font-medium bg-[var(--ja-surface)] text-[var(--ja-text-secondary)]">{detail.release_year}</span>
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
        <EpisodeList slug={slug} episodes={episodes} mediaType={detail.entry_kind || detail.media_type} />
      </div>
    </div>
  );
}