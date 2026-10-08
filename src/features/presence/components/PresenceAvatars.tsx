"use client";

import { usePresenceStore } from "@/features/presence/stores/presence.store";
import { usePreferences } from "@/modules/preferences";
import { AvatarStack } from "@/shared/components/Avatar";
import { cn } from "@/shared/utils/cn";
import type { TripMember } from "@/types/trip.type";

/** Members of the trip, online ones first and marked with a dot. */
export function PresenceAvatars({ members }: { members: TripMember[] }) {
  const online = usePresenceStore((state) => state.users);
  const onlineIds = new Set(online.map((user) => user.user_id));
  const people = [...members]
    .sort((a, b) => Number(onlineIds.has(b.user_id)) - Number(onlineIds.has(a.user_id)))
    .map((member) => ({
      id: member.user_id,
      name: member.name,
      avatarUrl: member.avatar_url,
      online: onlineIds.has(member.user_id),
    }));
  return <AvatarStack max={5} people={people} size={30} />;
}

export function ConnectionIndicator() {
  const { t } = usePreferences();
  const status = usePresenceStore((state) => state.status);
  const connected = status === "connected";
  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-pill px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
      title={connected ? t("realtime.connected") : t("realtime.reconnecting")}
    >
      <span className={cn("size-2 rounded-pill", connected ? "bg-online" : "animate-pulse bg-danger")} />
      <span className="hidden sm:inline">{connected ? t("realtime.connected") : t("realtime.reconnecting")}</span>
    </span>
  );
}
