import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys.config";
import type { RealtimeEnvelope } from "@/modules/realtime";
import type { LibrarySummary } from "@/types/library.type";
import type { ScheduleBlock } from "@/types/schedule.type";
import type { MemberChange, Trip, TripDetail } from "@/types/trip.type";

type Versioned = { id: string; version: number };

export type SyncOutcome =
  | { kind: "none" }
  | { kind: "removed_from_trip" }
  | { kind: "role_changed"; role: TripDetail["my_role"] }
  | { kind: "block_changed"; blockId: string; userId: string | null };

/** Insert or replace by id, dropping events older than what the cache holds. */
export function upsertVersioned<T extends Versioned>(list: T[] | undefined, incoming: T): T[] | undefined {
  if (!list) return list;
  const index = list.findIndex((entry) => entry.id === incoming.id);
  if (index === -1) return [...list, incoming];
  if (list[index].version >= incoming.version) return list;
  const next = list.slice();
  next[index] = incoming;
  return next;
}

export function removeById<T extends { id: string }>(list: T[] | undefined, id: string): T[] | undefined {
  return list?.some((entry) => entry.id === id) ? list.filter((entry) => entry.id !== id) : list;
}

/** Blocks embed a summary of their library item; keep it in step with the item. */
export function patchBlockItems(queryClient: QueryClient, tripId: string, item: LibrarySummary) {
  queryClient.setQueryData<ScheduleBlock[]>(queryKeys.schedule(tripId), (list) =>
    list?.some((block) => block.library_item_id === item.id)
      ? list.map((block) =>
          block.library_item_id === item.id
            ? {
                ...block,
                library_item: {
                  id: item.id,
                  kind: item.kind,
                  title: item.title,
                  location_name: item.location_name,
                  category: item.category,
                },
              }
            : block,
        )
      : list,
  );
}

/**
 * Patches the TanStack Query cache from one committed realtime event so other
 * members' changes appear without a refetch.
 */
export function applyRealtimeEvent(
  queryClient: QueryClient,
  tripId: string,
  message: RealtimeEnvelope,
  myUserId: string | null,
): SyncOutcome {
  switch (message.type) {
    case "library.created":
    case "library.updated": {
      const item = message.payload as LibrarySummary;
      queryClient.setQueryData<LibrarySummary[]>(queryKeys.library(tripId), (list) => upsertVersioned(list, item));
      if (message.type === "library.updated") {
        patchBlockItems(queryClient, tripId, item);
        // The open item page resolves conflicts itself (409); just mark it stale.
        void queryClient.invalidateQueries({ queryKey: queryKeys.libraryItem(item.id), refetchType: "none" });
      }
      return { kind: "none" };
    }
    case "library.deleted": {
      const item = message.payload as LibrarySummary;
      queryClient.setQueryData<LibrarySummary[]>(queryKeys.library(tripId), (list) => removeById(list, item.id));
      queryClient.removeQueries({ queryKey: queryKeys.libraryItem(item.id) });
      return { kind: "none" };
    }
    case "block.created":
    case "block.updated": {
      const block = message.payload as ScheduleBlock;
      queryClient.setQueryData<ScheduleBlock[]>(queryKeys.schedule(tripId), (list) => upsertVersioned(list, block));
      return { kind: "block_changed", blockId: block.id, userId: block.updated_by };
    }
    case "block.deleted": {
      const block = message.payload as ScheduleBlock;
      queryClient.setQueryData<ScheduleBlock[]>(queryKeys.schedule(tripId), (list) => removeById(list, block.id));
      return { kind: "block_changed", blockId: block.id, userId: null };
    }
    case "trip.updated": {
      const trip = message.payload as Trip;
      queryClient.setQueryData<TripDetail>(queryKeys.trip(tripId), (current) =>
        current ? { ...current, ...trip, my_role: current.my_role, members: current.members, calendar_sync: current.calendar_sync } : current,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
      return { kind: "none" };
    }
    case "member.changed": {
      const change = message.payload as MemberChange;
      if (change.user_id === myUserId && change.action === "removed") {
        return { kind: "removed_from_trip" };
      }
      let outcome: SyncOutcome = { kind: "none" };
      queryClient.setQueryData<TripDetail>(queryKeys.trip(tripId), (current) => {
        if (!current) return current;
        let members = current.members.filter((member) => member.user_id !== change.user_id);
        if (change.action !== "removed" && change.member) members = [...members, change.member];
        let myRole = current.my_role;
        if (change.user_id === myUserId && change.member) {
          myRole = change.member.role;
          outcome = { kind: "role_changed", role: myRole };
        }
        return { ...current, members, my_role: myRole };
      });
      return outcome;
    }
    default:
      return { kind: "none" };
  }
}
