"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/config/routes.config";
import { tokenFromInviteLink } from "@/features/invites/services/invite.service";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { ThemeToggle } from "@/layouts/components/ThemeToggle";
import { UserMenu } from "@/layouts/components/UserMenu";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { TextInput } from "@/shared/components/Field";
import { Spinner } from "@/shared/components/Spinner";
import { formatDateRange } from "@/shared/time";
import { CreateTripDialog } from "./components/CreateTripDialog";

export function TripListV1() {
  const { t, locale } = usePreferences();
  const router = useRouter();
  const params = useSearchParams();
  const { data: trips, isPending } = useTrips();
  const [creating, setCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const showAll = params.get("all") === "1";

  // With exactly one trip, go straight into it (unless the list was asked for).
  useEffect(() => {
    if (!showAll && trips?.length === 1) router.replace(routes.trip(trips[0].id));
  }, [router, showAll, trips]);

  const joinToken = tokenFromInviteLink(inviteLink);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">{t("app.name")}</p>
          <h1 className="text-3xl font-bold tracking-tight">{t("trips.heading")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setCreating(true)}>+ {t("trips.create")}</Button>
          <span className="hidden sm:inline-flex">
            <ThemeToggle />
          </span>
          <UserMenu />
        </div>
      </header>

      {isPending ? (
        <div className="flex justify-center py-20">
          <Spinner size={24} />
        </div>
      ) : trips && trips.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                className="group block overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-lg"
                href={routes.trip(trip.id)}
              >
                <div className="h-28 bg-sunken">
                  {trip.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="size-full object-cover" loading="lazy" src={trip.banner_url} />
                  ) : null}
                </div>
                <div className="p-4">
                  <h2 className="truncate text-lg font-semibold">{trip.name}</h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                    {formatDateRange(trip.start_date, trip.end_date, locale)}
                  </p>
                  <p className="mt-3 text-xs text-ink-muted">
                    {t(`role.${trip.my_role}`)} · {t("trips.members", { count: trip.member_count })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto max-w-md rounded-panel border border-dashed border-line-strong p-8 text-center">
          <h2 className="text-xl font-bold">{t("trips.emptyTitle")}</h2>
          <p className="mt-2 text-sm text-ink-muted">{t("trips.emptyHint")}</p>
          <Button className="mt-5" onClick={() => setCreating(true)}>
            {t("trips.create")}
          </Button>
          <form
            className="mt-6 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (joinToken) router.push(routes.join(joinToken));
            }}
          >
            <TextInput onChange={(event) => setInviteLink(event.target.value)} placeholder={t("trips.pasteInvite")} value={inviteLink} />
            <Button disabled={!joinToken} type="submit" variant="secondary">
              {t("join.accept")}
            </Button>
          </form>
        </div>
      )}

      <CreateTripDialog onOpenChange={setCreating} open={creating} />
    </div>
  );
}
