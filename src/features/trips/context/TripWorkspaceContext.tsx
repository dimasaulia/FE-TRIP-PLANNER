"use client";

import { createContext, useContext } from "react";
import type { TripDetail, User } from "@/types/trip.type";

export type TripWorkspace = {
  trip: TripDetail;
  me: User;
  /** Sends a client → server realtime message (presence, drag preview). */
  send: (type: string, payload: unknown) => void;
};

const TripWorkspaceContext = createContext<TripWorkspace | null>(null);

export function TripWorkspaceProvider({ value, children }: { value: TripWorkspace; children: React.ReactNode }) {
  return <TripWorkspaceContext.Provider value={value}>{children}</TripWorkspaceContext.Provider>;
}

export function useTripWorkspace() {
  const context = useContext(TripWorkspaceContext);
  if (!context) throw new Error("useTripWorkspace must be used inside a trip");
  return context;
}

export function useMemberName() {
  const { trip } = useTripWorkspace();
  return (userId: string | null | undefined) => trip.members.find((member) => member.user_id === userId);
}
