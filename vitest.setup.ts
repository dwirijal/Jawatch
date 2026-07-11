// ponytail: jsdom lacks IntersectionObserver; framer-motion whileInView needs it.
// Stub fires the callback once as "in view" so Reveal renders its children in tests.
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
