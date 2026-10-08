"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { snap } from "@/shared/time";
import { tokens } from "@/styles/tokens";

export type DragMode = "move" | "top" | "bottom";

type DragOptions = {
  /** Block position in minutes since the day start. */
  start: number;
  end: number;
  pxPerMinute: number;
  disabled: boolean;
  /** Neighbour limits, computed once when the drag starts. */
  limits: () => { min: number; max: number };
  formatRange: (start: number, end: number) => string;
  onPreview: (start: number, end: number) => void;
  onEnd: (changed: boolean) => void;
  onCommit: (start: number, end: number) => void;
  onClick: () => void;
  /** A move drag started or finished (shows the trash zone). */
  onDragActive?: (active: boolean) => void;
  /** Released over the trash zone. */
  onTrash?: () => void;
};

/** The drop zone that deletes a dragged block; looked up by id, no React state per move. */
export const TRASH_ZONE_ID = "schedule-trash-zone";

function overTrash(x: number, y: number) {
  const zone = document.getElementById(TRASH_ZONE_ID);
  if (!zone) return false;
  const rect = zone.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

const THRESHOLD_PX = 4;
const PREVIEW_INTERVAL_MS = 50; // ~20 messages per second
const { snapMinutes, minBlockMinutes } = tokens.timeline;

/**
 * Move and resize with pointer events. Geometry lives in a ref and the element
 * moves through `transform` in requestAnimationFrame: no React render per move.
 */
export function useBlockDrag(options: DragOptions) {
  const elementRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });
  const settling = useRef(false);

  // Once the new position arrived through props (optimistic update) the
  // temporary transform is dropped in the same frame.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || !settling.current) return;
    settling.current = false;
    element.style.transform = "";
    element.style.height = "";
    requestAnimationFrame(() => element.removeAttribute("data-dragging"));
  }, [options.start, options.end]);

  const startDrag = useCallback((mode: DragMode, event: React.PointerEvent) => {
    const current = optionsRef.current;
    if (event.button !== 0) return;
    if (current.disabled) {
      if (mode === "move") current.onClick();
      return;
    }
    event.stopPropagation();

    const element = elementRef.current;
    if (!element) return;
    const pointerId = event.pointerId;
    const originY = event.clientY;
    const origin = { start: current.start, end: current.end };
    const limits = current.limits();
    let active = false;
    let next = { ...origin };
    let frame = 0;
    let lastPreview = 0;
    let trashed = false;

    const setTrashed = (value: boolean) => {
      if (value === trashed) return;
      trashed = value;
      document.getElementById(TRASH_ZONE_ID)?.toggleAttribute("data-over", value);
      element.toggleAttribute("data-over-trash", value);
    };
    const reset = () => {
      element.style.transform = "";
      element.style.height = "";
      element.removeAttribute("data-dragging");
      element.removeAttribute("data-over-trash");
    };

    const render = () => {
      frame = 0;
      const { pxPerMinute, formatRange } = optionsRef.current;
      element.style.transform = `translateY(${(next.start - origin.start) * pxPerMinute}px)`;
      element.style.height = `${(next.end - next.start) * pxPerMinute}px`;
      if (labelRef.current) labelRef.current.textContent = formatRange(next.start, next.end);
    };

    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const dy = moveEvent.clientY - originY;
      if (!active) {
        if (Math.abs(dy) < THRESHOLD_PX) return;
        active = true;
        element.setAttribute("data-dragging", mode);
        element.setPointerCapture?.(pointerId);
        if (mode === "move") optionsRef.current.onDragActive?.(true);
      }
      if (mode === "move") setTrashed(Boolean(optionsRef.current.onTrash) && overTrash(moveEvent.clientX, moveEvent.clientY));
      const delta = dy / optionsRef.current.pxPerMinute;
      const duration = origin.end - origin.start;

      if (mode === "move") {
        const start = Math.min(Math.max(snap(origin.start + delta, snapMinutes), limits.min), limits.max - duration);
        next = { start, end: start + duration };
      } else if (mode === "top") {
        const start = Math.min(Math.max(snap(origin.start + delta, snapMinutes), limits.min), origin.end - minBlockMinutes);
        next = { start, end: origin.end };
      } else {
        const end = Math.max(Math.min(snap(origin.end + delta, snapMinutes), limits.max), origin.start + minBlockMinutes);
        next = { start: origin.start, end };
      }

      if (!frame) frame = requestAnimationFrame(render);
      const now = performance.now();
      if (now - lastPreview >= PREVIEW_INTERVAL_MS) {
        lastPreview = now;
        optionsRef.current.onPreview(next.start, next.end);
      }
    };

    const up = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (frame) cancelAnimationFrame(frame);

      if (!active) {
        if (mode === "move" && upEvent.type === "pointerup") optionsRef.current.onClick();
        return;
      }
      if (mode === "move") optionsRef.current.onDragActive?.(false);
      if (trashed) {
        setTrashed(false);
        reset();
        optionsRef.current.onEnd(false);
        optionsRef.current.onTrash?.();
        return;
      }
      const changed = next.start !== origin.start || next.end !== origin.end;
      optionsRef.current.onEnd(changed);
      if (changed) {
        render();
        settling.current = true;
        optionsRef.current.onCommit(next.start, next.end);
        // Safety net when no new position ever arrives (request failed early).
        window.setTimeout(() => {
          if (!settling.current) return;
          settling.current = false;
          element.style.transform = "";
          element.style.height = "";
          element.removeAttribute("data-dragging");
        }, 2_000);
      } else {
        reset();
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, []);

  return { elementRef, labelRef, startDrag };
}
