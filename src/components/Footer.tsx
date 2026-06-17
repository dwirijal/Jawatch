import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span className="text-purple-500 font-bold">JA</span>
          <span className="text-white font-bold">WATCH</span>
          <span className="ml-2"> &mdash; Streaming Anime Gratis Sub Indo</span>
        </div>
        <div className="flex gap-6">
          <Link href="/browse" className="hover:text-purple-400 transition-colors">Browse</Link>
          <a href="https://api.dwizzy.my.id/docs" target="_blank" rel="noopener" className="hover:text-purple-400 transition-colors">API</a>
          <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
        </div>
      </div>
    </footer>
  );
}