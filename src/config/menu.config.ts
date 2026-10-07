import { routes } from "@/config/routes.config";
import type { AppMenuItem } from "@/types/menu.type";

export const fallbackMenu: AppMenuItem[] = [
  {
    label: "Overview",
    href: routes.dashboard,
    permission: "dashboard.view",
  },
  {
    label: "Users",
    href: routes.users,
    permission: "user.list",
  },
];
