// CRITICAL: jawatch NEVER serves judi online / online gambling ads.
export const GAMBLING_BLOCKLIST = [
  // Indonesian online gambling terms
  'judi', 'judi online', 'slot', 'slot online', 'casino', 'casino online',
  'poker', 'togel', 'togel online', 'sbobet', 'roulette', 'bandar', 'bandar togel',
  'agen slot', 'situs slot', 'situs judi', 'maxwin', 'rtp', 'rtp live', 'gacor',
  'bola tangkas', 'bingo', 'blackjack', 'taruhan', 'pasang angka',
  // domains (common Indonesian gambling ad networks / brands)
  'sbobet', 'wxbet', 'bolabet', 'togel', 's128', 'cashtangk', 'kiritoto', 'totomacaun',
  'pragmaticplay', 'habanero', 'pgsoft', 'microgaming', // slot game providers
];

export function isGambling(value: string): boolean {
  const v = value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  return GAMBLING_BLOCKLIST.some((term) => v.includes(term));
}

// Decides whether an ad creative / slot is safe to render.
// Returns true ONLY when no gambling signal is present.
export function canRenderAd(ad: { label?: string; slot?: string; src?: string; alt?: string }): boolean {
  return !isGambling([ad.label ?? '', ad.slot ?? '', ad.src ?? '', ad.alt ?? ''].join(' '));
}
