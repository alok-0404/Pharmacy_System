import { useEffect, useRef, type RefObject } from 'react';

/** Tracks whether the user is near the bottom of a scroll container. */
export function useChatScroll(containerRef: RefObject<HTMLElement | null>) {
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      isNearBottomRef.current = distanceFromBottom < 100;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  return { isNearBottomRef, scrollToBottom };
}
