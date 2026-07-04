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
    <div className="flex gap-7 border-b border-hairline">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`font-mono text-xs uppercase tracking-[.06em] pb-3 cursor-pointer border-b-2 transition-colors ${
            active === tab
              ? 'text-amber border-amber'
              : 'text-muted border-transparent hover:text-paper'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
