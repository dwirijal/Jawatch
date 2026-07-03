import { getMedia } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default async function HomePage() {
  const { data: contents } = await getMedia(undefined, 1, 60);

  const anime = contents.filter(c => c.type === 'anime');
  const manga = contents.filter(c => c.type === 'manga');
  const donghua = contents.filter(c => c.type === 'donghua');
  const comic = contents.filter(c => c.type === 'comic');
  const novel = contents.filter(c => c.type === 'novel');
  const movie = contents.filter(c => c.type === 'movie');

  const heroContent = contents[0];

  const isNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      anime: 'Anime', manga: 'Manga', donghua: 'Donghua',
      comic: 'Comic', novel: 'Novel', movie: 'Movie', other: 'Other'
    };
    return labels[type] || 'Other';
  };

  const getRoute = (type: string, slug: string) => {
    if (type === 'anime' || type === 'donghua' || type === 'movie') return `/watch/${slug}`;
    return `/read/${slug}`;
  };

  const getActionText = (type: string) => {
    if (type === 'anime' || type === 'donghua' || type === 'movie') return 'Watch Now';
    return 'Read Now';
  };

  const getIcon = (type: string) => {
    if (type === 'anime' || type === 'donghua' || type === 'movie') {
      return (
        <svg className="w-16 h-16 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-16 h-16 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  };

  const renderSection = (title: string, subtitle: string, items: typeof contents, isGrid: boolean) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-16 animate-slide-in-right">
        <div className="px-8 md:px-16 lg:px-24 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold heading-section text-[rgb(var(--color-fg-primary))]">
              {title}
            </h2>
            <p className="text-[rgb(var(--color-fg-secondary))] mt-2">{subtitle}</p>
          </div>
          {!isGrid && (
            <div className="flex gap-2">
              <button className="p-2 bg-[rgb(var(--color-fg-primary))]/10 rounded-lg hover:bg-[rgb(var(--color-fg-primary))]/20 transition-colors">
                <svg className="w-6 h-6 text-[rgb(var(--color-fg-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 bg-[rgb(var(--color-fg-primary))]/10 rounded-lg hover:bg-[rgb(var(--color-fg-primary))]/20 transition-colors">
                <svg className="w-6 h-6 text-[rgb(var(--color-fg-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  key={item.slug}
                  href={getRoute(item.type, item.slug)}
                  className="content-card group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-[2/3] bg-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden mb-3 relative">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-elevated))] to-[rgb(var(--color-bg-secondary))]">
                        {getIcon(item.type)}
                      </div>
                    )}
                    {isNew(item.createdAt) && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-[rgb(var(--color-success))] text-[rgb(var(--color-fg-primary))] text-xs font-bold rounded">
                        NEW
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--color-bg-primary),0.95)] via-[rgba(var(--color-bg-primary),0.6)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <h4 className="text-[rgb(var(--color-fg-primary))] font-bold text-base mb-2 line-clamp-2">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-fg-secondary))] mb-3">
                        <span>{new Date(item.createdAt).getFullYear()}</span>
                        <span className="w-1 h-1 bg-[rgb(var(--color-fg-subtle))] rounded-full"></span>
                        <span>{getTypeLabel(item.type)}</span>
                      </div>
                      <button className="flex items-center justify-center gap-1 px-3 py-2 bg-[rgb(var(--color-fg-primary))] text-[rgb(var(--color-bg-primary))] text-sm font-semibold rounded hover:bg-[rgb(var(--color-bg-elevated))] transition-colors">
                        {getIcon(item.type)}
                        {getActionText(item.type)}
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
                key={item.slug}
                href={getRoute(item.type, item.slug)}
                className="content-card flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] group snap-start"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="aspect-video bg-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden mb-3 relative">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-elevated))] to-[rgb(var(--color-bg-secondary))]">
                      {getIcon(item.type)}
                    </div>
                  )}
                  {isNew(item.createdAt) && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[rgb(var(--color-success))] text-[rgb(var(--color-fg-primary))] text-xs font-bold rounded">
                      NEW
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--color-bg-primary),0.95)] via-[rgba(var(--color-bg-primary),0.6)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h4 className="text-[rgb(var(--color-fg-primary))] font-bold text-lg mb-2 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-fg-secondary))] mb-3">
                      <span>{new Date(item.createdAt).getFullYear()}</span>
                      <span className="w-1 h-1 bg-[rgb(var(--color-fg-subtle))] rounded-full"></span>
                      <span>{getTypeLabel(item.type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-[rgb(var(--color-fg-primary))] text-[rgb(var(--color-bg-primary))] text-sm font-semibold rounded hover:bg-[rgb(var(--color-bg-elevated))] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        {getActionText(item.type)}
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-[rgb(var(--color-fg-primary))]/20 text-[rgb(var(--color-fg-primary))] text-sm font-semibold rounded hover:bg-[rgb(var(--color-fg-primary))]/30 transition-colors">
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
            {heroContent.coverImage ? (
              <Image
                src={heroContent.coverImage}
                alt={heroContent.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-primary))]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--color-bg-primary),0.95)] via-[rgba(var(--color-bg-primary),0.7)] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-[rgba(var(--color-bg-primary),0.5)] to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
            <div className="max-w-2xl animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] text-xs font-bold uppercase tracking-wider rounded">
                  Featured
                </span>
                <span className="px-3 py-1 bg-[rgb(var(--color-fg-primary))]/10 backdrop-blur-sm text-[rgb(var(--color-fg-primary))] text-xs font-semibold uppercase tracking-wider rounded">
                  {getTypeLabel(heroContent.type)}
                </span>
                {isNew(heroContent.createdAt) && (
                  <span className="px-3 py-1 bg-[rgb(var(--color-success))] text-[rgb(var(--color-fg-primary))] text-xs font-bold uppercase tracking-wider rounded">
                    New
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 heading-display text-[rgb(var(--color-fg-primary))]">
                {heroContent.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-6 text-[rgb(var(--color-fg-secondary))]">
                <span className="text-sm font-semibold">
                  {new Date(heroContent.createdAt).getFullYear()}
                </span>
                <span className="w-1 h-1 bg-[rgb(var(--color-fg-subtle))] rounded-full"></span>
                <span className="text-sm">
                  {getActionText(heroContent.type).replace(' Now', '')}
                </span>
              </div>

              {/* Description */}
              {heroContent.synopsis && (
                <p className="text-lg md:text-xl text-[rgb(var(--color-fg-primary))] mb-8 line-clamp-3">
                  {heroContent.synopsis}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={getRoute(heroContent.type, heroContent.slug)}
                  className="px-4 sm:px-8 py-4 bg-[rgb(var(--color-fg-primary))] text-[rgb(var(--color-bg-primary))] font-bold text-lg rounded-lg hover:bg-[rgb(var(--color-bg-elevated))] transition-colors flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  {getActionText(heroContent.type)}
                </Link>
                <Link
                  href={getRoute(heroContent.type, heroContent.slug)}
                  className="px-4 sm:px-8 py-4 bg-[rgb(var(--color-fg-primary))]/10 backdrop-blur-sm text-[rgb(var(--color-fg-primary))] font-bold text-lg rounded-lg hover:bg-[rgb(var(--color-fg-primary))]/20 transition-colors flex items-center gap-2"
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-8 text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-hover))] rounded-2xl flex items-center justify-center animate-pulse">
              <svg className="w-16 h-16 text-[rgb(var(--color-fg-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-[rgb(var(--color-fg-primary))] mb-4">No Content Yet</h2>
          <p className="text-[rgb(var(--color-fg-secondary))] text-lg mb-8 max-w-md">
            Your library is empty. Start the scraper to populate your streaming collection.
          </p>
        </div>
      )}
    </div>
  );
}
