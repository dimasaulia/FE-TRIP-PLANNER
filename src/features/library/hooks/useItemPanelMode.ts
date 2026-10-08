"use client";

import { useCallback, useSyncExternalStore } from "react";

/** How the event/place page opens: beside the library, as a pop-up, or full screen. */
export type ItemPanelMode = "panel" | "popup" | "full";

const KEY = "tp:item-panel-mode";
const listeners = new Set<() => void>();

function read(): ItemPanelMode {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "popup" || value === "full" ? value : "panel";
  } catch {
    return "panel";
  }
}

let memory: ItemPanelMode | null = null;

export function useItemPanelMode() {
  const mode = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => memory ?? read(),
    () => "panel" as ItemPanelMode,
  );

  const setMode = useCallback((next: ItemPanelMode) => {
    memory = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // private mode: keep it for this tab
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [mode, setMode] as const;
}
