"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchAnime, type AnimeCard } from "@/lib/api";
import AnimeCardView from "@/components/AnimeCard";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q.trim()) { setLoading(false); return; }
    setLoading(true); setError("");
    searchAnime(q).then(setResults)
      .catch(() => setError("Search failed. Try again."))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-2">Search Results</h1>
      <p className="text-gray-400 mb-8">
        {q ? `Showing results for "${q}"` : "Enter a search query"}
      </p>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-xl skeleton" />)}
        </div>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500">No results found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map(item => <AnimeCardView key={item.item_key} anime={item} />)}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Suspense fallback={<div className="skeleton h-[60vh] rounded-xl" />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}