"use client";

import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { Permission } from "@/modules/auth/services/access-snapshot.service";

type CanProps = {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = usePermission(permission);

  if (!allowed) {
    return fallback;
  }

  return children;
}
