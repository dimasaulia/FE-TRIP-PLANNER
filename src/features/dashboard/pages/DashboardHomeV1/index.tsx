"use client";

import { Can } from "@/modules/auth/components/Can";
import { usePreferences } from "@/modules/preferences";
import { MetricCard } from "@/shared/components/MetricCard";
import { DashboardActionSection } from "./sections/DashboardActionSection";

export function DashboardHomeV1() {
  const { t } = usePreferences();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-accent">DashboardHomeV1</p>
        <h2 className="mt-2 text-3xl font-semibold">{t("dashboard.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {t("dashboard.description")}
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          description={t("dashboard.metric.routes.description")}
          label={t("dashboard.metric.routes.label")}
          value="3"
        />
        <MetricCard
          description={t("dashboard.metric.features.description")}
          label={t("dashboard.metric.features.label")}
          value="3"
        />
        <MetricCard
          description={t("dashboard.metric.permissions.description")}
          label={t("dashboard.metric.permissions.label")}
          value={t("dashboard.metric.permissions.value")}
        />
      </div>
      <Can permission="user.create">
        <DashboardActionSection />
      </Can>
    </div>
  );
}
