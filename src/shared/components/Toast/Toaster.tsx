"use client";

import { useEffect } from "react";
import { useToastStore, type ToastItem } from "./toast.store";

function ToastRow({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast.duration, toast.id]);

  return (
    <div
      className="pointer-events-auto flex max-w-md items-center gap-3 rounded-card bg-ink px-4 py-3 text-sm text-page shadow-xl"
      role={toast.tone === "error" ? "alert" : "status"}
    >
      {toast.tone === "error" ? <span aria-hidden className="size-2 rounded-pill bg-danger" /> : null}
      <span className="flex-1">{toast.message}</span>
      {toast.action ? (
        <button
          className="rounded-pill px-2 py-1 font-semibold underline underline-offset-2"
          onClick={() => {
            toast.action?.onClick();
            dismiss(toast.id);
          }}
          type="button"
        >
          {toast.action.label}
        </button>
      ) : null}
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:items-end"
    >
      {toasts.map((item) => (
        <ToastRow key={item.id} toast={item} />
      ))}
    </div>
  );
}
