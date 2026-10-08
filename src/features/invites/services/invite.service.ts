import { endpoints } from "@/config/endpoints.config";
import { apiClient } from "@/modules/http/api-client";
import type { CreatedInvite, Invite, InviteAccept, InvitePreview, InviteRole } from "@/types/invite.type";

export type CreateInviteInput = { role: InviteRole; expires_in_days?: number; max_uses?: number | null };

export const inviteService = {
  list: (tripId: string) =>
    apiClient<{ items: Invite[] }>(endpoints.invites.list(tripId)).then((result) => result.items ?? []),
  create: (tripId: string, input: CreateInviteInput) =>
    apiClient<CreatedInvite>(endpoints.invites.list(tripId), { method: "POST", body: input }),
  revoke: (tripId: string, inviteId: string) =>
    apiClient<null>(endpoints.invites.revoke(tripId, inviteId), { method: "DELETE" }),
  preview: (token: string) => apiClient<InvitePreview>(endpoints.invites.preview(token)),
  accept: (token: string) => apiClient<InviteAccept>(endpoints.invites.accept(token), { method: "POST" }),
};

/** Accepts a pasted `/join/<token>` link or a bare token. */
export function tokenFromInviteLink(value: string) {
  const trimmed = value.trim();
  const match = /\/join\/([^/?#\s]+)/.exec(trimmed);
  return match ? match[1] : /^[\w-]{16,}$/.test(trimmed) ? trimmed : null;
}
