import { NextResponse, type NextRequest } from "next/server";
import { appConfig } from "@/config/app.config";
import { routes } from "@/config/routes.config";

// Lightweight guard: without a session cookie a protected page redirects to
// login straight away. The protected layout still validates the session and
// reads `x-next-path` to come back here after login.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname + request.nextUrl.search;
  const hasSession = appConfig.sessionCookieNames.some((name) => request.cookies.has(name));

  if (!hasSession) {
    const login = new URL(routes.login, request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  const headers = new Headers(request.headers);
  headers.set("x-next-path", path);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/trips/:path*"],
};
