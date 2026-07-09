import { describe, expect, it } from 'vitest';
import { registerMedia, buildCanonicalPath, decodeMediaRef } from '@/lib/api';

// Pure routing logic — no network. Wrong output = broken links / 404s, so it's the
// highest-value unit surface in api.ts. e2e covers the page.tsx wiring separately.
describe('media routing', () => {
  it('round-trips a registered ref: register -> build path -> decode', () => {
    const canonical = registerMedia('anime', 'samehadaku', 'one-piece-sub', 'One Piece');
    const path = buildCanonicalPath({ type: 'anime', provider: 'samehadaku', slug: 'one-piece-sub' });
    expect(path).toBe(`/media/anime/${canonical}`);

    const ref = decodeMediaRef(`anime/${canonical}`);
    expect(ref).toEqual({ type: 'anime', provider: 'samehadaku', slug: 'one-piece-sub' });
  });

  it('is idempotent: re-registering the same upstream returns the same canonical slug', () => {
    const a = registerMedia('novel', 'sakuranovel', 'dungeon-life', 'Dungeon Life');
    const b = registerMedia('novel', 'sakuranovel', 'dungeon-life', 'Dungeon Life');
    expect(a).toBe(b);
  });

  it('disambiguates title collisions across providers', () => {
    const first = registerMedia('comic', 'komikstation', 'solo-a', 'Solo Leveling');
    const second = registerMedia('comic', 'kiryuu', 'solo-b', 'Solo Leveling');
    expect(second).not.toBe(first);
    expect(second).toContain('--kiryuu');
    // both remain independently resolvable
    expect(decodeMediaRef(`comic/${first}`)).toMatchObject({ provider: 'komikstation', slug: 'solo-a' });
    expect(decodeMediaRef(`comic/${second}`)).toMatchObject({ provider: 'kiryuu', slug: 'solo-b' });
  });

  it('decodes an opaque m~ base64url ref', () => {
    const payload = Buffer.from(JSON.stringify({ type: 'anime', provider: 'animasu', slug: 'bleach-tybw' })).toString('base64url');
    expect(decodeMediaRef(`m~${payload}`)).toEqual({ type: 'anime', provider: 'animasu', slug: 'bleach-tybw' });
  });

  it('decodes the legacy tilde form type~provider~slug', () => {
    expect(decodeMediaRef('donghua~donghub~battle-through-heavens')).toEqual({
      type: 'donghua', provider: 'donghub', slug: 'battle-through-heavens',
    });
  });

  it('falls back to a resolve ref for an unregistered canonical slug', () => {
    expect(decodeMediaRef('anime/never-registered-xyz')).toEqual({ type: 'anime', provider: 'resolve', slug: 'never-registered-xyz' });
  });

  it('rejects garbage: bad type, short tilde form, malformed m~', () => {
    expect(decodeMediaRef('notatype/foo')).toBeNull();
    expect(decodeMediaRef('anime~onlytwo')).toBeNull();
    expect(decodeMediaRef('m~!!!not-base64-json!!!')).toBeNull();
  });
});
