import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { isGambling, canRenderAd } from './gambling-blocklist';
import { SafeSlotIklan } from './SafeSlotIklan';

describe('gambling blocklist guard', () => {
  it('flags Indonesian gambling ad copy', () => {
    expect(isGambling('Situs Slot Gacor Maxwin')).toBe(true);
  });

  it('allows unrelated content', () => {
    expect(isGambling('Anime Streaming')).toBe(false);
  });

  it('rejects gambling ad via canRenderAd', () => {
    expect(canRenderAd({ label: 'Togel Online' })).toBe(false);
  });

  it('allows safe ad via canRenderAd', () => {
    expect(canRenderAd({ label: 'Rekomendasi Baca' })).toBe(true);
  });

  it('renders nothing for a gambling slot', () => {
    const { container } = render(<SafeSlotIklan slot="123" label="judi online" />);
    expect(container.firstChild).toBeNull();
  });
});
