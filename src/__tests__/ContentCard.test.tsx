import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContentCard } from '@/components/ContentCard';

describe('ContentCard Component', () => {
  const mockContent = {
    slug: 'attack-on-titan',
    type: 'anime' as const,
    title: 'Attack on Titan',
    coverImage: 'https://example.com/cover.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders content title', () => {
    render(<ContentCard content={mockContent} />);
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
  });

  it('links content to canonical media route', () => {
    render(<ContentCard content={mockContent} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/media/attack-on-titan');
  });

  it('uses the same canonical route for readable content', () => {
    render(<ContentCard content={{ ...mockContent, slug: 'attack-on-titan-manga', type: 'manga' }} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/media/attack-on-titan-manga');
  });

  it('renders content type label in overlay', () => {
    render(<ContentCard content={mockContent} />);
    expect(screen.getByText('anime')).toBeInTheDocument();
  });

  it('shows new badge for recently created content', () => {
    render(<ContentCard content={mockContent} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });
});
