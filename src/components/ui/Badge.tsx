export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'amber' | 'teal' | 'solid';
}) {
  const base = 'font-mono text-[10px] tracking-[.07em] uppercase px-[9px] py-1 border rounded-[2px]';
  const styles = {
    default: 'border-hairline text-muted',
    amber: 'border-amber-dim text-amber',
    teal: 'border-teal text-teal-bright',
    solid: 'bg-amber text-void border-amber',
  };
  return <span className={`${base} ${styles[variant]}`}>{children}</span>;
}
