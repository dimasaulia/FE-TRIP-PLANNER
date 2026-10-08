"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/types/trip.type";

const TripRoleContext = createContext<Role | null>(null);

export function TripRoleProvider({ role, children }: { role: Role | null; children: React.ReactNode }) {
  return <TripRoleContext.Provider value={role}>{children}</TripRoleContext.Provider>;
}

export function useTripRole() {
  return useContext(TripRoleContext);
}
