import { useRef, useEffect, useState, ReactElement } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  children: ReactElement;
  selector?: string;
};

export default function Portal({ children, selector }: Props) {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector(selector ?? '#__next');
    setMounted(true);
  }, [selector]);

  return mounted && ref.current ? createPortal(children, ref.current) : null;
}
