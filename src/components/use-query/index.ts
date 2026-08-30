import { useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Options {
  replace?: boolean;
  scroll?: boolean;
  removeOld?: boolean;
}

export function useQuery<TQuery extends string>(
  queries: TQuery[],
  initialOptions: Omit<Options, 'removeOld'> = { replace: false, scroll: true }
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    return queries.reduce(
      (acc, cur) => {
        acc[cur] = searchParams.get(cur);
        return acc;
      },
      {} as Record<TQuery, string | null>
    );
  }, [queries, searchParams]);

  const setPathname = useCallback(
    (value: string, options: Options = {}) => {
      const replaceValue = options.replace == undefined ? initialOptions.replace : options.replace;
      const scrollValue = options.scroll == undefined ? initialOptions.scroll : options.scroll;

      if (replaceValue) {
        router.replace(value, { scroll: scrollValue });
      } else {
        router.push(value, { scroll: scrollValue });
      }
    },
    [initialOptions.replace, initialOptions.scroll, router]
  );

  const clear = useCallback(
    (options: Omit<Options, 'removeOld'> = {}) => {
      setPathname(pathname, options);
    },
    [pathname, setPathname]
  );

  const set = useCallback(
    (items: Partial<Record<TQuery, string | null>>, options: Options = {}) => {
      const params = new URLSearchParams(!options.removeOld ? searchParams.toString() : undefined);
      for (const name in items) {
        const value = items[name];
        if (value) {
          params.set(name, value);
        } else if (params.has(name)) {
          params.delete(name);
        }
      }
      setPathname(`${pathname}?${params.toString()}`, options);
    },
    [pathname, searchParams, setPathname]
  );

  return { values, clear, set };
}