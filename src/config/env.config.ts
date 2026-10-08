export const envConfig = {
  // Browser calls go through the same origin (`/api/*` is rewritten to the
  // backend in development, a reverse proxy in production), so this stays "".
  // Public origin of the frontend; absolute URLs in link previews (Open Graph).
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiGatewayUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "",
  // Server-only: where Next.js itself reaches the backend (rewrites, session guard).
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8081",
  // WebSocket does not pass through Next.js rewrites, so it points at the backend directly.
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "",
  devLoginEnabled: process.env.NEXT_PUBLIC_DEV_LOGIN_ENABLED === "true",
  maxUploadBytes: Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024),
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL ?? "",
  authorizationUrl: process.env.NEXT_PUBLIC_AUTHORIZATION_URL ?? "",
  fileUrl: process.env.NEXT_PUBLIC_FILE_URL ?? "",
  notificationUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL ?? "",
} as const;
