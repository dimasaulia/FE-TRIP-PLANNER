"use client";

import { useEffect, useMemo } from "react";
import { appConfig } from "@/config/app.config";
import { routes } from "@/config/routes.config";
import { TripHeader } from "@/features/trips/components/TripHeader";
import { TripWorkspaceProvider } from "@/features/trips/context/TripWorkspaceContext";
import { useTripRealtime } from "@/features/trips/hooks/useTripRealtime";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { ThemeToggle } from "@/layouts/components/ThemeToggle";
import { AccountPanel, UserMenu } from "@/layouts/components/UserMenu";
import { TripRoleProvider } from "@/modules/auth/TripRoleProvider";
import { useCurrentUser } from "@/modules/auth/hooks/useSession";
import { isApiError } from "@/modules/http/api-error";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Spinner } from "@/shared/components/Spinner";

type TripLayoutProps = { tripId: string; children: React.ReactNode };

/** Owns the trip query and the one WebSocket of the trip while it is open. */
export function TripLayout({ tripId, children }: TripLayoutProps) {
  const { t } = usePreferences();
  const me = useCurrentUser();
  const trip = useTrip(tripId);
  const connection = useTripRealtime(tripId, me?.id ?? null);

  useEffect(() => {
    try {
      window.localStorage.setItem(appConfig.lastTripStorageKey, tripId);
    } catch {
      // ignore
    }
  }, [tripId]);

  const send = useMemo(() => (type: string, payload: unknown) => connection.current?.send(type, payload), [connection]);

  if (trip.isPending || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (trip.isError) {
    // Same page for "missing" and "not a member", like the backend.
    const notFound = isApiError(trip.error) && trip.error.status === 404;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">{notFound ? "404" : t("errors.unknown")}</p>
        <h1 className="text-2xl font-bold">{notFound ? t("trips.notFound") : t("errors.unknown")}</h1>
        <Button href={routes.allTrips} variant="secondary">
          {t("trips.all")}
        </Button>
      </div>
    );
  }

  return (
    <TripRoleProvider role={trip.data.my_role}>
      <TripWorkspaceProvider value={{ trip: trip.data, me, send }}>
        <div className="flex h-dvh flex-col">
          <TripHeader
            account={<AccountPanel />}
            trip={trip.data}
            userMenu={
              <>
                <ThemeToggle />
                <UserMenu />
              </>
            }
          />
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </TripWorkspaceProvider>
    </TripRoleProvider>
  );
}
