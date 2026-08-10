import m1 from "@/assets/model-01.jpg";
import m2 from "@/assets/model-02.jpg";
import m3 from "@/assets/model-03.jpg";
import m4 from "@/assets/model-04.jpg";
import m5 from "@/assets/model-05.jpg";
import m6 from "@/assets/model-06.jpg";
import m10 from "@/assets/model-10.jpg";
import m12 from "@/assets/model-12.jpg";
import m13 from "@/assets/model-13.jpg";
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
  /** Image presentation travels with the content and will map to future CMS metadata. */
  imageFit: "contain" | "cover";
  objectPosition: string;
  titleEn: string;
  titleZh: string;
  captionEn: string;
  captionZh: string;
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
    id: "showroom-sept",
    kind: "event",
    image: hero,
    imageFit: "cover",
    objectPosition: "50% 50%",
    titleEn: "September showroom, Taipei",
    titleZh: "九月展間・台北",
    captionEn: "Three days with casting directors and stylists for the autumn calendar.",
    captionZh: "為期三天，接待秋季檔期的選角與造型團隊。",
    to: "/news",
  },
  {
    id: "spring-board-update",
    kind: "news",
    image: m5,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Spring board update",
    titleZh: "春季分類更新",
    captionEn: "Four new signings join the Women and New Faces boards.",
    captionZh: "四位新簽約模特兒加入女模與新面孔分類。",
    to: "/news/$slug",
    params: { slug: "spring-board-update" },
  },
  {
    id: "vogue-clip",
    kind: "media",
    image: m3,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Backstage film, Taipei season",
    titleZh: "台北時裝季後台影片",
    captionEn: "A two-minute cut from the runway backstage.",
    captionZh: "伸展台後台的兩分鐘剪輯。",
    to: "/news/$slug",
    params: { slug: "tokyo-showroom" },
  },
  {
    id: "new-face-mei",
    kind: "new-face",
    image: m4,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "New face: scouted in Tainan",
    titleZh: "新面孔：發掘於台南",
    captionEn: "The latest addition to the New Faces board.",
    captionZh: "新面孔分類最新加入的成員。",
    to: "/models/$board",
    params: { board: "new-faces" },
  },
  {
    id: "ig-post",
    kind: "social",
    image: m6,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "From our Instagram",
    titleZh: "來自我們的 Instagram",
    captionEn: "Polaroids from this week's studio day.",
    captionZh: "本週攝影棚日的拍立得。",
    to: "/news",
    externalHref: "https://www.instagram.com/jjmodelagency",
  },
  {
    id: "tokyo-showroom",
    kind: "event",
    image: m2,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Tokyo showroom, Shibuya",
    titleZh: "東京展間・澀谷",
    captionEn: "Fourteen models across two boards met the autumn buyers.",
    captionZh: "十四位模特兒、兩個分類，與秋季客戶會面。",
    to: "/news/$slug",
    params: { slug: "tokyo-showroom" },
  },
  {
    id: "inclusive-casting",
    kind: "event",
    image: m10,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Open casting: every face, every age",
    titleZh: "公開選角：不分面孔、不分年齡",
    captionEn:
      "Our Taipei open call is unrestricted by ethnicity, age or size — walk in with daylight photographs.",
    captionZh: "台北公開徵選不限族裔、年齡或尺碼，帶著日光照片即可到場。",
    to: "/scouted",
  },
  {
    id: "global-board",
    kind: "new-face",
    image: m12,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "A board that looks like the region",
    titleZh: "如同這片區域一樣多元的分類",
    captionEn:
      "Filipino-Spanish, Nigerian, South Asian and East Asian talent, booked side by side.",
    captionZh: "菲西混血、奈及利亞、南亞與東亞面孔並肩合作。",
    to: "/models/$board",
    params: { board: "men" },
  },
  {
    id: "classic-division",
    kind: "media",
    image: m13,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "Classic division film",
    titleZh: "經典分類影片",
    captionEn: "A short film with our silver-haired talent for a skincare campaign.",
    captionZh: "與銀髮模特兒合作的保養品廣告短片。",
    to: "/models/$board/$slug",
    params: { board: "talent", slug: "margit-lindqvist" },
    video: { source: "youtube", src: "aqz-KE-bpKQ" },
  },
  {
    id: "fb-post",
    kind: "social",
    image: m12,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "From our Facebook page",
    titleZh: "來自我們的 Facebook 專頁",
    captionEn: "Casting calls and backstage updates, posted weekly.",
    captionZh: "每週更新的選角資訊與後台花絮。",
    to: "/news",
    externalHref: "https://www.facebook.com/jjmodelagency",
  },
  {
    id: "scouting-feature",
    kind: "media",
    image: m1,
    imageFit: "contain",
    objectPosition: "50% 50%",
    titleEn: "On scouting in Asia",
    titleZh: "關於亞洲的星探工作",
    captionEn: "Why we look outside the capitals.",
    captionZh: "為什麼我們走出首都城市。",
    to: "/news/$slug",
    params: { slug: "on-scouting-in-asia" },
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
