import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '@/components/sections/EmptyState';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import type { Media } from '@/lib/api';

const baseMedia = {
  alternativeTitles: null,
  synopsis: '',
  status: 'ongoing',
  genres: [],
  studios: null,
  authors: null,
  createdAt: '',
  updatedAt: '',
};

const media = (item: Pick<Media, 'slug' | 'type' | 'title'>): Media => ({
  ...baseMedia,
  ...item,
});

describe('standalone UI sections', () => {
  it('routes media cards to canonical media detail pages', () => {
    render(<MediaGrid items={[
      media({ slug: 'anime-1', type: 'anime', title: 'Anime One' }),
      media({ slug: 'comic-1', type: 'comic', title: 'Comic One' }),
    ]} />);

    expect(screen.getByRole('link', { name: /anime one/i })).toHaveAttribute('href', '/media/anime-1');
    expect(screen.getByRole('link', { name: /comic one/i })).toHaveAttribute('href', '/media/comic-1');
  });

  it('renders empty-state CTA only when provided', () => {
    const { rerender } = render(<EmptyState title="Kosong" description="Belum ada data." />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    rerender(<EmptyState title="Kosong" description="Belum ada data." href="/discover" actionLabel="Browse" />);

    expect(screen.getByRole('link', { name: /browse/i })).toHaveAttribute('href', '/discover');
  });

  it('renders section action link when provided', () => {
    render(<SectionHeader eyebrow="Shelf" title="Popular" href="/popular" actionLabel="View all" />);

    expect(screen.getByRole('heading', { name: /popular/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/popular');
  });
});
