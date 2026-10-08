import { endpoints } from "@/config/endpoints.config";
import { apiClient } from "@/modules/http/api-client";
import type { Me, User } from "@/types/trip.type";

export const sessionService = {
  me: () => apiClient<Me>(endpoints.auth.me),
  logout: () => apiClient<null>(endpoints.auth.logout, { method: "POST" }),
  devLogin: (email: string, name: string) =>
    apiClient<{ user: User }>(endpoints.auth.devLogin, { method: "POST", body: { email, name } }),
  /** Full navigation: the backend redirects to Google and back to `next`. */
  googleLoginUrl: (next: string) => `${endpoints.auth.googleLogin}?next=${encodeURIComponent(next)}`,
  disconnectCalendar: () => apiClient<null>(endpoints.calendar.connection, { method: "DELETE" }),
};
