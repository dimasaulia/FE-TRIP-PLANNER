"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys.config";
import { scheduleService } from "@/features/schedule/services/schedule.service";
import { errorMessageKey } from "@/modules/http/error-message";
import { isApiError } from "@/modules/http/api-error";
import { usePreferences } from "@/modules/preferences";
import { toast } from "@/shared/components/Toast";
import type { BlockInput, BlockItemSummary, ScheduleBlock } from "@/types/schedule.type";

export function useSchedule(tripId: string) {
  return useQuery({ queryKey: queryKeys.schedule(tripId), queryFn: () => scheduleService.list(tripId) });
}

type CreateVariables = BlockInput & { start_at: Date; end_at: Date; item?: BlockItemSummary | null };

let tempCounter = 0;

export function useCreateBlock(tripId: string, myUserId: string) {
  const queryClient = useQueryClient();
  const { t } = usePreferences();
  const key = queryKeys.schedule(tripId);

  return useMutation({
    mutationFn: (variables: CreateVariables) => {
      const input: BlockInput & { item?: unknown } = { ...variables };
      delete input.item;
      return scheduleService.create(tripId, input);
    },
    meta: { handlesErrors: true },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: key });
      const tempId = `temp-${++tempCounter}`;
      const now = new Date();
      const optimistic: ScheduleBlock = {
        id: tempId,
        trip_id: tripId,
        library_item_id: variables.library_item_id ?? null,
        library_item: variables.item
          ? {
              id: variables.item.id,
              kind: variables.item.kind,
              title: variables.item.title,
              location_name: variables.item.location_name,
              category: variables.item.category,
            }
          : null,
        title: variables.title ?? null,
        note: variables.note ?? "",
        hue: variables.hue ?? null,
        start_at: variables.start_at,
        end_at: variables.end_at,
        created_by: myUserId,
        updated_by: myUserId,
        version: 0,
        created_at: now,
        updated_at: now,
      };
      queryClient.setQueryData<ScheduleBlock[]>(key, (list) => (list ? [...list, optimistic] : [optimistic]));
      return { tempId };
    },
    onSuccess: (block, _variables, context) => {
      queryClient.setQueryData<ScheduleBlock[]>(key, (list = []) => [
        ...list.filter((entry) => entry.id !== context?.tempId && entry.id !== block.id),
        block,
      ]);
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData<ScheduleBlock[]>(key, (list) => list?.filter((entry) => entry.id !== context?.tempId));
      toast({ message: t(errorMessageKey(error)), tone: "error" });
    },
  });
}

type UpdateVariables = { block: ScheduleBlock; input: BlockInput };

export function useUpdateBlock(tripId: string) {
  const queryClient = useQueryClient();
  const { t } = usePreferences();
  const key = queryKeys.schedule(tripId);

  return useMutation({
    mutationFn: ({ block, input }: UpdateVariables) => scheduleService.update(block.id, block.version, input),
    meta: { handlesErrors: true },
    onMutate: async ({ block, input }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ScheduleBlock[]>(key);
      queryClient.setQueryData<ScheduleBlock[]>(key, (list) =>
        list?.map((entry) =>
          entry.id === block.id
            ? {
                ...entry,
                ...(input.start_at ? { start_at: input.start_at } : {}),
                ...(input.end_at ? { end_at: input.end_at } : {}),
                ...(input.title !== undefined ? { title: input.title } : {}),
                ...(input.note !== undefined ? { note: input.note } : {}),
                ...(input.hue !== undefined ? { hue: input.hue } : {}),
              }
            : entry,
        ),
      );
      return { previous };
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<ScheduleBlock[]>(key, (list) =>
        list?.map((entry) => (entry.id === saved.id && entry.version <= saved.version ? saved : entry)),
      );
    },
    onError: (error, _variables, context) => {
      if (isApiError(error, "version_conflict")) {
        // Someone else moved it first: take the server state and let the block slide back.
        void queryClient.invalidateQueries({ queryKey: key });
        toast({ message: t("errors.version_conflict"), tone: "error" });
        return;
      }
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast({ message: t(errorMessageKey(error)), tone: "error" });
    },
  });
}

export function useDeleteBlock(tripId: string, myUserId: string) {
  const queryClient = useQueryClient();
  const { t } = usePreferences();
  const key = queryKeys.schedule(tripId);
  const create = useCreateBlock(tripId, myUserId);

  return useMutation({
    mutationFn: (block: ScheduleBlock) => scheduleService.remove(block.id),
    onMutate: async (block) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ScheduleBlock[]>(key);
      queryClient.setQueryData<ScheduleBlock[]>(key, (list) => list?.filter((entry) => entry.id !== block.id));
      return { previous };
    },
    onSuccess: (_result, block) => {
      toast({
        message: t("schedule.deleted"),
        duration: 5_000,
        action: {
          label: t("common.undo"),
          // Undo recreates the block with the same data.
          onClick: () =>
            create.mutate({
              library_item_id: block.library_item_id,
              title: block.title,
              note: block.note,
              hue: block.hue,
              start_at: block.start_at,
              end_at: block.end_at,
              item: block.library_item,
            }),
        },
      });
    },
    onError: (_error, _block, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
}
