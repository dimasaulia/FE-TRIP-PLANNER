const api = "/api/v1";

export const endpoints = {
  auth: {
    session: "/auth/session",
    login: "/auth/login",
    logout: `${api}/auth/logout`,
    googleLogin: `${api}/auth/google/login`,
    devLogin: `${api}/auth/dev-login`,
    me: `${api}/me`,
  },
  authorization: {
    snapshot: "/authorization/access-snapshot",
    menus: "/authorization/menus",
  },
  user: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
  },
  trips: {
    list: `${api}/trips`,
    detail: (tripId: string) => `${api}/trips/${tripId}`,
    members: (tripId: string) => `${api}/trips/${tripId}/members`,
    member: (tripId: string, userId: string) => `${api}/trips/${tripId}/members/${userId}`,
    uploads: (tripId: string) => `${api}/trips/${tripId}/uploads`,
    ws: (tripId: string) => `${api}/trips/${tripId}/ws`,
  },
  invites: {
    list: (tripId: string) => `${api}/trips/${tripId}/invites`,
    revoke: (tripId: string, inviteId: string) => `${api}/trips/${tripId}/invites/${inviteId}`,
    preview: (token: string) => `${api}/invites/${token}`,
    accept: (token: string) => `${api}/invites/${token}/accept`,
  },
  library: {
    list: (tripId: string) => `${api}/trips/${tripId}/library`,
    detail: (itemId: string) => `${api}/library/${itemId}`,
  },
  schedule: {
    list: (tripId: string) => `${api}/trips/${tripId}/schedule`,
    create: (tripId: string) => `${api}/trips/${tripId}/schedule/blocks`,
    block: (blockId: string) => `${api}/schedule/blocks/${blockId}`,
  },
  calendar: {
    connect: `${api}/calendar/connect`,
    connection: `${api}/calendar/connection`,
    sync: (tripId: string) => `${api}/trips/${tripId}/calendar-sync`,
    resync: (tripId: string) => `${api}/trips/${tripId}/calendar-sync/resync`,
  },
} as const;
