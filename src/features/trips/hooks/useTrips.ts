"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys.config";
import { tripService, type TripInput } from "@/features/trips/services/trip.service";
import type { Role, TripDetail } from "@/types/trip.type";

export function useTrips() {
  return useQuery({ queryKey: queryKeys.trips, queryFn: tripService.list });
}

export function useTrip(tripId: string) {
  return useQuery({ queryKey: queryKeys.trip(tripId), queryFn: () => tripService.get(tripId) });
}

export function useUpdateTrip(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<TripInput>) => tripService.update(tripId, input),
    meta: { handlesErrors: true },
    onSuccess: (trip) => {
      queryClient.setQueryData<TripDetail>(queryKeys.trip(tripId), (current) =>
        current ? { ...current, ...trip, members: current.members, calendar_sync: current.calendar_sync } : current,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
    },
  });
}

export function useDeleteTrip(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => tripService.remove(tripId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.trip(tripId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
    },
  });
}

export function useMemberMutations(tripId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.trip(tripId) });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => tripService.updateMember(tripId, userId, role),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (userId: string) => tripService.removeMember(tripId, userId),
    onSuccess: refresh,
  });
  return { updateRole, remove };
}
