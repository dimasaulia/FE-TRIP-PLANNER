"use client";

import { routes } from "@/config/routes.config";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";

export function NotFoundV1() {
  const { t } = usePreferences();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">404</p>
      <h1 className="text-2xl font-bold">{t("errors.not_found")}</h1>
      <Button href={routes.allTrips} variant="secondary">
        {t("trips.all")}
      </Button>
    </div>
  );
}
