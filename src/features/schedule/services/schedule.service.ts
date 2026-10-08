import { endpoints } from "@/config/endpoints.config";
import { apiClient } from "@/modules/http/api-client";
import type { BlockInput, ScheduleBlock } from "@/types/schedule.type";

export const scheduleService = {
  /** The whole trip range at once so realtime patches stay one-element edits. */
  list: (tripId: string) =>
    apiClient<{ items: ScheduleBlock[] }>(endpoints.schedule.list(tripId)).then((result) => result.items ?? []),
  create: (tripId: string, input: BlockInput) =>
    apiClient<ScheduleBlock>(endpoints.schedule.create(tripId), { method: "POST", body: input }),
  update: (blockId: string, version: number, input: BlockInput) =>
    apiClient<ScheduleBlock>(endpoints.schedule.block(blockId), { method: "PATCH", body: { ...input, version } }),
  remove: (blockId: string) => apiClient<null>(endpoints.schedule.block(blockId), { method: "DELETE" }),
};
