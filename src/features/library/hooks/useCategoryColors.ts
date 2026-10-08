"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  assignHues,
  hashHue,
  normalizeCategory,
  storageKey,
  type CategoryHues,
} from "@/features/library/services/category-color.service";

// Tiny external store over localStorage so every component sees the same map.
const cache = new Map<string, CategoryHues>();
const listeners = new Set<() => void>();

function read(tripId: string): CategoryHues {
  const cached = cache.get(tripId);
  if (cached) return cached;
  let value: CategoryHues = {};
  try {
    value = JSON.parse(window.localStorage.getItem(storageKey(tripId)) ?? "{}") as CategoryHues;
  } catch {
    value = {};
  }
  cache.set(tripId, value);
  return value;
}

function write(tripId: string, value: CategoryHues) {
  cache.set(tripId, value);
  try {
    window.localStorage.setItem(storageKey(tripId), JSON.stringify(value));
  } catch {
    // private mode: colours stay in memory for this tab
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: CategoryHues = {};

export function useCategoryColors(tripId: string, labels: Array<string | null | undefined> = []) {
  const hues = useSyncExternalStore(subscribe, () => read(tripId), () => EMPTY);
  const labelKey = labels.filter(Boolean).join("\u0000");

  // Labels seen for the first time (typed here or created by others) get a hue.
  useEffect(() => {
    if (!labelKey) return;
    const current = read(tripId);
    const next = assignHues(current, labelKey.split("\u0000"));
    if (next !== current) write(tripId, next);
  }, [labelKey, tripId]);

  const hueOf = useCallback(
    (label: string | null | undefined): number | null => {
      if (!label) return null;
      const key = normalizeCategory(label);
      // Before the effect stored a hue (or without storage) fall back to a hash.
      return hues[key] ?? hashHue(label);
    },
    [hues],
  );

  const setHue = useCallback(
    (label: string, hue: number) => write(tripId, { ...read(tripId), [normalizeCategory(label)]: hue }),
    [tripId],
  );

  const usedHues = useMemo(() => Object.entries(hues), [hues]);

  return { hueOf, setHue, usedHues };
}
