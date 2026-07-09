export type SlotIklanProps = { id?: string; className?: string; slot?: string; format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'; children?: React.ReactNode };

// Renders nothing unless AdSense is configured — no placeholder boxes in production
// when ads aren't live (non-intrusive per retention goal). Placeholder shows only in
// dev/preview so slot positions stay visible while building.
const ADS_ENABLED = !!process.env.NEXT_PUBLIC_GADS_CLIENT_ID;
const SHOW_PLACEHOLDER = process.env.NODE_ENV !== 'production';

// ponytail: dumb shell only — judi-online blocklist guard lives in SafeSlotIklan.
export function SlotIklan({ id, className = '', slot, format = 'auto', children }: SlotIklanProps) {
  if (!ADS_ENABLED && !children && !SHOW_PLACEHOLDER) return null;
  return (
    <aside id={id} aria-label="Iklan" data-ad-slot={slot} data-ad-format={format} className={`w-full my-6 flex items-center justify-center ${className}`}>
      {children ?? <div className="text-center text-muted-foreground font-mono text-micro uppercase tracking-wide py-8 border border-border/60 rounded-card w-full">Ruang Iklan</div>}
    </aside>
  );
}
