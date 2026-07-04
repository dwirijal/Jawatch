export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 items-center px-4 py-3 border border-amber-dim bg-surface font-mono text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
      {children}
    </div>
  );
}
