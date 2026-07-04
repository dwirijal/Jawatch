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
        <label className="font-mono text-[10px] text-muted uppercase tracking-[.07em]">{label}</label>
      )}
      <input
        placeholder={placeholder}
        className="w-full bg-surface border border-hairline text-paper font-sans text-sm px-[14px] py-[11px] mt-1.5 placeholder:text-muted focus:outline-none focus:border-amber transition-colors"
        {...props}
      />
    </div>
  );
}
