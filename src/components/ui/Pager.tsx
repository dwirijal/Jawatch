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

  return (
    <div className="flex gap-1.5 items-center">
      <button
        onClick={() => onChange?.(current - 1)}
        disabled={current <= 1}
        className="font-mono text-xs w-[30px] h-[30px] flex items-center justify-center text-muted border border-border cursor-pointer hover:text-foreground disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange?.(p)}
          className={`font-mono text-xs w-[30px] h-[30px] flex items-center justify-center border cursor-pointer ${
            p === current
              ? 'text-void bg-primary border-amber'
              : 'text-muted border-border hover:text-foreground'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange?.(current + 1)}
        disabled={current >= total}
        className="font-mono text-xs w-[30px] h-[30px] flex items-center justify-center text-muted border border-border cursor-pointer hover:text-foreground disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
