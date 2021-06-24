import { useEffect } from 'react';

export default function useOnClickOutside(
  element: Element | null,
  handler?: () => void
) {
  useEffect(() => {
    if (!element || !handler) {
      return;
    }

    const listener = (event: Event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!element || element.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [element, handler]);
}
