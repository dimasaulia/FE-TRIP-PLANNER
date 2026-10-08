import { create } from "zustand";

export type ToastTone = "info" | "success" | "error";

export type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
  duration: number;
};

type ToastState = {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id" | "duration" | "tone"> & Partial<Pick<ToastItem, "duration" | "tone">>) => number;
  dismiss: (id: number) => void;
};

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { tone: "info", duration: 4000, ...toast, id }],
    }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Imperative toast usable outside React (query cache handlers). */
export const toast = (input: Parameters<ToastState["push"]>[0]) => useToastStore.getState().push(input);
