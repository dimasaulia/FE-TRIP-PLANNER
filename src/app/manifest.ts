import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app.config";
import { routes } from "@/config/routes.config";
import { brand } from "@/styles/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appConfig.name,
    short_name: appConfig.name,
    description: appConfig.description,
    start_url: routes.trips,
    display: "standalone",
    background_color: brand.page,
    theme_color: brand.accent,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
