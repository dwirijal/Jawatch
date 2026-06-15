import { getContents } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default async function HomePage() {
  const response = await getContents(undefined, 60);
  const contents = response.data || [];

  const anime = contents.filter(c => c.content_type === 'anime');
  const manga = contents.filter(c => c.content_type === 'manga');
  const donghua = contents.filter(c => c.content_type === 'donghua');
  const comic = contents.filter(c => c.content_type === 'comic');
  const novel = contents.filter(c => c.content_type === 'novel');
  const movie = contents.filter(c => c.content_type === 'movie');

  // Hero content (first featured item)
  const heroContent = contents[0];

  // Helper to check if content is "new" (scraped within last 7 days)
  const isNew = (scrapedAt: string) => {
    const scraped = new Date(scrapedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - scraped.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Helper to get content type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      anime: 'Anime',
      manga: 'Manga',
      donghua: 'Donghua',
      comic: 'Comic',
      novel: 'Novel',
      movie: 'Movie',
      other: 'Other'
    };
    return labels[type] || 'Other';
  };

  // Helper to get route based on type
  const getRoute = (type: string, id: number) => {
    if (type === 'anime' || type === 'donghua' || type === 'movie') {
      return `/watch/${id}`;
    }
    return `/read/${id}`;
  };

  // Helper to get action text
  const getActionText = (type: string) => {
    if (type === 'anime' || type === 'donghua' || type === 'movie') {
      return 'Watch Now';
    }
    return 'Read Now';
  };

  // Helper to get icon
  const getIcon = (type: string) => {
    if (type === 'anime' || type === 'donghua' || type === 'movie') {
      return (
        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  };

  // Render a content section
  const renderSection = (title: string, subtitle: string, items: typeof contents, isGrid: boolean) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-16 animate-slide-in-right">
        <div className="px-8 md:px-16 lg:px-24 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold heading-section text-white">
              {title}
            </h2>
            <p className="text-gray-400 mt-2">{subtitle}</p>
          </div>
          {!isGrid && (
            <div className="flex gap-2">
              <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isGrid ? (
          <div className="px-8 md:px-16 lg:px-24">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {items.slice(0, 15).map((item, index) => (
                <Link
                  key={item.id}
                  href={getRoute(item.content_type, item.id)}
                  className="content-card group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden mb-3 relative">
                    {item.cover_url ? (
                      <Image
                        src={item.cover_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        {getIcon(item.content_type)}
                      </div>
                    )}
                    {isNew(item.scraped_at) && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                        NEW
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-base mb-2 line-clamp-2">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                        <span>{new Date(item.scraped_at).getFullYear()}</span>
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span>{getTypeLabel(item.content_type)}</span>
                      </div>
                      <button className="flex items-center justify-center gap-1 px-3 py-2 bg-white text-black text-sm font-semibold rounded hover:bg-gray-200 transition-colors">
                        {getIcon(item.content_type)}
                        {getActionText(item.content_type)}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="content-row flex gap-4 overflow-x-auto pb-4 px-8 md:px-16 lg:px-24 snap-x snap-mandatory">
            {items.slice(0, 15).map((item, index) => (
              <Link
                key={item.id}
                href={getRoute(item.content_type, item.id)}
                className="content-card flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] group snap-start"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 relative">
                  {item.cover_url ? (
                    <Image
                      src={item.cover_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      {getIcon(item.content_type)}
                    </div>
                  )}
                  {isNew(item.scraped_at) && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                      NEW
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h4 className="text-white font-bold text-lg mb-2 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                      <span>{new Date(item.scraped_at).getFullYear()}</span>
                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                      <span>{getTypeLabel(item.content_type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-white text-black text-sm font-semibold rounded hover:bg-gray-200 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        {getActionText(item.content_type)}
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-white/20 text-white text-sm font-semibold rounded hover:bg-white/30 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner - Netflix Style */}
      {heroContent && (
        <section className="relative h-[85vh] min-h-[600px] mb-12 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {heroContent.cover_url ? (
              <Image
                src={heroContent.cover_url}
                alt={heroContent.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
            <div className="max-w-2xl animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded">
                  Featured
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider rounded">
                  {getTypeLabel(heroContent.content_type)}
                </span>
                {isNew(heroContent.scraped_at) && (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold uppercase tracking-wider rounded">
                    New
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 heading-display text-white">
                {heroContent.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-6 text-gray-300">
                <span className="text-sm font-semibold">
                  {heroContent.year || new Date(heroContent.scraped_at).getFullYear()}
                </span>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span className="text-sm">
                  {getActionText(heroContent.content_type).replace(' Now', '')}
                </span>
              </div>

              {/* Description */}
              {heroContent.description && (
                <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3">
                  {heroContent.description}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={getRoute(heroContent.content_type, heroContent.id)}
                  className="px-8 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  {getActionText(heroContent.content_type)}
                </Link>
                <Link
                  href={getRoute(heroContent.content_type, heroContent.id)}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  More Info
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      {renderSection('Anime', 'Streaming now', anime, false)}
      {renderSection('Manga', 'New chapters available', manga, true)}
      {renderSection('Donghua', 'Chinese animation', donghua, false)}
      {renderSection('Comic', 'Indonesian webcomics', comic, true)}
      {renderSection('Novel', 'Light novels and web novels', novel, true)}
      {renderSection('Movies', 'Feature films', movie, false)}

      {/* Empty State */}
      {contents.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center animate-pulse">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">No Content Yet</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md">
            Your library is empty. Start the scraper to populate your streaming collection.
          </p>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 max-w-md">
            <p className="text-sm text-gray-400 mb-3">Run this command:</p>
            <code className="block px-4 py-3 bg-black rounded text-green-400 text-sm font-mono">
              sudo bash setup.sh
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
