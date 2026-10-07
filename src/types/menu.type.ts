import type { Permission } from "@/modules/auth/services/access-snapshot.service";

export type AppMenuItem = {
  label: string;
  href: string;
  permission: Permission;
};
