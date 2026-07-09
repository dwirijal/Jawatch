import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';
import { ProgressList } from './ProgressList';
import type { ProgressInput } from '@/lib/library';
import { removeProgressAction } from '@/app/media/[type]/[slug]/actions';

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(axeMatchers);

vi.mock('@/app/media/[type]/[slug]/actions', () => ({
  removeProgressAction: vi.fn(),
}));

const item = (over: Partial<ProgressInput> = {}): ProgressInput => ({
  mediaRef: 'anime/one-piece',
  mediaType: 'anime',
  itemSlug: 'episode-1',
  itemNumber: 1,
  title: 'One Piece',
  ...over,
});

describe('ProgressList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a resume link for each item', () => {
    render(<ProgressList items={[item()]} kind="episodes" />);
    const link = screen.getByRole('link', { name: /one piece/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toContain('/episode-1');
  });

  it('renders the remove button as a sibling of the resume link, not nested', () => {
    const { container } = render(<ProgressList items={[item()]} kind="episodes" />);
    const link = screen.getByRole('link', { name: /one piece/i });
    const removeBtn = screen.getByRole('button', { name: /hapus dari daftar/i });

    // Button must not live inside the anchor (nested interactive = a11y violation).
    expect(link.contains(removeBtn)).toBe(false);
    expect(container.querySelector('a button')).toBeNull();
  });

  it('fires removeProgressAction from the sibling button', () => {
    render(<ProgressList items={[item()]} kind="episodes" />);
    fireEvent.click(screen.getByRole('button', { name: /hapus dari daftar/i }));
    // Server action mocked — assert it was invoked with the row's mediaRef.
    expect(vi.mocked(removeProgressAction)).toHaveBeenCalledWith('anime/one-piece');
  });

  it('has no WCAG violations', async () => {
    const { container } = render(
      <ProgressList items={[item(), item({ mediaRef: 'anime/naruto', itemSlug: 'ep-2', itemNumber: 2, title: 'Naruto' })]} kind="chapters" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
