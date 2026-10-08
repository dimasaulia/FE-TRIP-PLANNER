import type { Metadata, Viewport } from "next";
import { appConfig } from "@/config/app.config";
import { envConfig } from "@/config/env.config";
import { routes } from "@/config/routes.config";
import { translate } from "@/modules/preferences/translate";
import { brand } from "@/styles/brand";
import { getInviteMeta } from "./services/seo.service";

const t = (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) => translate("id", key, vars);

/** Shared defaults: every page unfurls with the brand card unless it overrides. */
export function rootMetadata(): Metadata {
  const description = t("meta.description");
  return {
    metadataBase: new URL(envConfig.siteUrl),
    applicationName: appConfig.name,
    title: { default: `${appConfig.name} · ${t("meta.tagline")}`, template: `%s · ${appConfig.name}` },
    description,
    keywords: ["trip planner", "itinerary", "jadwal liburan", "rencana perjalanan", "timeline"],
    openGraph: {
      type: "website",
      siteName: appConfig.name,
      locale: "id_ID",
      alternateLocale: ["en_GB"],
      title: `${appConfig.name} · ${t("meta.tagline")}`,
      description,
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: `${appConfig.name} · ${t("meta.tagline")}`,
      description,
    },
    appleWebApp: { title: appConfig.name, statusBarStyle: "default" },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const rootViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brand.page },
    { media: "(prefers-color-scheme: dark)", color: brand.pageDark },
  ],
  colorScheme: "light dark",
};

/** Invite links are the URLs people paste in chats: show the trip they lead to. */
export async function joinMetadata(token: string): Promise<Metadata> {
  const invite = await getInviteMeta(token);
  const url = routes.join(token);
  if (!invite) {
    return {
      title: t("meta.join.invalidTitle"),
      description: t("join.askNew"),
      robots: { index: false, follow: false },
      openGraph: { title: t("meta.join.invalidTitle"), description: t("join.askNew"), url },
    };
  }
  const title = t("meta.join.title", { trip: invite.tripName });
  const description = t("meta.join.description", { role: t(`role.${invite.role}`) });
  return {
    title,
    description,
    // Invite tokens are secrets: unfurl them, never index them.
    robots: { index: false, follow: false },
    openGraph: { title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function pageMetadata(titleKey: Parameters<typeof translate>[1], options: { index?: boolean } = {}): Metadata {
  return { title: t(titleKey), robots: options.index === false ? { index: false, follow: false } : undefined };
}
