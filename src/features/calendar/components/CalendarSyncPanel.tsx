"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { queryKeys } from "@/config/query-keys.config";
import { routes } from "@/config/routes.config";
import { calendarService } from "@/features/calendar/services/calendar.service";
import { useSession } from "@/modules/auth/hooks/useSession";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import type { TripDetail } from "@/types/trip.type";

type CalendarSyncPanelProps = {
  trip: TripDetail;
  /** True right after returning from Google's consent screen. */
  justConnected: boolean;
  onConsumedConnect: () => void;
};

/** One-way sync from the app to Google Calendar. */
export function CalendarSyncPanel({ trip, justConnected, onConsumedConnect }: CalendarSyncPanelProps) {
  const { t, locale } = usePreferences();
  const queryClient = useQueryClient();
  const { data: me } = useSession();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.trip(trip.id) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };
  const enable = useMutation({ mutationFn: () => calendarService.enable(trip.id), onSuccess: refresh });
  const disable = useMutation({ mutationFn: () => calendarService.disable(trip.id), onSuccess: refresh });
  const resync = useMutation({ mutationFn: () => calendarService.resync(trip.id), onSuccess: refresh });
  const autoEnabled = useRef(false);

  const connection = me?.calendar;
  const sync = trip.calendar_sync;

  // Back from the OAuth round trip: switch the sync on automatically.
  useEffect(() => {
    if (!justConnected || autoEnabled.current || !connection?.connected) return;
    autoEnabled.current = true;
    onConsumedConnect();
    if (!sync.enabled) enable.mutate();
  }, [connection?.connected, enable, justConnected, onConsumedConnect, sync.enabled]);

  const connectHref = calendarService.connectUrl(`${routes.tripSettings(trip.id)}?calendar=connected`);

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">{t("calendar.oneWay")}</p>

      {connection?.status === "revoked" ? (
        <div className="rounded-card border border-line-strong bg-sunken p-3 text-sm" role="alert">
          <p className="font-semibold">{t("calendar.revoked")}</p>
          <Button className="mt-2" onClick={() => window.location.assign(connectHref)} size="sm">
            {t("calendar.reconnect")}
          </Button>
        </div>
      ) : null}

      {!connection?.connected && connection?.status !== "revoked" ? (
        <Button onClick={() => window.location.assign(connectHref)}>{t("calendar.connect")}</Button>
      ) : null}

      {connection?.connected ? (
        <div className="space-y-3">
          <p className="text-sm">
            {t("calendar.connectedAs", { email: connection.google_email ?? "" })}
          </p>
          {sync.enabled ? (
            <>
              <dl className="grid grid-cols-[140px_1fr] gap-y-1 text-sm">
                <dt className="text-ink-muted">{t("calendar.lastSynced")}</dt>
                <dd>
                  {sync.last_synced_at
                    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(sync.last_synced_at)
                    : "—"}
                </dd>
                <dt className="text-ink-muted">{t("calendar.pending")}</dt>
                <dd>{sync.pending_jobs}</dd>
                {sync.last_error ? (
                  <>
                    <dt className="text-danger">{t("calendar.lastError")}</dt>
                    <dd className="text-danger">{sync.last_error}</dd>
                  </>
                ) : null}
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button disabled={resync.isPending} onClick={() => resync.mutate()} size="sm" variant="secondary">
                  {t("calendar.resync")}
                </Button>
                <Button disabled={disable.isPending} onClick={() => disable.mutate()} size="sm" variant="danger">
                  {t("calendar.disable")}
                </Button>
              </div>
            </>
          ) : (
            <Button disabled={enable.isPending} onClick={() => enable.mutate()}>
              {t("calendar.enable")}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
