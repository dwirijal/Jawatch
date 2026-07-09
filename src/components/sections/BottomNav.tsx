'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, Library } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/discover', label: 'Jelajah', icon: Compass },
  { href: '/search', label: 'Cari', icon: Search },
  { href: '/library', label: 'Library', icon: Library },
] as const;

// Thumb-zone tab bar for mobile (hidden md+). Active-route highlight, 48px targets,
// safe-area inset for notched devices. Retention: one-tap reach to core surfaces.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 font-mono text-micro uppercase tracking-tag transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform motion-safe:group-active:scale-90 ${active ? 'scale-110' : ''}`}
                  aria-hidden="true"
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
