"use client";

import { usePreferences } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Popover } from "@/shared/components/Popover";
import { InviteForm } from "./InviteForm";

export function InvitePopover({ tripId }: { tripId: string }) {
  const { t } = usePreferences();
  return (
    <Popover
      align="end"
      trigger={
        <Button size="sm" variant="secondary">
          + {t("invite.button")}
        </Button>
      }
      width={320}
    >
      <p className="mb-3 text-sm font-semibold">{t("invite.title")}</p>
      <InviteForm tripId={tripId} />
    </Popover>
  );
}
