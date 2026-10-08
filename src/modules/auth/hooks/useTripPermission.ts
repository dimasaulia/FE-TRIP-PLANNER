"use client";

import { canTrip, type TripPermission } from "@/modules/auth/services/trip-permission";
import { useTripRole } from "@/modules/auth/TripRoleProvider";

export function useTripPermission(permission: TripPermission) {
  return canTrip(useTripRole(), permission);
}
