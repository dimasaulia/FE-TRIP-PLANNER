"use client";

import { TripForm } from "@/features/trips/components/TripForm";
import { useUpdateTrip } from "@/features/trips/hooks/useTrips";
import { BannerDrop } from "@/features/uploads/components/BannerDrop";
import { useImageUpload } from "@/features/uploads/hooks/useImageUpload";
import { useTripPermission } from "@/modules/auth/hooks/useTripPermission";
import { errorMessageKey } from "@/modules/http/error-message";
import { usePreferences } from "@/modules/preferences";
import { Field } from "@/shared/components/Field";
import { toast } from "@/shared/components/Toast";
import type { TripDetail } from "@/types/trip.type";

export function TripDetailsSection({ trip }: { trip: TripDetail }) {
  const { t } = usePreferences();
  const canEdit = useTripPermission("trip.edit");
  const update = useUpdateTrip(trip.id);
  const banner = useImageUpload(trip.id);

  const save = (input: Parameters<typeof update.mutate>[0], success = t("settings.saved")) =>
    update.mutate(input, {
      onSuccess: () => toast({ message: success, tone: "success" }),
      onError: (error) => toast({ message: t(errorMessageKey(error)), tone: "error" }),
    });

  return (
    <TripForm
      busy={update.isPending || banner.uploading}
      defaultValues={{
        name: trip.name,
        description: trip.description,
        start_date: trip.start_date,
        end_date: trip.end_date,
        timezone: trip.timezone,
      }}
      disabled={!canEdit}
      key={trip.updated_at.getTime()}
      onSubmit={(values) => save(values)}
      submitLabel={t("common.save")}
    >
      <Field label={t("trips.banner")}>
        <BannerDrop
          disabled={!canEdit}
          onFile={async (file) => {
            const result = await banner.upload(file);
            if (result) save({ banner_url: result.url });
          }}
          onRemove={() => save({ banner_url: null })}
          progress={banner.progress}
          uploading={banner.uploading}
          url={banner.previewUrl ?? trip.banner_url}
        />
      </Field>
    </TripForm>
  );
}
