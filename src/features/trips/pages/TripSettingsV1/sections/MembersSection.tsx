"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/config/routes.config";
import { useMemberMutations } from "@/features/trips/hooks/useTrips";
import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import { usePreferences } from "@/modules/preferences";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { Select } from "@/shared/components/Field";
import type { Role, TripDetail } from "@/types/trip.type";

export function MembersSection({ trip, myUserId }: { trip: TripDetail; myUserId: string }) {
  const { t } = usePreferences();
  const router = useRouter();
  const canManage = useTripPermission("members.manage");
  const { updateRole, remove } = useMemberMutations(trip.id);

  return (
    <ul className="divide-y divide-line">
      {trip.members.map((member) => {
        const self = member.user_id === myUserId;
        return (
          <li className="flex items-center gap-3 py-3" key={member.user_id}>
            <Avatar avatarUrl={member.avatar_url} id={member.user_id} name={member.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {member.name} {self ? <span className="text-ink-muted">({t("settings.you")})</span> : null}
              </p>
              <p className="truncate text-xs text-ink-muted">{member.email}</p>
            </div>
            {canManage && !self ? (
              <>
                <Select
                  aria-label={t("invite.role")}
                  className="h-8 w-32"
                  onChange={(event) => updateRole.mutate({ userId: member.user_id, role: event.target.value as Role })}
                  value={member.role}
                >
                  {(["owner", "editor", "viewer"] as const).map((role) => (
                    <option key={role} value={role}>
                      {t(`role.${role}`)}
                    </option>
                  ))}
                </Select>
                <Button onClick={() => remove.mutate(member.user_id)} size="sm" variant="danger">
                  {t("settings.removeMember")}
                </Button>
              </>
            ) : (
              <span className="text-xs font-semibold text-ink-muted">{t(`role.${member.role}`)}</span>
            )}
            {self ? (
              <Button
                onClick={() => remove.mutate(member.user_id, { onSuccess: () => router.replace(routes.allTrips) })}
                size="sm"
                variant="ghost"
              >
                {t("settings.leave")}
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
