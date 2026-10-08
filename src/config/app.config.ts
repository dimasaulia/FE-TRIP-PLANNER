export const appConfig = {
  name: "Trip Planner",
  description: "Susun jadwal liburan bersama, dari library destinasi sampai timeline harian.",
  activeAuthPage: "LoginV1",
  activeDashboardPage: "DashboardHomeV1",
  sessionCookieNames: ["session", "__Host-session"],
  lastTripStorageKey: "tp:last-trip",
} as const;
