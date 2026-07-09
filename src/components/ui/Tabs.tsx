'use client';

import { useState } from 'react';

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: string[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab || tabs[0]);

  return (
    <div role="tablist" className="flex gap-7 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => setActive(tab)}
          className={`font-mono text-xs uppercase tracking-xs pb-3 cursor-pointer border-b-2 transition-[color,border-color,transform] motion-safe:active:translate-y-px ${
            active === tab
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
