import { useEffect, useRef } from 'react';

/** Re-runs callback on an interval while the tab is visible. */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
): void {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      return;
    }

    const tick = () => {
      if (document.visibilityState === 'hidden') {
        return;
      }

      void savedCallback.current();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void savedCallback.current();
      }
    };

    const id = window.setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs, enabled]);
}
