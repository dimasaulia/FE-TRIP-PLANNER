import { create } from "zustand";

export type RemotePreview = {
  blockId: string;
  userId: string;
  start: Date;
  end: Date;
  receivedAt: number;
};

// Drag previews of other members; drawn as a ghost layer, never in the cache.
type PreviewState = {
  previews: Record<string, RemotePreview>;
  put: (preview: RemotePreview) => void;
  remove: (blockId: string) => void;
  expire: (olderThan: number) => void;
  reset: () => void;
};

export const usePreviewStore = create<PreviewState>((set) => ({
  previews: {},
  put: (preview) => set((state) => ({ previews: { ...state.previews, [preview.blockId]: preview } })),
  remove: (blockId) =>
    set((state) => {
      if (!state.previews[blockId]) return state;
      const next = { ...state.previews };
      delete next[blockId];
      return { previews: next };
    }),
  expire: (olderThan) =>
    set((state) => {
      const entries = Object.entries(state.previews).filter(([, preview]) => preview.receivedAt >= olderThan);
      return entries.length === Object.keys(state.previews).length ? state : { previews: Object.fromEntries(entries) };
    }),
  reset: () => set({ previews: {} }),
}));
