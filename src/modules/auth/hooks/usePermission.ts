"use client";

import {
  canAccess,
  demoAccessSnapshot,
  type Permission,
} from "@/modules/auth/services/access-snapshot.service";

export function usePermission(permission: Permission) {
  return canAccess(demoAccessSnapshot, permission);
}
