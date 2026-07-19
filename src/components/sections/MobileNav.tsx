'use client';

import Link from 'next/link';
import { Disclosure } from '@/components/ui/Disclosure';

const LINKS = [
  { href: '/discover', label: 'Discover' },
  { href: '/popular', label: 'Popular' },
  { href: '/latest', label: 'Latest' },
  { href: '/studios', label: 'Studios' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
];

// ponytail: mobile-only expandable nav. Reuses Disclosure atom; hidden on md+.
export function MobileNav() {
  return (
    <div className="md:hidden w-full border-t border-border">
      <Disclosure title="Browse">
        <nav aria-label="Mobile" className="flex flex-col py-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-[48px] items-center font-mono text-micro uppercase tracking-tag text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Disclosure>
    </div>
  );
}
