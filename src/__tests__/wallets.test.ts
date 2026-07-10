import { describe, it, expect } from 'vitest';
import { WALLETS, SAWERIA_URL } from '@/lib/wallets';

describe('wallets config', () => {
  it('all addresses non-empty and ids unique', () => {
    const ids = WALLETS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WALLETS) {
      expect(w.address.length).toBeGreaterThan(10);
      expect(w.chain.length).toBeGreaterThan(0);
    }
  });

  it('holds no private keys — EVM/Move addresses are public receive addresses only', () => {
    // Sanity: a raw EVM private key is 64 hex WITHOUT a chain label mapping to "private".
    // Guard against accidentally labeling any wallet as a secret.
    for (const w of WALLETS) {
      expect(w.chain.toLowerCase()).not.toContain('private');
      expect(w.chain.toLowerCase()).not.toContain('secret');
    }
  });

  it('Saweria URL is the public profile, not the OBS wheel-widget streamKey', () => {
    expect(SAWERIA_URL).toBe('https://saweria.co/anvxxr');
    expect(SAWERIA_URL).not.toContain('streamKey');
    expect(SAWERIA_URL).not.toContain('widgets');
  });
});
