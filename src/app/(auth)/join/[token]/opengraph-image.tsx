import { OG_SIZE } from "@/features/seo/images/BrandImage";
import { inviteOgImage } from "@/features/seo/images/og-images";

export const alt = "Trip Planner invite";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function JoinOpengraphImage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return inviteOgImage(token);
}
