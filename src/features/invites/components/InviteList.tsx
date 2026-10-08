"use client";

import { useInvites, useRevokeInvite } from "@/features/invites/hooks/useInvites";
import { useTripRole } from "@/modules/auth/TripRoleProvider";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Spinner } from "@/shared/components/Spinner";

export function InviteList({ tripId, myUserId }: { tripId: string; myUserId: string }) {
  const { t, locale } = usePreferences();
  const role = useTripRole();
  const { data: invites = [], isPending } = useInvites(tripId);
  const revoke = useRevokeInvite(tripId);

  if (isPending) return <Spinner />;
  if (!invites.length) return <p className="text-sm text-ink-muted">{t("invite.none")}</p>;

  return (
    <ul className="divide-y divide-line">
      {invites.map((invite) => (
        <li className="flex items-center justify-between gap-3 py-2.5 text-sm" key={invite.id}>
          <div>
            <p className="font-medium">
              {t(`role.${invite.role}`)} · {invite.use_count}/{invite.max_uses ?? "∞"}
            </p>
            <p className="text-xs text-ink-muted">
              {t("invite.meta", {
                name: invite.created_by_name,
                date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(invite.expires_at),
              })}
            </p>
          </div>
          {/* Editors may only revoke their own invites. */}
          {role === "owner" || invite.created_by === myUserId ? (
            <Button disabled={revoke.isPending} onClick={() => revoke.mutate(invite.id)} size="sm" variant="danger">
              {t("invite.revoke")}
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
