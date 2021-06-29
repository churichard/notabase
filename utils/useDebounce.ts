import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function useDebounce<T>(
  value: T,
  delay: number
): [T, Dispatch<SetStateAction<T>>] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, setDebouncedValue];
}
