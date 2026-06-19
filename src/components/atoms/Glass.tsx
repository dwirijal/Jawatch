import type { ReactNode } from "react";

export function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-xl bg-[var(--ja-bg)/0.8] border border-[var(--ja-border)] ${className}`}>
      {children}
    </div>
  );
}

export function Surface({ children, className = "", as: As = "div" }: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <As className={`bg-[var(--ja-surface)] rounded-[var(--ja-r-lg)] border border-[var(--ja-border)] ${className}`}>
      {children}
    </As>
  );
}
