import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';
import { RemoveProgressButton } from './RemoveProgressButton';

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(axeMatchers);

vi.mock('@/app/media/[type]/[slug]/actions', () => ({
  removeProgressAction: vi.fn(),
}));

import { removeProgressAction } from '@/app/media/[type]/[slug]/actions';
const removeMock = vi.mocked(removeProgressAction);

describe('RemoveProgressButton', () => {
  beforeEach(() => {
    removeMock.mockReset();
    removeMock.mockResolvedValue(undefined);
  });

  it('renders with the default accessible name', () => {
    render(<RemoveProgressButton mediaRef="anime/one-piece" />);
    expect(screen.getByRole('button', { name: /hapus dari daftar/i })).toBeInTheDocument();
  });

  it('renders with the provided accessible name', () => {
    render(<RemoveProgressButton mediaRef="anime/one-piece" label="Hapus progres" />);
    expect(screen.getByRole('button', { name: 'Hapus progres' })).toBeInTheDocument();
  });

  it('has no WCAG violations', async () => {
    const { container } = render(<RemoveProgressButton mediaRef="anime/one-piece" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('meets the 44px minimum tap target', () => {
    const { container } = render(<RemoveProgressButton mediaRef="anime/one-piece" />);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toContain('min-h-[44px]');
    expect(btn.className).toContain('min-w-[44px]');
  });

  it('calls removeProgressAction with the mediaRef on click', async () => {
    render(<RemoveProgressButton mediaRef="anime/one-piece" />);
    fireEvent.click(screen.getByRole('button', { name: /hapus dari daftar/i }));
    await waitFor(() => expect(removeMock).toHaveBeenCalledWith('anime/one-piece'));
  });

  it('disables while the transition is pending', async () => {
    // Defer resolution so the pending state is observable after click.
    let resolve!: () => void;
    removeMock.mockReturnValue(new Promise<void>((r) => (resolve = r)));

    render(<RemoveProgressButton mediaRef="anime/one-piece" />);
    const btn = screen.getByRole('button', { name: /hapus dari daftar/i }) as HTMLButtonElement;

    fireEvent.click(btn);
    await waitFor(() => expect(btn).toBeDisabled());

    resolve();
    await waitFor(() => expect(btn).not.toBeDisabled());
  });
});
