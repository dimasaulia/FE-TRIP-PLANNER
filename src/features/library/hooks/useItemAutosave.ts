"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { libraryService } from "@/features/library/services/library.service";
import { useStoreLibraryItem } from "@/features/library/hooks/useLibrary";
import { isApiError } from "@/modules/http/api-error";
import type { LibraryItem, LibraryItemInput } from "@/types/library.type";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

const DEBOUNCE_MS = 800;

/** In-memory copy of local edits taken before loading someone else's version. */
export const localBackups = new Map<string, LibraryItemInput>();

/**
 * Debounced PATCH of only the changed fields plus `version`. A 409 keeps the
 * local fields and exposes the server copy so the user picks a side.
 */
export function useItemAutosave(item: LibraryItem, tripId: string) {
  const store = useStoreLibraryItem(tripId);
  const pending = useRef<LibraryItemInput>({});
  const version = useRef(item.version);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [conflict, setConflict] = useState<LibraryItem | null>(null);
  const [resetKey, setResetKey] = useState(0);
  // Latest flush/conflict for timers created in earlier renders.
  const flushRef = useRef<() => Promise<void>>(async () => undefined);
  const conflictRef = useRef<LibraryItem | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (inFlight.current || Object.keys(pending.current).length === 0) return;

    const fields = pending.current;
    pending.current = {};
    inFlight.current = true;
    setStatus("saving");
    try {
      const saved = await libraryService.update(item.id, version.current, fields);
      version.current = saved.version;
      store(saved);
      setStatus(Object.keys(pending.current).length ? "dirty" : "saved");
    } catch (error) {
      pending.current = { ...fields, ...pending.current };
      if (isApiError(error, "version_conflict")) {
        setConflict((error.details.current as LibraryItem | undefined) ?? null);
        setStatus("conflict");
      } else {
        setStatus("error");
      }
    } finally {
      inFlight.current = false;
    }
    if (Object.keys(pending.current).length && !timer.current) {
      timer.current = setTimeout(() => void flushRef.current(), DEBOUNCE_MS);
    }
  }, [item.id, store]);

  const queue = useCallback((fields: LibraryItemInput) => {
    pending.current = { ...pending.current, ...fields };
    setStatus((current) => (current === "conflict" ? current : "dirty"));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!conflictRef.current) void flushRef.current();
    }, DEBOUNCE_MS);
  }, []);

  useLayoutEffect(() => {
    flushRef.current = flush;
    conflictRef.current = conflict;
  });

  /** Load the newer server copy; local edits are kept in `localBackups`. */
  const reloadLatest = useCallback(() => {
    if (!conflict) return;
    localBackups.set(item.id, { ...pending.current });
    pending.current = {};
    version.current = conflict.version;
    store(conflict);
    setConflict(null);
    setStatus("saved");
    setResetKey((key) => key + 1);
  }, [conflict, item.id, store]);

  /** Re-send local edits on top of the newer version. */
  const overwrite = useCallback(() => {
    if (!conflict) return;
    version.current = conflict.version;
    setConflict(null);
    void flushRef.current();
  }, [conflict]);

  // Warn before leaving with unsaved changes; flush when the panel closes.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (Object.keys(pending.current).length || inFlight.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (!conflictRef.current) void flushRef.current();
    };
  }, []);

  return { status, conflict, queue, flush, reloadLatest, overwrite, resetKey, retry: flush };
}
