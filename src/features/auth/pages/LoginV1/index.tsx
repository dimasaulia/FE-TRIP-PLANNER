"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { envConfig } from "@/config/env.config";
import { routes } from "@/config/routes.config";
import { sessionService } from "@/modules/auth/services/session.service";
import { errorMessageKey } from "@/modules/http/error-message";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Field, TextInput } from "@/shared/components/Field";
import { toast } from "@/shared/components/Toast";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : routes.trips;
}

export function LoginV1() {
  const { t } = usePreferences();
  const params = useSearchParams();
  const router = useRouter();
  const next = safeNext(params.get("next"));
  const failed = params.get("error") ?? params.get("login_error");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="w-full rounded-panel border border-line bg-surface p-7 shadow-sm">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">{t("app.name")}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">{t("login.title")}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{t("login.description")}</p>
      {failed ? (
        <p className="mt-4 rounded-input bg-sunken px-3 py-2 text-sm text-danger" role="alert">
          {t("login.failed")}
        </p>
      ) : null}
      <Button className="mt-6 w-full" onClick={() => window.location.assign(sessionService.googleLoginUrl(next))}>
        <span aria-hidden className="font-bold">G</span>
        {t("login.google")}
      </Button>

      {envConfig.devLoginEnabled ? (
        <form
          className="mt-6 space-y-3 border-t border-dashed border-line-strong pt-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            try {
              await sessionService.devLogin(email, name || email.split("@")[0]);
              router.replace(next);
              router.refresh();
            } catch (error) {
              toast({ message: t(errorMessageKey(error)), tone: "error" });
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{t("login.dev")}</p>
          <Field label={t("login.email")}>
            <TextInput onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </Field>
          <Field label={t("login.name")}>
            <TextInput onChange={(event) => setName(event.target.value)} value={name} />
          </Field>
          <Button className="w-full" disabled={busy} type="submit" variant="secondary">
            {t("login.devSubmit")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
