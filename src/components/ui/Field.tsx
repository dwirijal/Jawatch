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
        <label className="font-mono text-tag text-muted-foreground uppercase">{label}</label>
      )}
      <input
        placeholder={placeholder}
        className="w-full bg-card border border-border text-foreground font-sans text-body px-3.5 py-2.5 mt-1.5 placeholder:text-muted-foreground focus:outline-none focus:border-amber transition-colors"
        {...props}
      />
    </div>
  );
}
