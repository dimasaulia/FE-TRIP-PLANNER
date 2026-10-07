export const envConfig = {
  apiGatewayUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "",
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL ?? "",
  authorizationUrl: process.env.NEXT_PUBLIC_AUTHORIZATION_URL ?? "",
  fileUrl: process.env.NEXT_PUBLIC_FILE_URL ?? "",
  notificationUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL ?? "",
} as const;
