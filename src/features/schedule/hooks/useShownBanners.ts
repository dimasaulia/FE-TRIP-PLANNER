"use client";

import { useCallback, useSyncExternalStore } from "react";

// Per-browser view preference. Timeline blocks show only their colour by
// default; this set holds the blocks whose banner was switched on.
const listeners = new Set<() => void>();
const cache = new Map<string, Set<string>>();
const EMPTY = new Set<string>();

const key = (tripId: string) => `tp:shown-banners:v1:${tripId}`;

function read(tripId: string) {
  let value = cache.get(tripId);
  if (!value) {
    try {
      value = new Set(JSON.parse(window.localStorage.getItem(key(tripId)) ?? "[]") as string[]);
    } catch {
      value = new Set();
    }
    cache.set(tripId, value);
  }
  return value;
}

export function useShownBanners(tripId: string) {
  const shown = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => read(tripId),
    () => EMPTY,
  );

  const toggle = useCallback(
    (blockId: string) => {
      const next = new Set(read(tripId));
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      cache.set(tripId, next);
      try {
        window.localStorage.setItem(key(tripId), JSON.stringify([...next]));
      } catch {
        // private mode: keep it in memory
      }
      listeners.forEach((listener) => listener());
    },
    [tripId],
  );

  return { shown, toggle };
}
