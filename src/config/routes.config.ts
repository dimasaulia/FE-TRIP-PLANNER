export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  users: "/users",
  settings: "/settings",
  trips: "/trips",
  allTrips: "/trips?all=1",
  trip: (tripId: string) => `/trips/${tripId}`,
  tripSettings: (tripId: string) => `/trips/${tripId}/settings`,
  join: (token: string) => `/join/${token}`,
  devTokens: "/dev/tokens",
} as const;

/** Paths that need a session; checked by `src/proxy.ts`. */
export const protectedPrefixes = [routes.trips];

export function loginWithNext(next: string) {
  return `${routes.login}?next=${encodeURIComponent(next)}`;
}
