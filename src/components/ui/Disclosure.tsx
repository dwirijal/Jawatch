'use client';

import { useId, useState, type ReactNode } from 'react';
import { pad, radius, text, tracking } from './tokens';

// ponytail: expandable atom. Token-driven, animated via grid-rows (no layout thrash).
export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border border-border bg-card/40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left font-mono uppercase text-foreground transition-colors hover:text-primary focus-visible:text-primary"
        style={{ fontSize: text.tag, letterSpacing: tracking.micro, padding: pad.control, minHeight: '44px' }}
      >
        <span>{title}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          style={{ width: '16px', height: '16px' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        id={panelId}
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div style={{ padding: `0 ${pad.control}` }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
