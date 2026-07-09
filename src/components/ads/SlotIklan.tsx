export type SlotIklanProps = { id?: string; className?: string; slot?: string; format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'; children?: React.ReactNode };
// ponytail: dumb shell only — judi-online blocklist guard is added by FE engineer separately.
export function SlotIklan({ id, className = '', slot, format = 'auto', children }: SlotIklanProps) {
  return (
    <aside aria-label="Iklan" data-ad-slot={slot} data-ad-format={format} className={`w-full my-6 flex items-center justify-center ${className}`}>
      {children ?? <div className="text-center text-muted-foreground font-mono text-micro uppercase tracking-wide py-8 border border-border/60 rounded-lg w-full">Ruang Iklan</div>}
    </aside>
  );
}
