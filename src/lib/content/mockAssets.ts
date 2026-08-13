import heroTaipeiAtelier from "@/assets/mock/golden-set/hero-taipei-atelier.webp";
import heroSeoulTailoring from "@/assets/mock/golden-set/hero-seoul-tailoring.webp";
import heroTokyoEvening from "@/assets/mock/golden-set/hero-tokyo-evening.webp";
import menJunFullBody from "@/assets/mock/golden-set/men-jun-full-body.webp";
import menJunPortrait from "@/assets/mock/golden-set/men-jun-portrait.webp";
import linWeiJieHover from "@/assets/mock/golden-set/lin-wei-jie-hover.webp";
import linWeiJieLook02 from "@/assets/mock/golden-set/lin-wei-jie-look-02.webp";
import menRenFullBody from "@/assets/mock/golden-set/men-ren-full-body.webp";
import menRenPortrait from "@/assets/mock/golden-set/men-ren-portrait.webp";
import newFaceDaiDigital from "@/assets/mock/golden-set/new-face-dai-digital.webp";
import newFaceNariDigital from "@/assets/mock/golden-set/new-face-nari-digital.webp";
import hinaChinenHover from "@/assets/mock/golden-set/hina-chinen-hover.webp";
import hinaChinenLook02 from "@/assets/mock/golden-set/hina-chinen-look-02.webp";
import portfolioBeautyCampaign from "@/assets/mock/golden-set/portfolio-beauty-campaign.webp";
import portfolioMenCommercial from "@/assets/mock/golden-set/portfolio-men-commercial.webp";
import portfolioWomenEditorial from "@/assets/mock/golden-set/portfolio-women-editorial.webp";
import womenAyaFullBody from "@/assets/mock/golden-set/women-aya-full-body.webp";
import womenAyaLook02 from "@/assets/mock/golden-set/women-aya-look-02.webp";
import womenAyaLook03 from "@/assets/mock/golden-set/women-aya-look-03.webp";
import womenAyaPortrait from "@/assets/mock/golden-set/women-aya-portrait.webp";
import womenMeiFullBody from "@/assets/mock/golden-set/women-mei-full-body.webp";
import womenMeiHover from "@/assets/mock/golden-set/women-mei-hover.webp";
import womenMeiLook03 from "@/assets/mock/golden-set/women-mei-look-03.webp";
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
    aya: {
      portrait: womenAyaPortrait,
      fullBody: womenAyaFullBody,
      // Strongest reviewed same-session pose change: the shoulders, torso, arm
      // line, stance, and leg separation all reset without changing Chen's
      // identity, studio, wardrobe, or card framing.
      hoverPortrait: womenAyaLook02,
      look02: womenAyaLook02,
      look03: womenAyaLook03,
    },
    mei: {
      portrait: womenMeiPortrait,
      fullBody: womenMeiFullBody,
      hoverPortrait: womenMeiHover,
      look03: womenMeiLook03,
    },
    sora: {
      portrait: womenSoraPortrait,
      fullBody: womenSoraFullBody,
      // Reviewed same-person full-body extension; the wider stance and hand
      // placement read as a distinct second frame in the fixed card window.
      hoverPortrait: womenSoraFullBody,
    },
  },
  men: {
    jun: {
      portrait: menJunPortrait,
      fullBody: menJunFullBody,
      // The same-studio navy-suit side profile is the identity-safe hover
      // frame; the beach image stays a portfolio look instead.
      hoverPortrait: linWeiJieLook02,
      look02: linWeiJieHover,
    },
    ren: {
      portrait: menRenPortrait,
      fullBody: menRenFullBody,
      // Reviewed same-person full-body extension with a changed arm line and
      // stance, used as the card's second frame without changing geometry.
      hoverPortrait: menRenFullBody,
    },
  },
  newFaces: {
    nari: newFaceNariDigital,
    dai: newFaceDaiDigital,
    // The seated studio frame keeps stronger face/hair continuity with the
    // existing Hina digital; the rainbow frame remains a portfolio look.
    hinaHover: hinaChinenLook02,
    hinaLook02: hinaChinenHover,
  },
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
    id: "women-aya-look-02",
    usage: "portfolio-gallery",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-aya-look-03",
    usage: "portfolio-gallery",
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
    id: "women-mei-hover",
    usage: "portrait-card-hover",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "women-mei-look-03",
    usage: "portfolio-gallery",
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
    id: "women-sora-hover",
    usage: "portrait-card-hover",
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
    id: "lin-wei-jie-look-02",
    usage: "portrait-card-hover",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "lin-wei-jie-hover",
    usage: "portfolio-gallery",
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
    id: "men-ren-hover",
    usage: "portrait-card-hover",
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
    id: "hina-chinen-hover",
    usage: "portfolio-gallery",
    aspectRatio: "2 / 3",
    objectPosition: "50% 50%",
  },
  {
    id: "hina-chinen-look-02",
    usage: "portrait-card-hover",
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
