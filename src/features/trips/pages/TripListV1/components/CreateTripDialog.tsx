"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { queryKeys } from "@/config/query-keys.config";
import { routes } from "@/config/routes.config";
import { TripForm } from "@/features/trips/components/TripForm";
import { tripService } from "@/features/trips/services/trip.service";
import { BannerDrop } from "@/features/uploads/components/BannerDrop";
import { uploadService, validateImage } from "@/features/uploads/services/upload.service";
import { errorMessageKey } from "@/modules/http/error-message";
import { usePreferences } from "@/modules/preferences";
import { Dialog } from "@/shared/components/Dialog";
import { Field } from "@/shared/components/Field";
import { toast } from "@/shared/components/Toast";
import { browserTimeZone } from "@/shared/time";
import type { TripFormValues } from "@/features/trips/schemas/trip-form.schema";

export function CreateTripDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = usePreferences();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [banner, setBanner] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // The trip does not exist yet, so the banner waits locally:
  // POST /trips → upload to the new trip → PATCH banner_url.
  async function submit(values: TripFormValues) {
    setBusy(true);
    try {
      const trip = await tripService.create({ ...values, description: values.description ?? "" });
      if (banner) {
        try {
          const uploaded = await uploadService.upload(trip.id, banner);
          await tripService.update(trip.id, { banner_url: uploaded.url });
        } catch {
          toast({ message: t("trips.bannerFailed"), tone: "error" });
        }
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
      onOpenChange(false);
      router.push(routes.trip(trip.id));
    } catch (error) {
      toast({ message: t(errorMessageKey(error)), tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} title={t("trips.create")} width={520}>
      <TripForm
        busy={busy}
        defaultValues={{ name: "", description: "", start_date: "", end_date: "", timezone: browserTimeZone() }}
        onSubmit={(values) => void submit(values)}
        submitLabel={t("trips.create")}
      >
        <Field label={t("trips.banner")}>
          <BannerDrop
            file={banner}
            height={120}
            onFile={(file) => {
              const rejection = validateImage(file);
              if (rejection) toast({ message: t(`errors.${rejection}`), tone: "error" });
              else setBanner(file);
            }}
            onRemove={() => setBanner(null)}
            url={null}
          />
        </Field>
      </TripForm>
    </Dialog>
  );
}
