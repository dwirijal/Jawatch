import { size } from '@/components/ui/tokens';

export function Pager({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange?: (page: number) => void;
}) {
  const pages = Array.from({ length: Math.min(total, 5) }, (_, i) => i + 1);
  const control = { width: size.control, height: size.control };

  return (
    <div className="flex gap-1.5 items-center">
      <button
        onClick={() => onChange?.(current - 1)}
        disabled={current <= 1}
        style={control}
        className="font-mono text-xs flex items-center justify-center text-muted-foreground border border-border cursor-pointer hover:text-foreground disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange?.(p)}
          style={control}
          className={`font-mono text-xs flex items-center justify-center border cursor-pointer ${
            p === current
              ? 'text-void bg-primary border-amber'
              : 'text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange?.(current + 1)}
        disabled={current >= total}
        style={control}
        className="font-mono text-xs flex items-center justify-center text-muted-foreground border border-border cursor-pointer hover:text-foreground disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
