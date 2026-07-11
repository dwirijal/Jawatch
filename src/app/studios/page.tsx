import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { getStudios } from '@/lib/api';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Studios',
  description: 'Browse jawatch titles by the studios that make them.',
  alternates: { canonical: '/studios' },
};

export default async function StudiosPage() {
  const studios = await getStudios();

  return (
    <Container>
      <SectionHeader as="h1" eyebrow="Browse" title="Studios" description="Find titles by the studio behind them." />
      {studios.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">No studios available right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {studios.map((studio) => (
            <Link
              key={studio.slug}
              href={`/studios/${studio.slug}`}
              className="flex min-h-[48px] items-center rounded-page border border-border bg-card px-4 py-3 font-serif text-base text-foreground transition-all duration-base hover:border-primary hover:text-primary motion-safe:hover:-translate-y-0.5"
            >
              {studio.name}
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
