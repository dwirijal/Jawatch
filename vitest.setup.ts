// ponytail: jsdom lacks IntersectionObserver; framer-motion whileInView needs it.
// Stub fires the callback once as "in view" so Reveal renders its children in tests.
import { vi } from 'vitest';
import { createElement } from 'react';

class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = '';
  thresholds = [];
}
globalThis.IntersectionObserver = IO as unknown as typeof IntersectionObserver;

// next/image validates hosts against next.config.js, which vitest does not load.
// Mock it to a plain <img> so component tests don't depend on image config.
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { src, alt, fill, priority, sizes, ...rest } = props;
    return createElement('img', { src, alt: alt ?? '', ...rest });
  },
}));
