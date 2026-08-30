import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

// ----------------------------------------------------------------------

export function useLocalStorage<T>(key: string, initialState: T) {
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    const restored = getStorage(key);

    if (restored && typeof restored === 'object' && !Array.isArray(restored) && restored !== null) {
      queueMicrotask(() => {
        setState((prevValue) => ({
          ...prevValue,
          ...(restored as Partial<T>),
        }) as T);
      });
    }
  }, [key]);

  const updateState = useCallback(
    (updateValue: Partial<T>) => {
      setState((prevValue) => {
        const next = {
          ...prevValue,
          ...updateValue,
        } as T;
        setStorage(key, next);
        return next;
      });
    },
    [key]
  );

  const update = useCallback(
    (name: string, updateValue: unknown) => {
      updateState({
        [name]: updateValue,
      } as Partial<T>);
    },
    [updateState]
  );

  const reset = useCallback(() => {
    removeStorage(key);
    setState(initialState);
  }, [initialState, key]);

  return {
    state,
    update,
    reset,
  };
}

// ----------------------------------------------------------------------

export const getStorage = (key: string) => {
  let value = null;

  try {
    const result = window.localStorage.getItem(key);

    if (result) {
      value = JSON.parse(result);
    }
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }

  return value;
};

export const setStorage = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

export const removeStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};
