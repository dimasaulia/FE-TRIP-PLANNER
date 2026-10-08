"use client";

import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import type { TripPermission } from "@/modules/auth/services/trip-permission";

type TripCanProps = {
  permission: TripPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function TripCan({ permission, children, fallback = null }: TripCanProps) {
  return useTripPermission(permission) ? children : fallback;
}
