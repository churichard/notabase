import { useEffect } from 'react';

export default function useOnClickOutside(
  element: Element | null,
  handler?: (event: Event) => void
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

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [element, handler]);
}
