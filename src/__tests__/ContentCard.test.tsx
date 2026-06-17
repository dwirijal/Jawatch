import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentCard } from '@/components/ContentCard';
import '@testing-library/jest-dom';

describe('ContentCard Component', () => {
  const mockContent = {
    id: 1,
    title: 'Attack on Titan',
    content_type: 'anime' as const,
    cover_url: 'https://example.com/cover.jpg',
    scraped_at: new Date().toISOString(),
    last_scraped_at: new Date().toISOString(),
    source_id: 1,
  };

  it('should render content title', () => {
    render(<ContentCard content={mockContent} />);

    expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
  });

  it('should show "Watch Now" for anime content', () => {
    render(<ContentCard content={mockContent} />);

    expect(screen.getByText('Watch Now')).toBeInTheDocument();
  });

  it('should show "Read Now" for manga content', () => {
    const mangaContent = {
      ...mockContent,
      content_type: 'manga' as const,
    };

    render(<ContentCard content={mangaContent} />);

    expect(screen.getByText('Read Now')).toBeInTheDocument();
  });

  it('should link to /watch/{id} for anime', () => {
    render(<ContentCard content={mockContent} />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/watch/1');
  });

  it('should link to /read/{id} for manga', () => {
    const mangaContent = {
      ...mockContent,
      content_type: 'manga' as const,
    };

    render(<ContentCard content={mangaContent} />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/read/1');
  });
});