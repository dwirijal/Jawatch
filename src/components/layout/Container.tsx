import type { ReactNode } from 'react';
import { container } from '@/components/ui/tokens';

// ponytail: shared page width. Kills the 12x repeated max-w-[1160px] px-4 py-12
// magic literal; tune once here.
export function Container({
  children,
  className = '',
  y = container.pageY,
}: {
  children: ReactNode;
  className?: string;
  y?: string;
}) {
  return (
    <div
      className={`mx-auto px-4 sm:px-8 ${className}`}
      style={{ maxWidth: container.maxWidth, paddingTop: y, paddingBottom: y }}
    >
      {children}
    </div>
  );
}
