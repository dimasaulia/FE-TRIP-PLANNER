import { Suspense } from "react";
import { TripWorkspaceV1 } from "@/features/trips/pages/TripWorkspaceV1";

export default function TripWorkspacePage() {
  return (
    <Suspense>
      <TripWorkspaceV1 />
    </Suspense>
  );
}
