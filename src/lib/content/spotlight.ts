import m1 from "@/assets/model-01.jpg";
import m2 from "@/assets/model-02.jpg";
import m3 from "@/assets/model-03.jpg";
import m4 from "@/assets/model-04.jpg";
import m5 from "@/assets/model-05.jpg";
import m6 from "@/assets/model-06.jpg";
import hero from "@/assets/hero.jpg";

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
  titleEn: string;
  titleZh: string;
  captionEn: string;
  captionZh: string;
  /** Internal route, e.g. "/news/tokyo-showroom" */
  href: string;
  /** Optional external link (social post, press clip) */
  externalHref?: string;
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
    id: "showroom-sept",
    kind: "event",
    image: hero,
    titleEn: "September showroom, Taipei",
    titleZh: "九月展間・台北",
    captionEn: "Three days with casting directors and stylists for the autumn calendar.",
    captionZh: "為期三天，接待秋季檔期的選角與造型團隊。",
    href: "/news",
  },
  {
    id: "spring-board-update",
    kind: "news",
    image: m5,
    titleEn: "Spring board update",
    titleZh: "春季分類更新",
    captionEn: "Four new signings join the Women and New Faces boards.",
    captionZh: "四位新簽約模特兒加入女模與新面孔分類。",
    href: "/news/spring-board-update",
  },
  {
    id: "vogue-clip",
    kind: "media",
    image: m3,
    titleEn: "Backstage film, Taipei season",
    titleZh: "台北時裝季後台影片",
    captionEn: "A two-minute cut from the runway backstage.",
    captionZh: "伸展台後台的兩分鐘剪輯。",
    href: "/news/tokyo-showroom",
  },
  {
    id: "new-face-mei",
    kind: "new-face",
    image: m4,
    titleEn: "New face: scouted in Tainan",
    titleZh: "新面孔：發掘於台南",
    captionEn: "The latest addition to the New Faces board.",
    captionZh: "新面孔分類最新加入的成員。",
    href: "/models/new-faces",
  },
  {
    id: "ig-post",
    kind: "social",
    image: m6,
    titleEn: "From our Instagram",
    titleZh: "來自我們的 Instagram",
    captionEn: "Polaroids from this week's studio day.",
    captionZh: "本週攝影棚日的拍立得。",
    href: "/news",
    externalHref: "https://instagram.com",
  },
  {
    id: "tokyo-showroom",
    kind: "event",
    image: m2,
    titleEn: "Tokyo showroom, Shibuya",
    titleZh: "東京展間・澀谷",
    captionEn: "Fourteen models across two boards met the autumn buyers.",
    captionZh: "十四位模特兒、兩個分類，與秋季客戶會面。",
    href: "/news/tokyo-showroom",
  },
  {
    id: "scouting-feature",
    kind: "media",
    image: m1,
    titleEn: "On scouting in Asia",
    titleZh: "關於亞洲的星探工作",
    captionEn: "Why we look outside the capitals.",
    captionZh: "為什麼我們走出首都城市。",
    href: "/news/on-scouting-in-asia",
  },
];

/** Fisher-Yates — a fresh order on every visit. */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
