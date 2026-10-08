import { endpoints } from "@/config/endpoints.config";
import { apiClient } from "@/modules/http/api-client";
import type { CalendarSyncStatus } from "@/types/trip.type";

export const calendarService = {
  /** Full navigation: OAuth consent at Google, then back to `next`. */
  connectUrl: (next: string) => `${endpoints.calendar.connect}?next=${encodeURIComponent(next)}`,
  enable: (tripId: string) => apiClient<CalendarSyncStatus>(endpoints.calendar.sync(tripId), { method: "PUT" }),
  disable: (tripId: string) => apiClient<null>(endpoints.calendar.sync(tripId), { method: "DELETE" }),
  resync: (tripId: string) => apiClient<CalendarSyncStatus>(endpoints.calendar.resync(tripId), { method: "POST" }),
};
