export type Permission =
  | "dashboard.view"
  | "user.list"
  | "user.create"
  | "user.delete"
  | "settings.view";

export type AccessSnapshot = {
  permissions: Permission[];
};

export const demoAccessSnapshot: AccessSnapshot = {
  permissions: ["dashboard.view", "user.list", "user.create"],
};

export function canAccess(
  snapshot: AccessSnapshot,
  permission: Permission,
): boolean {
  return snapshot.permissions.includes(permission);
}
