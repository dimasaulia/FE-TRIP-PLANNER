"use client";

import Link from "next/link";
import { Dialog as RadixDialog } from "radix-ui";
import { useState } from "react";
import { routes } from "@/config/routes.config";
import { InviteForm } from "@/features/invites/components/InviteForm";
import { ConnectionIndicator, PresenceAvatars } from "@/features/presence/components/PresenceAvatars";
import { TripCan } from "@/modules/auth/components/TripCan";
import { usePreferences } from "@/modules/preferences";
import { IconButton } from "@/shared/components/IconButton";
import { formatDateRange } from "@/shared/time";
import type { TripDetail } from "@/types/trip.type";

type TripMobileMenuProps = { trip: TripDetail; account: React.ReactNode };

/** Phone header keeps only title and dates; everything else lives in this sheet. */
export function TripMobileMenu({ trip, account }: TripMobileMenuProps) {
  const { t, locale } = usePreferences();
  const [open, setOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const itemClass = "flex w-full items-center justify-between rounded-input px-3 py-2.5 text-sm font-semibold hover:bg-sunken";

  return (
    <RadixDialog.Root
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setInviting(false);
      }}
      open={open}
    >
      <RadixDialog.Trigger asChild>
        <IconButton className="border border-line" label={t("trips.menu")}>
          <svg aria-hidden fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </IconButton>
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]" />
        <RadixDialog.Content className="fixed inset-x-0 top-0 z-50 max-h-[90dvh] overflow-y-auto rounded-b-panel bg-surface px-4 pb-5 pt-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <RadixDialog.Title className="truncate text-lg font-bold">{trip.name}</RadixDialog.Title>
              <RadixDialog.Description className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                {formatDateRange(trip.start_date, trip.end_date, locale)} · {t(`role.${trip.my_role}`)}
              </RadixDialog.Description>
            </div>
            <RadixDialog.Close asChild>
              <IconButton label={t("common.close")}>✕</IconButton>
            </RadixDialog.Close>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-card bg-sunken px-3 py-2">
            <PresenceAvatars members={trip.members} />
            <ConnectionIndicator />
          </div>

          <nav className="mt-3 space-y-1">
            <Link className={itemClass} href={routes.allTrips} onClick={() => setOpen(false)}>
              {t("trips.all")} <span aria-hidden>›</span>
            </Link>
            <Link className={itemClass} href={routes.tripSettings(trip.id)} onClick={() => setOpen(false)}>
              {t("trips.settings")} <span aria-hidden>›</span>
            </Link>
            <TripCan permission="invites.create">
              <button aria-expanded={inviting} className={itemClass} onClick={() => setInviting((value) => !value)} type="button">
                {t("invite.button")} <span aria-hidden>{inviting ? "−" : "+"}</span>
              </button>
              {inviting ? (
                <div className="rounded-card border border-line p-3">
                  <InviteForm tripId={trip.id} />
                </div>
              ) : null}
            </TripCan>
          </nav>

          <div className="mt-4 border-t border-line pt-4">{account}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
