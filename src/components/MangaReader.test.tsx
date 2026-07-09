import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';
import { MangaReader } from './MangaReader';
import type { Chapter, ChapterPage } from '@/lib/api';

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(axeMatchers);

vi.mock('@/lib/client-media', () => ({
  getChapterPagesClient: vi.fn(),
}));
vi.mock('@/app/media/[type]/[slug]/actions', () => ({
  recordProgressAction: vi.fn(),
}));

// jsdom lacks IntersectionObserver — the auto-advance effect needs a no-op stub.
class IO {
  observe() {}
  disconnect() {}
  unobserve() {}
}
vi.stubGlobal('IntersectionObserver', IO);

const chapter: Chapter = { slug: 'ch-1', chapterNumber: 1, title: 'Ch 1', createdAt: '' };
const pages: ChapterPage[] = [{ url: 'https://img.test/p1.jpg', pageNumber: 1 }];

const props = {
  slug: 'anime/one-piece',
  chapters: [chapter],
  initialPages: pages,
  currentChapterSlug: 'ch-1',
  mediaType: 'manga',
  title: 'One Piece',
};

describe('MangaReader fit-mode control', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders three modes with accessible names and toggled aria-pressed', () => {
    render(<MangaReader {...props} />);
    const width = screen.getByRole('button', { name: /fit lebar/i });
    const screenBtn = screen.getByRole('button', { name: /fit layar/i });
    const medium = screen.getByRole('button', { name: /sedang/i });

    expect(width).toHaveAttribute('aria-pressed', 'true'); // default active
    expect(screenBtn).toHaveAttribute('aria-pressed', 'false');
    expect(medium).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches the active mode on click', () => {
    render(<MangaReader {...props} />);
    const screenBtn = screen.getByRole('button', { name: /fit layar/i });
    fireEvent.click(screenBtn);
    expect(screenBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /fit lebar/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('persists the selected fit mode to localStorage', () => {
    render(<MangaReader {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /fit layar/i }));
    expect(localStorage.getItem('jawatch:reader-fit')).toBe('screen');
  });

  it('has no WCAG violations for the fit-mode group', async () => {
    const { container } = render(<MangaReader {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
