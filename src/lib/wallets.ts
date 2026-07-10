// Public crypto receive addresses for donations (#271). These are PUBLIC addresses —
// safe to hardcode/display. No private keys ever live here.
export interface Wallet {
  id: string;
  chain: string; // display label
  address: string;
}

export const WALLETS: readonly Wallet[] = [
  { id: 'evm', chain: 'EVM (ETH · BSC · Polygon · Base · Arbitrum)', address: '0x6816ba2cb2bc013a78225228a153586ca63b1548' },
  { id: 'evm2', chain: 'EVM (alt)', address: '0x228e15ed866e1982e3cf6981694332ea63b37909' },
  { id: 'sol', chain: 'Solana', address: '7pSBzJnbGaKAZzQ73V7wvmb2QTxCu11BVwxTqq6b2mKd' },
  { id: 'btc', chain: 'Bitcoin', address: 'bc1qlnrgrelg9gd2szlxn4rz482zzqp0y6k6n7ul3a' },
  { id: 'move', chain: 'Sui · Aptos (Move)', address: '0x043b062710145b4350c6788e5f4e035b6491cb05a21468e090ef776b2e87d40f' },
] as const;

// Public Saweria profile (fiat/QRIS). NOT the OBS widget streamKey — that stays in OBS.
export const SAWERIA_URL = 'https://saweria.co/anvxxr';
// Public top-up store page (safe to link).
export const SAWERIA_SHOP_URL = 'https://saweria.co/anvxxr/toko-top-up';
