"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "tp:library-collapsed";
const listeners = new Set<() => void>();
let memory: boolean | null = null;

function read() {
  if (memory !== null) return memory;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Desktop library sidebar folded to a thin rail; remembered per browser. */
export function useLibraryCollapsed() {
  const collapsed = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => false,
  );

  const setCollapsed = useCallback((value: boolean) => {
    memory = value;
    try {
      window.localStorage.setItem(KEY, value ? "1" : "0");
    } catch {
      // keep in memory
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [collapsed, setCollapsed] as const;
}
