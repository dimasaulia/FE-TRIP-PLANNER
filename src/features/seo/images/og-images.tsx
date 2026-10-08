import { ImageResponse } from "next/og";
import { translate } from "@/modules/preferences/translate";
import { brandHues } from "@/styles/brand";
import { getInviteMeta } from "../services/seo.service";
import { BrandImage, BrandMark, OG_SIZE } from "./BrandImage";

const t = (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) => translate("id", key, vars);

const sampleNotes = () => [
  { hue: brandHues.coral, tag: t("auth.sample.one.tag"), title: t("auth.sample.one.title"), rotate: -2.5, offset: 0 },
  { hue: brandHues.leaf, tag: t("auth.sample.two.tag"), title: t("auth.sample.two.title"), rotate: 1.8, offset: 36 },
  { hue: brandHues.sea, tag: t("auth.sample.three.tag"), title: t("auth.sample.three.title"), rotate: -1.2, offset: 10 },
];

export function siteOgImage() {
  return new ImageResponse(
    <BrandImage eyebrow={t("meta.eyebrow")} notes={sampleNotes()} subtitle={t("meta.description")} title={t("auth.headline")} />,
    OG_SIZE,
  );
}

export async function inviteOgImage(token: string) {
  const invite = await getInviteMeta(token);
  return new ImageResponse(
    invite ? (
      <BrandImage
        eyebrow={t("join.eyebrow")}
        notes={sampleNotes()}
        subtitle={t("meta.join.description", { role: t(`role.${invite.role}`) })}
        title={invite.tripName}
      />
    ) : (
      <BrandImage eyebrow={t("join.invalid")} notes={sampleNotes()} subtitle={t("join.askNew")} title={t("meta.join.invalidTitle")} />
    ),
    OG_SIZE,
  );
}

export function appleIconImage() {
  // iOS adds its own rounded mask, so the mark fills the square.
  return new ImageResponse(<BrandMark size={180} />, { width: 180, height: 180 });
}
