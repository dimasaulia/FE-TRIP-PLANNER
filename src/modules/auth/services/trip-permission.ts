import type { Role } from "@/types/trip.type";

// Frontend rendering only: the backend checks every role again.
export type TripPermission =
  | "content.edit"
  | "trip.edit"
  | "trip.delete"
  | "members.manage"
  | "invites.create"
  | "calendar.sync";

const matrix: Record<Role, readonly TripPermission[]> = {
  owner: ["content.edit", "trip.edit", "trip.delete", "members.manage", "invites.create", "calendar.sync"],
  editor: ["content.edit", "trip.edit", "invites.create", "calendar.sync"],
  viewer: ["calendar.sync"],
};

export function canTrip(role: Role | null | undefined, permission: TripPermission) {
  return role ? matrix[role].includes(permission) : false;
}
