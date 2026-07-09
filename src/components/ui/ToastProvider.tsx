'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastItem = { id: number; message: string };

const ToastContext = createContext<((message: string) => void) | null>(null);

const DISMISS_MS = 2500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);

  useEffect(() => setMounted(true), []);

  const notify = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed bottom-4 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2 px-4 sm:bottom-6"
            aria-live="polite"
            aria-atomic="false"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                role="status"
                className="motion-safe:animate-toast-in flex items-center gap-2.5 rounded-pill border border-border bg-card/95 px-4 py-3 font-mono text-xs text-foreground shadow-toast backdrop-blur-sm"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {t.message}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

// Returns a notify(message) fn. No-op outside a provider so callers never crash.
export function useToast(): (message: string) => void {
  return useContext(ToastContext) ?? (() => {});
}
