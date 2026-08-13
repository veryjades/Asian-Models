import heroTaipeiAtelier from "@/assets/mock/golden-set/hero-taipei-atelier.webp";
import heroSeoulTailoring from "@/assets/mock/golden-set/hero-seoul-tailoring.webp";
import heroTokyoEvening from "@/assets/mock/golden-set/hero-tokyo-evening.webp";
import menJunFullBody from "@/assets/mock/golden-set/men-jun-full-body.webp";
import menJunPortrait from "@/assets/mock/golden-set/men-jun-portrait.webp";
import menRenFullBody from "@/assets/mock/golden-set/men-ren-full-body.webp";
import menRenPortrait from "@/assets/mock/golden-set/men-ren-portrait.webp";
import newFaceDaiDigital from "@/assets/mock/golden-set/new-face-dai-digital.webp";
import newFaceNariDigital from "@/assets/mock/golden-set/new-face-nari-digital.webp";
import portfolioBeautyCampaign from "@/assets/mock/golden-set/portfolio-beauty-campaign.webp";
import portfolioMenCommercial from "@/assets/mock/golden-set/portfolio-men-commercial.webp";
import portfolioWomenEditorial from "@/assets/mock/golden-set/portfolio-women-editorial.webp";
import womenAyaFullBody from "@/assets/mock/golden-set/women-aya-full-body.webp";
import womenAyaHover from "@/assets/mock/golden-set/women-aya-hover.webp";
import womenAyaPortrait from "@/assets/mock/golden-set/women-aya-portrait.webp";
import womenMeiFullBody from "@/assets/mock/golden-set/women-mei-full-body.webp";
import womenMeiPortrait from "@/assets/mock/golden-set/women-mei-portrait.webp";
import womenSoraFullBody from "@/assets/mock/golden-set/women-sora-full-body.webp";
import womenSoraPortrait from "@/assets/mock/golden-set/women-sora-portrait.webp";

/**
 * First reviewed fictional asset set. The component-facing shape mirrors the
 * presentation metadata planned for future CMS-managed media.
 */
export const goldenMockAssets = {
  hero: {
    taipeiAtelier: heroTaipeiAtelier,
    seoulTailoring: heroSeoulTailoring,
    tokyoEvening: heroTokyoEvening,
  },
  women: {
    aya: { portrait: womenAyaPortrait, fullBody: womenAyaFullBody, hoverPortrait: womenAyaHover },
    mei: { portrait: womenMeiPortrait, fullBody: womenMeiFullBody },
    sora: { portrait: womenSoraPortrait, fullBody: womenSoraFullBody },
  },
  men: {
    jun: { portrait: menJunPortrait, fullBody: menJunFullBody },
    ren: { portrait: menRenPortrait, fullBody: menRenFullBody },
  },
  newFaces: { nari: newFaceNariDigital, dai: newFaceDaiDigital },
  portfolio: {
    womenEditorial: portfolioWomenEditorial,
    menCommercial: portfolioMenCommercial,
    beautyCampaign: portfolioBeautyCampaign,
  },
  news: {
    springBoardUpdate: portfolioWomenEditorial,
    tokyoShowroom: portfolioMenCommercial,
    scoutingInAsia: portfolioBeautyCampaign,
  },
} as const;

export const goldenMockAssetManifest = [
  { id: "hero-taipei-atelier", usage: "hero", aspectRatio: "16 / 9", objectPosition: "50% 50%" },
  { id: "hero-seoul-tailoring", usage: "hero", aspectRatio: "16 / 9", objectPosition: "50% 50%" },
  { id: "hero-tokyo-evening", usage: "hero", aspectRatio: "16 / 9", objectPosition: "50% 50%" },
  {
    id: "women-aya-portrait",
    usage: "portrait-card",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-aya-hover",
    usage: "portrait-card-hover",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-aya-full-body",
    usage: "full-body-profile",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-mei-portrait",
    usage: "portrait-card",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-mei-full-body",
    usage: "full-body-profile",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-sora-portrait",
    usage: "portrait-card",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-sora-full-body",
    usage: "full-body-profile",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "men-jun-portrait",
    usage: "portrait-card",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "men-jun-full-body",
    usage: "full-body-profile",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "men-ren-portrait",
    usage: "portrait-card",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "men-ren-full-body",
    usage: "full-body-profile",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "new-face-nari-digital",
    usage: "full-body-profile",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "new-face-dai-digital",
    usage: "full-body-profile",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "portfolio-women-editorial",
    usage: "portfolio-gallery",
    aspectRatio: "3 / 2",
    objectPosition: "50% 50%",
  },
  {
    id: "portfolio-men-commercial",
    usage: "portfolio-gallery",
    aspectRatio: "3 / 2",
    objectPosition: "50% 50%",
  },
  {
    id: "portfolio-beauty-campaign",
    usage: "portfolio-gallery",
    aspectRatio: "3 / 2",
    objectPosition: "50% 50%",
  },
] as const;

export const goldenMockAssetProvenance = {
  sourceType: "ai-fictional",
  generatedAt: "2026-08-11",
  status: "approved-mock",
  note: "Fictional adult prototype assets only; replace through future CMS media records.",
} as const;
