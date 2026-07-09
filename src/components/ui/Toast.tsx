export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="animate-toast-in flex gap-2.5 items-center px-4 py-3 border border-amber-dim bg-card font-mono text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      {children}
    </div>
  );
}
