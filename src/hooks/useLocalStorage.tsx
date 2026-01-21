import { useState, useCallback } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      if (typeof initialValue === "boolean") {
        return (item === "true") as T;
      }

      if (typeof initialValue === "number") {
        return Number(item) as T;
      }

      if (initialValue instanceof Set) {
        return new Set(item.split(",").filter(Boolean)) as T;
      }

      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (valueToStore instanceof Set) {
          window.localStorage.setItem(key, Array.from(valueToStore).join(","));
        } else if (typeof valueToStore === "object") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } else {
          window.localStorage.setItem(key, String(valueToStore));
        }
      } catch (error) {
        console.warn(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
