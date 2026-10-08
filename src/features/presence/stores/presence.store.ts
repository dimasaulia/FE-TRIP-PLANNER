import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { ConnectionStatus, PresenceUser } from "@/modules/realtime";

// Ephemeral, never in the server cache: who is online and what they look at.
type PresenceState = {
  status: ConnectionStatus;
  users: PresenceUser[];
  setStatus: (status: ConnectionStatus) => void;
  setUsers: (users: PresenceUser[]) => void;
  reset: () => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  status: "connecting",
  users: [],
  setStatus: (status) => set({ status }),
  setUsers: (users) => set({ users }),
  reset: () => set({ status: "connecting", users: [] }),
}));

export function useViewersOf(itemId: string, exceptUserId?: string) {
  return usePresenceStore(
    useShallow((state) =>
      state.users.filter(
        (user) => user.user_id !== exceptUserId && user.viewing?.type === "library_item" && user.viewing.id === itemId,
      ),
    ),
  );
}
