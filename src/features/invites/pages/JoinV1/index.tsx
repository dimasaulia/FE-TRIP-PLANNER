"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/config/query-keys.config";
import { loginWithNext, routes } from "@/config/routes.config";
import { inviteService } from "@/features/invites/services/invite.service";
import { sessionService } from "@/modules/auth/services/session.service";
import { isApiError } from "@/modules/http/api-error";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Spinner } from "@/shared/components/Spinner";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="w-full rounded-panel border border-line bg-surface p-7 shadow-sm">{children}</div>;
}

export function JoinV1({ token }: { token: string }) {
  const { t } = usePreferences();
  const router = useRouter();
  const preview = useQuery({
    queryKey: queryKeys.invitePreview(token),
    queryFn: () => inviteService.preview(token),
    meta: { allowAnonymous: true },
    retry: false,
  });
  const session = useQuery({
    queryKey: queryKeys.me,
    queryFn: sessionService.me,
    meta: { allowAnonymous: true },
    retry: false,
  });
  const accept = useMutation({
    mutationFn: () => inviteService.accept(token),
    onSuccess: (result) => router.push(routes.trip(result.trip_id)),
  });

  if (preview.isPending || session.isPending) {
    return (
      <Card>
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (preview.isError) {
    const code = isApiError(preview.error) ? preview.error.code : "unknown";
    const key = code === "invite_expired" || code === "invite_exhausted" ? code : "invite_not_found";
    return (
      <Card>
        <p className="font-mono text-xs uppercase tracking-wider text-danger">{t("join.invalid")}</p>
        <h2 className="mt-2 text-2xl font-bold">{t(`errors.${key}`)}</h2>
        <p className="mt-2 text-sm text-ink-muted">{t("join.askNew")}</p>
        <Button className="mt-6" href={routes.trips} variant="secondary">
          {t("join.toTrips")}
        </Button>
      </Card>
    );
  }

  const invite = preview.data;
  const signedIn = Boolean(session.data);
  const next = routes.join(token);

  return (
    <Card>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">{t("join.eyebrow")}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight">{invite.trip_name}</h2>
      <p className="mt-2 text-sm text-ink-muted">{t("join.role", { role: t(`role.${invite.role}`) })}</p>
      <div className="mt-6">
        {signedIn ? (
          <Button className="w-full" disabled={accept.isPending} onClick={() => accept.mutate()}>
            {accept.isPending ? <Spinner /> : null}
            {t("join.accept")}
          </Button>
        ) : (
          <Button className="w-full" href={loginWithNext(next)}>
            {t("login.google")}
          </Button>
        )}
      </div>
    </Card>
  );
}
