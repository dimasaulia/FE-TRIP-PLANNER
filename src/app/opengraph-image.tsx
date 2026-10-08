import { OG_SIZE } from "@/features/seo/images/BrandImage";
import { siteOgImage } from "@/features/seo/images/og-images";

export const alt = "Trip Planner";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return siteOgImage();
}
