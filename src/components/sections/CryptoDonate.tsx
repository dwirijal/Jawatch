'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, QrCode, Bitcoin } from 'lucide-react';
import { WALLETS, type Wallet } from '@/lib/wallets';
import { useToast } from '@/components/ui/ToastProvider';
import { COPY } from '@/lib/copy';

function truncate(addr: string): string {
  return addr.length > 16 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr;
}

function WalletRow({ wallet }: { wallet: Wallet }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  // Reset the copied checkmark after a beat; cleanup avoids setState on an unmounted row.
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast(COPY.support.copied);
    } catch {
      toast(COPY.support.copyFailed);
    }
  }

  async function toggleQr() {
    if (!showQr && !qr) {
      // Lazy: RS-encoding isn't a few lines — load the lib only when a QR is actually requested.
      const { toDataURL } = await import('qrcode');
      setQr(await toDataURL(wallet.address, { margin: 1, width: 176 }));
    }
    setShowQr((v) => !v);
  }

  return (
    <li className="flex flex-col gap-2 rounded-chip border border-border bg-card/40 p-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-mono text-micro uppercase tracking-micro text-muted-foreground">
          {wallet.id === 'btc' && <Bitcoin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
          {wallet.chain}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate font-mono text-tag text-foreground" title={wallet.address}>
          {truncate(wallet.address)}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={`${COPY.support.copyAddress} ${wallet.chain}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-chip border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-95"
        >
          {copied ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={toggleQr}
          aria-label={`${COPY.support.showQr} ${wallet.chain}`}
          aria-expanded={showQr}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-chip border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-95"
        >
          <QrCode className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {showQr && qr && (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL from qrcode, not a remote asset
        <img src={qr} alt={`QR ${wallet.chain}`} width={176} height={176} className="mx-auto rounded-chip bg-white p-2" />
      )}
    </li>
  );
}

export function CryptoDonate() {
  return (
    <div className="w-full max-w-md">
      <p className="mb-2 text-center font-mono text-micro uppercase tracking-micro text-muted-foreground">
        {COPY.support.crypto}
      </p>
      <ul className="flex flex-col gap-2">
        {WALLETS.map((w) => (
          <WalletRow key={w.id} wallet={w} />
        ))}
      </ul>
    </div>
  );
}
