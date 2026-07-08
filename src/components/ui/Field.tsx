export function Field({
  label,
  placeholder,
  ...props
}: {
  label?: string;
  placeholder?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && (
        <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-micro">{label}</label>
      )}
      <input
        placeholder={placeholder}
        className="w-full bg-card border border-border text-foreground font-sans text-sm px-[14px] py-[11px] mt-1.5 placeholder:text-muted-foreground focus:outline-none focus:border-amber transition-colors"
        {...props}
      />
    </div>
  );
}
