import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDetail, getEpisodes, coverUrl, statusColor, browse } from "@/lib/api";
import PosterImage from "@/components/PosterImage";
import EpisodeList from "@/components/EpisodeList";

export const revalidate = 21600; // ISR: cache 6h at edge, manga detail pages are static-ish

export async function generateStaticParams() {
  try {
    const { items } = await browse({ limit: 50, sort: 'popularity' });
    return items
      .filter((item) => item.slug.startsWith('manga-'))
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
    const title = `${detail.title} — Baca Manga`;
    const description = detail.overview
      ? `${detail.title}: ${detail.overview.slice(0, 155)}${detail.overview.length > 155 ? "..." : ""}`
      : `Baca ${detail.title} gratis di Jawatch. ${episodes.length} chapter tersedia.`;
    const image = coverUrl(detail);
    return {
      title,
      description,
      alternates: { canonical: `https://jawatch.vercel.app/read/${slug}` },
      openGraph: { type: "book", title, description, images: image ? [{ url: image, width: 780, height: 1200, alt: detail.title }] : [] },
      twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
      keywords: [detail.title, ...(detail.genres || []).slice(0, 5), "manga", "baca manga"],
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function MangaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let detail: Awaited<ReturnType<typeof getDetail>>;
  try { detail = await getDetail(slug); } catch { notFound(); }
  
  const episodes = await getEpisodes(detail.item_key).catch(() => []);
  if (!detail) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: detail.title,
    description: detail.overview || `Baca ${detail.title} gratis di Jawatch.`,
    image: coverUrl(detail),
    genre: detail.genres,
    datePublished: detail.release_year ? `${detail.release_year}-01-01` : undefined,
    numberOfPages: episodes.length,
    aggregateRating: detail.score ? { "@type": "AggregateRating", ratingValue: detail.score, bestRating: 10, ratingCount: 1 } : undefined,
    url: `https://jawatch.vercel.app/read/${slug}`,
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
              {detail.genres?.map(g => (
                <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}&type=manga`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--ja-surface)] hover:bg-[var(--ja-surface-hover)] text-[var(--ja-text-secondary)] transition-colors">{g}</Link>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm mb-4">
              {detail.score != null && detail.score > 0 && (
                <span className="flex items-center gap-1 text-[var(--ja-gold)] font-semibold">★ {detail.score.toFixed(1)}</span>
              )}
              {detail.release_year && <span className="text-[var(--ja-text-secondary)]">{detail.release_year}</span>}
              {detail.status && (
                <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${statusColor(detail.status)}`}>
                  {detail.status}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-xs font-semibold text-white bg-purple-600">
                {detail.media_type?.toUpperCase() || "MANGA"}
              </span>
            </div>

            {detail.overview && (
              <p className="text-[var(--ja-text-secondary)] leading-relaxed mb-4 max-w-3xl">{detail.overview}</p>
            )}

            <Link href={episodes.length > 0 ? `/read/${slug}/${episodes.sort((a,b) => (a.unit_number||0)-(b.unit_number||0))[0].unit_key}` : "#"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--ja-purple)] hover:bg-[var(--ja-purple-hover)] text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              {episodes.length > 0 ? "Start Reading" : "No Chapters Available"}
            </Link>
          </div>
        </div>

        {/* Chapter List */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">Chapters ({episodes.length})</h2>
          <EpisodeList slug={slug} episodes={episodes} mediaType={detail.media_type || "manga"} />
        </div>
      </div>
    </div>
  );
}
