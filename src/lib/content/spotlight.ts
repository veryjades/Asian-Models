import { goldenMockAssets } from "./mockAssets";

/**
 * Slides shown in the rotating band at the top of the home page.
 * Kept in one seed file so the same shape can later be served from the
 * ContentRepository / admin panel without touching the carousel component.
 */
export type SpotlightKind = "event" | "news" | "media" | "new-face" | "social";

export type SpotlightSlide = {
  id: string;
  kind: SpotlightKind;
  image: string;
  /** Image presentation travels with the content and will map to future CMS metadata. */
  imageFit: "contain" | "cover";
  objectPosition: string;
  titleEn: string;
  titleZh: string;
  captionEn: string;
  captionZh: string;
  ctaEn: string;
  ctaZh: string;
  /** Route pattern + params, e.g. "/news/$slug" with { slug } */
  to: string;
  params?: Record<string, string>;
  /** Optional external link (social post, press clip) */
  externalHref?: string;
  /** Optional clip behind the slide — uploaded file URL or YouTube id. */
  video?: { source: "file" | "youtube"; src: string };
};

export const spotlightLabels: Record<SpotlightKind, { en: string; zh: string }> = {
  event: { en: "Event", zh: "活動" },
  news: { en: "News", zh: "消息" },
  media: { en: "Media", zh: "媒體" },
  "new-face": { en: "New Face", zh: "新面孔" },
  social: { en: "Social", zh: "社群" },
};

export const spotlightSlides: SpotlightSlide[] = [
  {
    id: "taipei-atelier",
    kind: "new-face",
    image: goldenMockAssets.hero.taipeiAtelier,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Taipei atelier — Women",
    titleZh: "台北 atelier・女模",
    captionEn: "A considered new season of editorial and campaign talent.",
    captionZh: "為 editorial 與品牌廣告精選的全新面孔。",
    ctaEn: "View Women",
    ctaZh: "查看女模",
    to: "/models/$board",
    params: { board: "women" },
  },
  {
    id: "seoul-tailoring",
    kind: "event",
    image: goldenMockAssets.hero.seoulTailoring,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Seoul tailoring — Men",
    titleZh: "首爾西裝・男模",
    captionEn: "Menswear talent with presence for regional campaigns and editorials.",
    captionZh: "適合亞洲市場廣告與時尚 editorial 的男模。",
    ctaEn: "View Men",
    ctaZh: "查看男模",
    to: "/models/$board",
    params: { board: "men" },
  },
  {
    id: "tokyo-evening",
    kind: "media",
    image: goldenMockAssets.hero.tokyoEvening,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Tokyo evening — New Faces",
    titleZh: "東京夜色・新面孔",
    captionEn: "Fresh, natural talent prepared for the next casting conversation.",
    captionZh: "為下一場選角而準備的自然新面孔。",
    ctaEn: "Meet New Faces",
    ctaZh: "認識新面孔",
    to: "/models/$board",
    params: { board: "new-faces" },
  },
];

/** Fisher-Yates — a fresh order on every visit. */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i] as T;
    out[i] = out[j] as T;
    out[j] = a;
  }
  return out;
}
