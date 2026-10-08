"use client";

import Link from "next/link";
import { ConnectionIndicator, PresenceAvatars } from "@/features/presence/components/PresenceAvatars";
import { InvitePopover } from "@/features/invites/components/InvitePopover";
import { InlineText } from "@/features/library/components/InlineText";
import { useUpdateTrip } from "@/features/trips/hooks/useTrips";
import { routes } from "@/config/routes.config";
import { TripCan } from "@/modules/auth/components/TripCan";
import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import { usePreferences } from "@/modules/preferences";
import { formatDateRange } from "@/shared/time";
import type { TripDetail } from "@/types/trip.type";
import { TripMobileMenu } from "./TripMobileMenu";

type TripHeaderProps = {
  trip: TripDetail;
  /** Desktop: theme switch + avatar menu. */
  userMenu: React.ReactNode;
  /** Phone: profile panel shown inside the menu sheet. */
  account: React.ReactNode;
};

export function TripHeader({ trip, userMenu, account }: TripHeaderProps) {
  const { t, locale } = usePreferences();
  const canEdit = useTripPermission("trip.edit");
  const update = useUpdateTrip(trip.id);

  return (
    <header className="flex items-center gap-x-3 border-b border-line bg-paper px-3 py-2.5 sm:gap-x-4 sm:px-6 sm:py-3">
      <Link
        aria-label={t("trips.all")}
        className="inline-flex size-8 items-center justify-center rounded-pill text-ink-muted hover:bg-sunken hover:text-ink"
        href={routes.allTrips}
      >
        ←
      </Link>
      <div className="min-w-0 flex-1">
        <InlineText
          ariaLabel={t("trips.name")}
          className="max-w-md truncate py-0.5 text-lg font-bold tracking-tight sm:text-xl"
          editable={canEdit}
          maxLength={120}
          onCommit={(name) => {
            if (name.trim()) update.mutate({ name: name.trim() });
          }}
          placeholder={t("trips.namePlaceholder")}
          value={trip.name}
        />
        <p className="truncate px-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          {formatDateRange(trip.start_date, trip.end_date, locale)}
          <span className="hidden md:inline"> · {t(`role.${trip.my_role}`)}</span>
        </p>
      </div>
      <div className="md:hidden">
        <TripMobileMenu account={account} trip={trip} />
      </div>
      <div className="hidden items-center gap-3 md:flex">
        <ConnectionIndicator />
        <PresenceAvatars members={trip.members} />
        <TripCan permission="invites.create">
          <InvitePopover tripId={trip.id} />
        </TripCan>
        <Link
          className="inline-flex h-8 items-center rounded-pill px-3 text-xs font-semibold text-ink-muted hover:bg-sunken hover:text-ink"
          href={routes.tripSettings(trip.id)}
        >
          {t("trips.settings")}
        </Link>
        {userMenu}
      </div>
    </header>
  );
}
