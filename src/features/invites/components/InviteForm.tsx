"use client";

import { useState } from "react";
import { useCreateInvite } from "@/features/invites/hooks/useInvites";
import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Field, Select, TextInput } from "@/shared/components/Field";
import { toast } from "@/shared/components/Toast";
import type { CreatedInvite, InviteRole } from "@/types/invite.type";

/** Role, expiry (7 days by default) and optional use limit; the link shows once. */
export function InviteForm({ tripId }: { tripId: string }) {
  const { t } = usePreferences();
  const create = useCreateInvite(tripId);
  const [role, setRole] = useState<InviteRole>("editor");
  const [days, setDays] = useState(7);
  const [maxUses, setMaxUses] = useState("");
  const [created, setCreated] = useState<CreatedInvite | null>(null);

  if (created) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-muted">{t("invite.linkOnce")}</p>
        <div className="flex gap-2">
          <TextInput onFocus={(event) => event.currentTarget.select()} readOnly value={created.url} />
          <Button
            onClick={() => {
              void navigator.clipboard?.writeText(created.url);
              toast({ message: t("invite.copied"), tone: "success" });
            }}
          >
            {t("common.copy")}
          </Button>
        </div>
        <Button onClick={() => setCreated(null)} size="sm" variant="ghost">
          {t("invite.another")}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate(
          { role, expires_in_days: days, max_uses: maxUses ? Number(maxUses) : null },
          { onSuccess: setCreated },
        );
      }}
    >
      <Field label={t("invite.role")}>
        <Select onChange={(event) => setRole(event.target.value as InviteRole)} value={role}>
          <option value="editor">{t("role.editor")}</option>
          <option value="viewer">{t("role.viewer")}</option>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("invite.expiresDays")}>
          <TextInput max={30} min={1} onChange={(event) => setDays(Number(event.target.value) || 7)} type="number" value={days} />
        </Field>
        <Field label={t("invite.maxUses")}>
          <TextInput min={1} onChange={(event) => setMaxUses(event.target.value)} placeholder="∞" type="number" value={maxUses} />
        </Field>
      </div>
      <Button className="w-full" disabled={create.isPending} type="submit">
        {t("invite.create")}
      </Button>
    </form>
  );
}
