"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/modules/auth/services/session.service";
import type { Me } from "@/types/trip.type";

export const meQueryKey = ["me"] as const;

export function useSession(initialData?: Me) {
  return useQuery({ queryKey: meQueryKey, queryFn: sessionService.me, initialData, staleTime: 60_000 });
}

/** Current user; only valid below a protected layout that seeded `['me']`. */
export function useCurrentUser() {
  return useSession().data?.user ?? null;
}
