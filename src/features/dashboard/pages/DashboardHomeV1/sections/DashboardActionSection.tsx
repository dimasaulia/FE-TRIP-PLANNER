"use client";

import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";

export function DashboardActionSection() {
  const { t } = usePreferences();

  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <p className="text-sm font-semibold text-warning">
        {t("dashboard.action.eyebrow")}
      </p>
      <h3 className="mt-2 text-xl font-semibold">
        {t("dashboard.action.title")}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        {t("dashboard.action.description")}
      </p>
      <div className="mt-4">
        <Button href="/users">{t("dashboard.action.button")}</Button>
      </div>
    </section>
  );
}
