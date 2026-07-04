export function Button({
  children,
  variant = 'default',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'ghost';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'font-mono text-xs tracking-[.06em] uppercase px-[26px] py-[13px] border inline-block cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    default: 'border-amber text-amber bg-transparent hover:bg-amber hover:text-void',
    ghost: 'border-hairline text-paper bg-transparent hover:border-paper',
  };
  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}
