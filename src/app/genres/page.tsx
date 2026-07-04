import { getGenres } from '@/lib/api';

export default async function GenresPage() {
  const genres = await getGenres();

  return (
    <div className="max-w-[1160px] mx-auto px-8 py-12">
      <div className="mb-8">
        <div className="font-mono text-xs text-amber uppercase tracking-[.1em]">Database</div>
        <h1 className="font-serif text-3xl font-semibold text-paper mt-2">Genres</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {genres.map((g) => (
          <a
            key={g.slug}
            href={`/genres/${g.slug}`}
            className="border border-hairline p-6 hover:border-amber hover:text-amber transition-colors bg-surface text-center font-serif text-lg italic"
          >
            {g.name}
          </a>
        ))}
      </div>
    </div>
  );
}
