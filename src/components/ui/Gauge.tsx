export function Gauge({
  value,
  votes,
  max = 10,
}: {
  value: number;
  votes?: string;
  max?: number;
}) {
  const pct = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 42; // r=42
  const offset = circumference * (1 - pct);
  // teal → amber gradient based on rating
  const color = pct > 0.7 ? 'oklch(var(--primary))' : 'oklch(var(--accent))';

  return (
    <div className="relative w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r="42" fill="none" stroke="oklch(var(--muted))" strokeWidth="4" />
        <circle
          cx="48" cy="48" r="42" fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="font-serif text-title italic">{value}</b>
        {votes && <span className="font-mono text-eyebrow text-muted-foreground">{votes} VOTES</span>}
      </div>
    </div>
  );
}
