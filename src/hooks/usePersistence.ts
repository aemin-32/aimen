import React, { useState, useEffect, useRef } from 'react';

export function usePersistence<T>(
  key: string,
  initialValue: T,
  _firestorePath?: string, // Kept for signature compatibility but unused
  transform?: (data: any) => T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const isLoaded = useRef(false);

  // ⚪ GUEST/LOCAL: Load from LocalStorage (One-time fetch)
  useEffect(() => {
    try {
      const local = localStorage.getItem(key);
      if (local) {
        let parsed = JSON.parse(local);
        if (transform) parsed = transform(parsed);
        setData(parsed as T);
      } else {
        setData(initialValue);
      }
    } catch (err) {
      console.warn(`Error loading local ${key}:`, err);
      setData(initialValue);
    }
    setLoading(false);
    isLoaded.current = true;
  }, [key]); // Removed initialValue and transform to avoid re-runs

  // Save Listener (Debounced)
  useEffect(() => {
    if (!isLoaded.current) return;

    const handler = setTimeout(() => {
      // ⚪ SAVE TO LOCALSTORAGE
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error(`Error saving ${key} to localStorage:`, err);
      }
    }, 100); // ⚡ 0.1s debounce

    return () => clearTimeout(handler);
  }, [data, key]);

  return [data, setData, loading];
}
