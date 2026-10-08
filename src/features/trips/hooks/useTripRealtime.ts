"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { queryKeys } from "@/config/query-keys.config";
import { routes } from "@/config/routes.config";
import { usePreferences } from "@/modules/preferences";
import { RealtimeConnection, type PresenceUser, type RealtimeEnvelope } from "@/modules/realtime";
import { toast } from "@/shared/components/Toast";
import { usePresenceStore } from "@/features/presence/stores/presence.store";
import { usePreviewStore } from "@/features/schedule/stores/preview.store";
import { applyRealtimeEvent } from "@/features/trips/services/realtime-sync.service";

const PREVIEW_TTL = 5_000;

/** Opens the trip WebSocket for as long as the trip layout is mounted. */
export function useTripRealtime(tripId: string, myUserId: string | null) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = usePreferences();
  const connectionRef = useRef<RealtimeConnection | null>(null);
  const translate = useRef(t);
  useLayoutEffect(() => {
    translate.current = t;
  });

  useEffect(() => {
    const presence = usePresenceStore.getState();
    const previews = usePreviewStore.getState();
    presence.reset();
    previews.reset();

    const onMessage = (message: RealtimeEnvelope) => {
      switch (message.type) {
        case "hello":
          usePresenceStore.getState().setUsers((message.payload as { presence: PresenceUser[] }).presence ?? []);
          return;
        case "presence.update":
          usePresenceStore.getState().setUsers((message.payload as { users: PresenceUser[] }).users ?? []);
          return;
        case "block.preview": {
          const payload = message.payload as { id: string; start_at: Date; end_at: Date; user_id: string };
          if (payload.user_id === myUserId) return;
          usePreviewStore.getState().put({
            blockId: payload.id,
            userId: payload.user_id,
            start: new Date(payload.start_at),
            end: new Date(payload.end_at),
            receivedAt: Date.now(),
          });
          return;
        }
        case "block.preview_end":
          usePreviewStore.getState().remove((message.payload as { id: string }).id);
          return;
        case "error":
          return;
      }

      const outcome = applyRealtimeEvent(queryClient, tripId, message, myUserId);
      if (outcome.kind === "block_changed") {
        usePreviewStore.getState().remove(outcome.blockId);
      } else if (outcome.kind === "removed_from_trip") {
        toast({ message: translate.current("trips.removedFromTrip"), tone: "error" });
        queryClient.removeQueries({ queryKey: queryKeys.trip(tripId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
        router.replace(routes.allTrips);
      } else if (outcome.kind === "role_changed") {
        toast({ message: translate.current("trips.roleChanged", { role: translate.current(`role.${outcome.role}`) }) });
      }
    };

    const connection = new RealtimeConnection(tripId, {
      onMessage,
      onStatus: (status) => usePresenceStore.getState().setStatus(status),
      onResync: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.library(tripId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.schedule(tripId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.trip(tripId) });
      },
    });
    connectionRef.current = connection;
    connection.connect();

    const sweeper = window.setInterval(() => usePreviewStore.getState().expire(Date.now() - PREVIEW_TTL), 1_000);

    return () => {
      window.clearInterval(sweeper);
      connection.close();
      connectionRef.current = null;
      usePreviewStore.getState().reset();
    };
  }, [myUserId, queryClient, router, tripId]);

  return connectionRef;
}
