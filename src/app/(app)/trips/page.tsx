import { Suspense } from "react";
import { pageMetadata } from "@/features/seo/metadata";
import { TripListV1 } from "@/features/trips/pages/TripListV1";

export const metadata = pageMetadata("meta.trips.title", { index: false });

export default function TripsPage() {
  return (
    <Suspense>
      <TripListV1 />
    </Suspense>
  );
}
