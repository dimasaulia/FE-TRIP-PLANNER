"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { routes } from "@/config/routes.config";
import { CalendarSyncPanel } from "@/features/calendar/components/CalendarSyncPanel";
import { InviteForm } from "@/features/invites/components/InviteForm";
import { InviteList } from "@/features/invites/components/InviteList";
import { useTripWorkspace } from "@/features/trips/context/TripWorkspaceContext";
import { useDeleteTrip } from "@/features/trips/hooks/useTrips";
import { TripCan } from "@/modules/auth/components/TripCan";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Dialog } from "@/shared/components/Dialog";
import { MembersSection } from "./sections/MembersSection";
import { TripDetailsSection } from "./sections/TripDetailsSection";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-section border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function TripSettingsV1() {
  const { t } = usePreferences();
  const router = useRouter();
  const params = useSearchParams();
  const { trip, me } = useTripWorkspace();
  const remove = useDeleteTrip(trip.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [justConnected, setJustConnected] = useState(params.get("calendar") === "connected");
  const consumeConnect = useCallback(() => {
    setJustConnected(false);
    router.replace(routes.tripSettings(trip.id), { scroll: false });
  }, [router, trip.id]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
        <Button href={routes.trip(trip.id)} size="sm" variant="ghost">
          ← {t("settings.back")}
        </Button>
        <Section title={t("settings.details")}>
          <TripDetailsSection trip={trip} />
        </Section>
        <Section title={t("settings.members")}>
          <MembersSection myUserId={me.id} trip={trip} />
        </Section>
        <TripCan permission="invites.create">
          <Section description={t("invite.description")} title={t("settings.invites")}>
            <div className="grid gap-6 md:grid-cols-2">
              <InviteForm tripId={trip.id} />
              <InviteList myUserId={me.id} tripId={trip.id} />
            </div>
          </Section>
        </TripCan>
        <Section title={t("calendar.title")}>
          <CalendarSyncPanel justConnected={justConnected} onConsumedConnect={consumeConnect} trip={trip} />
        </Section>
        <TripCan permission="trip.delete">
          <Section description={t("settings.dangerHint")} title={t("settings.danger")}>
            <Button onClick={() => setConfirmDelete(true)} variant="danger">
              {t("settings.deleteTrip")}
            </Button>
          </Section>
        </TripCan>
      </div>
      <Dialog
        description={t("settings.deleteConfirm", { name: trip.name })}
        onOpenChange={setConfirmDelete}
        open={confirmDelete}
        title={t("settings.deleteTrip")}
      >
        <div className="flex justify-end gap-2">
          <Button onClick={() => setConfirmDelete(false)} variant="secondary">
            {t("common.cancel")}
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => remove.mutate(undefined, { onSuccess: () => router.replace(routes.allTrips) })}
            variant="danger"
          >
            {t("settings.deleteTrip")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
