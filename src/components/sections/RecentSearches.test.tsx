import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';
import { RecentSearches } from './RecentSearches';

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(axeMatchers);

const KEY = 'jawatch:recent-searches';

describe('RecentSearches', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders recent chips seeded from localStorage when current is empty', async () => {
    localStorage.setItem(KEY, JSON.stringify(['naruto', 'bleach']));
    render(<RecentSearches current="" />);

    expect(await screen.findByRole('link', { name: 'naruto' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'bleach' })).toBeInTheDocument();
  });

  it('records the current query to localStorage', async () => {
    render(<RecentSearches current="one piece" />);

    // Component renders nothing while a current query is set...
    await waitFor(() => expect(screen.queryByRole('link', { name: 'one piece' })).toBeNull());
    // ...but persists it for next time.
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(KEY) || '[]')).toContain('one piece'),
    );
  });

  it('renders nothing when current is set', async () => {
    localStorage.setItem(KEY, JSON.stringify(['naruto']));
    render(<RecentSearches current="ongoing search" />);
    await waitFor(() => expect(screen.queryByRole('region', { name: /pencarian terakhir/i })).toBeNull());
  });

  it('renders nothing when there is no history', async () => {
    render(<RecentSearches current="" />);
    await waitFor(() => expect(screen.queryByRole('region', { name: /pencarian terakhir/i })).toBeNull());
  });

  it('clears the list via the clear button', async () => {
    localStorage.setItem(KEY, JSON.stringify(['naruto', 'bleach']));
    render(<RecentSearches current="" />);

    const chip = await screen.findByRole('link', { name: 'naruto' });
    expect(chip).toBeInTheDocument();

    await act(async () => {
      screen.getByRole('button', { name: /hapus/i }).click();
    });

    expect(screen.queryByRole('link', { name: 'naruto' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'bleach' })).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('has no WCAG violations when history is present', async () => {
    localStorage.setItem(KEY, JSON.stringify(['naruto']));
    const { container } = render(<RecentSearches current="" />);
    await screen.findByRole('link', { name: 'naruto' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
