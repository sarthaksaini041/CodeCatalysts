import { useEffect, useRef } from 'react';

const DEFAULT_FOCUS_SELECTOR = 'input:not([type="hidden"]), textarea, select';

export function useAdminEditorAutoReveal(isOpen, {
  focusSelector = DEFAULT_FOCUS_SELECTOR,
  topOffset = 96,
} = {}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return undefined;
    }

    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }

    const rafId = window.requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      const viewportTop = topOffset;
      const viewportBottom = window.innerHeight - 24;
      const isFullyVisible = rect.top >= viewportTop && rect.bottom <= viewportBottom;

      if (!isFullyVisible) {
        panel.scrollIntoView({
          behavior: 'auto',
          block: 'start',
          inline: 'nearest',
        });
      }

      const focusTarget = panel.querySelector(focusSelector);
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus({ preventScroll: true });
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [focusSelector, isOpen, topOffset]);

  return panelRef;
}
