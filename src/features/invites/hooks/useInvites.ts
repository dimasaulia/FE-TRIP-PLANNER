"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys.config";
import { inviteService, type CreateInviteInput } from "@/features/invites/services/invite.service";

export function useInvites(tripId: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.invites(tripId), queryFn: () => inviteService.list(tripId), enabled });
}

export function useCreateInvite(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInviteInput) => inviteService.create(tripId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.invites(tripId) }),
  });
}

export function useRevokeInvite(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => inviteService.revoke(tripId, inviteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.invites(tripId) }),
  });
}
