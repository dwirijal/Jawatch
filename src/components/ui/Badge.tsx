export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'solid';
}) {
  const base = 'font-mono text-tag uppercase px-2.5 py-1 border rounded-sm';
  const styles = {
    default: 'border-border text-muted-foreground',
    primary: 'border-primary/60 text-primary',
    accent: 'border-accent/60 text-accent',
    solid: 'bg-primary text-primary-foreground border-primary',
  };
  return <span className={`${base} ${styles[variant]}`}>{children}</span>;
}
