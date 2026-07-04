export default function LibraryPage() {
  return (
    <div className="max-w-[1160px] mx-auto px-8 py-12">
      <div className="mb-8">
        <div className="font-mono text-xs text-amber uppercase tracking-[.1em]">User</div>
        <h1 className="font-serif text-3xl font-semibold text-paper mt-2">Library</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/library/bookmarks" className="border border-hairline p-6 hover:border-amber hover:text-amber transition-colors bg-surface text-center font-serif text-lg italic">Bookmarks</a>
        <a href="/library/history" className="border border-hairline p-6 hover:border-amber hover:text-amber transition-colors bg-surface text-center font-serif text-lg italic">History</a>
        <a href="/library/reading-progress" className="border border-hairline p-6 hover:border-amber hover:text-amber transition-colors bg-surface text-center font-serif text-lg italic">Reading Progress</a>
        <a href="/library/watch-progress" className="border border-hairline p-6 hover:border-amber hover:text-amber transition-colors bg-surface text-center font-serif text-lg italic">Watch Progress</a>
      </div>
    </div>
  );
}
