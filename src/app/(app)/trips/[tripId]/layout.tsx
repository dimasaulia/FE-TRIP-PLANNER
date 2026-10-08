import { TripLayout } from "@/layouts/TripLayout";

export default async function TripRouteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}>) {
  const { tripId } = await params;
  return <TripLayout tripId={tripId}>{children}</TripLayout>;
}
