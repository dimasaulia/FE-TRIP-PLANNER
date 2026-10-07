export const endpoints = {
  auth: {
    session: "/auth/session",
    login: "/auth/login",
    logout: "/auth/logout",
  },
  authorization: {
    snapshot: "/authorization/access-snapshot",
    menus: "/authorization/menus",
  },
  user: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
  },
} as const;
