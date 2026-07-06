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

  it('links anime content to watch route', () => {
    render(<ContentCard content={mockContent} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/watch/attack-on-titan');
  });

  it('links manga content to read route', () => {
    render(<ContentCard content={{ ...mockContent, slug: 'attack-on-titan-manga', type: 'manga' }} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/read/attack-on-titan-manga');
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
