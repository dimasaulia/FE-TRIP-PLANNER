"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Me } from "@/types/trip.type";
import { meQueryKey } from "./hooks/useSession";

/** Seeds the `['me']` query with the profile the server layout already fetched. */
export function SessionProvider({ me, children }: { me: Me; children: React.ReactNode }) {
  const queryClient = useQueryClient();
  useState(() => {
    queryClient.setQueryData(meQueryKey, me);
    return null;
  });
  return children;
}
