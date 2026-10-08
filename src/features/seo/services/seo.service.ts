import "server-only";
import { endpoints } from "@/config/endpoints.config";
import { envConfig } from "@/config/env.config";
import type { InviteRole } from "@/types/invite.type";

type InviteMeta = { tripName: string; role: InviteRole };

/**
 * Public invite preview for link unfurls (crawlers carry no session). Returns
 * null for invalid tokens or when the backend is unreachable, never throws.
 */
export async function getInviteMeta(token: string): Promise<InviteMeta | null> {
  try {
    const response = await fetch(`${envConfig.backendUrl}${endpoints.invites.preview(encodeURIComponent(token))}`, {
      headers: { Accept: "application/json", "Accept-Language": "id" },
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: { trip_name: string; role: InviteRole } };
    return body.data ? { tripName: body.data.trip_name, role: body.data.role } : null;
  } catch {
    return null;
  }
}
