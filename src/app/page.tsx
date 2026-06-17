import HeroSection from "@/components/HeroSection";
import AnimeGrid from "@/components/AnimeGrid";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AnimeGrid title="🔥 Popular Anime" sort="popular" limit={12} />
      <AnimeGrid title="🆕 Latest Updates" sort="latest" limit={12} />
      <AnimeGrid title="🎬 Action" genre="action" sort="popular" limit={6} />
      <AnimeGrid title="💕 Romance" genre="romance" sort="popular" limit={6} />
    </>
  );
}