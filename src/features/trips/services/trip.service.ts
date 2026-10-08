import { endpoints } from "@/config/endpoints.config";
import { apiClient } from "@/modules/http/api-client";
import type { Role, Trip, TripDetail, TripListItem, TripMember } from "@/types/trip.type";

export type TripInput = {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  timezone: string;
  banner_url?: string | null;
};

export const tripService = {
  list: () => apiClient<{ items: TripListItem[] }>(endpoints.trips.list).then((result) => result.items ?? []),
  get: (tripId: string) => apiClient<TripDetail>(endpoints.trips.detail(tripId)),
  create: (input: TripInput) => apiClient<Trip>(endpoints.trips.list, { method: "POST", body: input }),
  update: (tripId: string, input: Partial<TripInput>) =>
    apiClient<Trip>(endpoints.trips.detail(tripId), { method: "PATCH", body: input }),
  remove: (tripId: string) => apiClient<null>(endpoints.trips.detail(tripId), { method: "DELETE" }),
  updateMember: (tripId: string, userId: string, role: Role) =>
    apiClient<TripMember>(endpoints.trips.member(tripId, userId), { method: "PATCH", body: { role } }),
  removeMember: (tripId: string, userId: string) =>
    apiClient<null>(endpoints.trips.member(tripId, userId), { method: "DELETE" }),
};
