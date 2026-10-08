import { Suspense } from "react";
import { TripSettingsV1 } from "@/features/trips/pages/TripSettingsV1";

export default function TripSettingsPage() {
  return (
    <Suspense>
      <TripSettingsV1 />
    </Suspense>
  );
}
