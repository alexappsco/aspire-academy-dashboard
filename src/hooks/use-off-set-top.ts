import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------

type ReturnType = boolean;

interface UseScrollOptions extends Omit<ScrollOptions, 'container' | 'target'> {
  container?: React.RefObject<HTMLElement>;
  target?: React.RefObject<HTMLElement>;
}

export function useOffSetTop(top = 0, options?: UseScrollOptions): ReturnType {
  const [value, setValue] = useState(false);

  useEffect(() => {
    const element = options?.container?.current;
    const target = element || window;

    const handleScroll = () => {
      const scrollHeight = element ? element.scrollTop : window.scrollY;
      setValue(scrollHeight > top);
    };

    queueMicrotask(handleScroll);
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [options?.container, top]);

  return value;
}

// Usage
// const offset = useOffSetTop(100);

// Or
// const offset = useOffSetTop(100, {
//   container: ref,
// });
