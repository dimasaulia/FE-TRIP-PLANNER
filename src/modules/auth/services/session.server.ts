import "server-only";
import { cookies } from "next/headers";
import { endpoints } from "@/config/endpoints.config";
import { envConfig } from "@/config/env.config";
import { parseJson } from "@/modules/http/time-codec";
import type { Me } from "@/types/trip.type";

/**
 * Server-side session check for protected layouts: forwards the session cookie
 * to `GET /me`. Returns null on 401 so the caller can redirect to login.
 */
export async function getServerSession(): Promise<Me | null> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  let response: Response;
  try {
    response = await fetch(`${envConfig.backendUrl}${endpoints.auth.me}`, {
      headers: { Cookie: cookieHeader, Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    // Backend unreachable: let the client render and surface the error itself.
    throw new Error("backend_unreachable");
  }

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`session check failed with ${response.status}`);

  const body = parseJson<{ data: Me }>(await response.text());
  return body.data;
}
