"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys.config";
import { libraryService, toSummary } from "@/features/library/services/library.service";
import { patchBlockItems, removeById, upsertVersioned } from "@/features/trips/services/realtime-sync.service";
import type { LibraryItem, LibraryItemInput, LibrarySummary } from "@/types/library.type";
import type { ScheduleBlock } from "@/types/schedule.type";

export function useLibrary(tripId: string) {
  return useQuery({ queryKey: queryKeys.library(tripId), queryFn: () => libraryService.listAll(tripId) });
}

export function useLibraryItem(itemId: string | null) {
  return useQuery({
    queryKey: queryKeys.libraryItem(itemId ?? "none"),
    queryFn: () => libraryService.get(itemId!),
    enabled: Boolean(itemId),
    staleTime: 0,
  });
}

/** Writes a server item into both the detail and the list cache. */
export function useStoreLibraryItem(tripId: string) {
  const queryClient = useQueryClient();
  return (item: LibraryItem) => {
    queryClient.setQueryData(queryKeys.libraryItem(item.id), item);
    queryClient.setQueryData<LibrarySummary[]>(queryKeys.library(tripId), (list) =>
      list ? upsertVersioned(list, toSummary(item)) : list,
    );
    patchBlockItems(queryClient, tripId, toSummary(item));
  };
}

export function useCreateLibraryItem(tripId: string) {
  const store = useStoreLibraryItem(tripId);
  return useMutation({
    mutationFn: (input: LibraryItemInput & { kind: LibraryItem["kind"]; title: string }) =>
      libraryService.create(tripId, input),
    onSuccess: store,
  });
}

export function useDeleteLibraryItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, force }: { itemId: string; force?: boolean }) => libraryService.remove(itemId, force),
    meta: { handlesErrors: true },
    onSuccess: (_result, { itemId }) => {
      queryClient.setQueryData<LibrarySummary[]>(queryKeys.library(tripId), (list) => removeById(list, itemId));
      queryClient.setQueryData<ScheduleBlock[]>(queryKeys.schedule(tripId), (list) =>
        list?.filter((block) => block.library_item_id !== itemId),
      );
      queryClient.removeQueries({ queryKey: queryKeys.libraryItem(itemId) });
    },
  });
}

export type { LibraryItemInput };
