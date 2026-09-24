import type { Keyword } from "./types";

/**
 * Prototype keyword/tag registry.
 *
 * This is deliberately a data boundary rather than a homepage-only list:
 * future CMS/admin storage should expose this same shape so editors can add,
 * edit, deactivate, rank and reuse canonical tags without changing frontend
 * code.
 */
export const seedKeywords: Keyword[] = [
  {
    slug: "women",
    labelEn: "Women",
    labelZh: "女模",
    descriptionEn: "Female model profiles for fashion, editorial, beauty and commercial casting.",
    descriptionZh: "適合時裝、Editorial、美妝與商業拍攝的女模檔案。",
    active: true,
    displayPriority: 10,
    seoPriority: 90,
    language: "shared",
  },
  {
    slug: "men",
    labelEn: "Men",
    labelZh: "男模",
    descriptionEn: "Male model profiles for tailoring, campaign, commercial and editorial work.",
    descriptionZh: "適合西服、品牌廣告、商業與 Editorial 工作的男模檔案。",
    active: true,
    displayPriority: 20,
    seoPriority: 88,
    language: "shared",
  },
  {
    slug: "new-faces",
    labelEn: "New Faces",
    labelZh: "新面孔",
    descriptionEn: "Fresh talent and natural test images for upcoming castings.",
    descriptionZh: "適合新一輪選角的新面孔與自然試拍資料。",
    active: true,
    displayPriority: 30,
    seoPriority: 86,
    language: "shared",
  },
  {
    slug: "host",
    labelEn: "Host",
    labelZh: "主持人",
    descriptionEn: "Presenter and hosting talent for commercial and event productions.",
    descriptionZh: "適合商業與活動製作的主持人才。",
    active: true,
    displayPriority: 40,
    seoPriority: 84,
    language: "shared",
  },
  {
    slug: "show-girl",
    labelEn: "Show Girl",
    labelZh: "Show Girl",
    descriptionEn: "Event, expo and brand appearance talent with polished presence.",
    descriptionZh: "適合展會、活動與品牌出席的專業形象人才。",
    active: true,
    displayPriority: 50,
    seoPriority: 82,
    language: "shared",
  },
  {
    slug: "commercial-model",
    labelEn: "Commercial",
    labelZh: "商業模特",
    descriptionEn: "Talent suited to brand campaigns, advertising and production briefs.",
    descriptionZh: "適合品牌廣告、商業拍攝與製作需求的模特兒。",
    active: true,
    displayPriority: 60,
    seoPriority: 94,
    language: "shared",
  },
  {
    slug: "fashion-model",
    labelEn: "Fashion",
    labelZh: "時裝模特",
    descriptionEn: "Fashion campaign, lookbook and runway-ready model profiles.",
    descriptionZh: "適合時裝廣告、型錄與伸展台的模特兒檔案。",
    active: true,
    displayPriority: 70,
    seoPriority: 90,
    language: "shared",
  },
  {
    slug: "print-model",
    labelEn: "Print",
    labelZh: "平面模特",
    descriptionEn: "Still photography talent for lookbooks, catalogues and campaigns.",
    descriptionZh: "適合型錄、平面廣告與品牌形象拍攝的人選。",
    active: true,
    displayPriority: 80,
    seoPriority: 88,
    language: "shared",
  },
  {
    slug: "advertising-model",
    labelEn: "Advertising",
    labelZh: "廣告模特",
    descriptionEn: "Commercial faces for advertising film, stills and brand usage.",
    descriptionZh: "適合廣告影片、平面與品牌使用的人選。",
    active: true,
    displayPriority: 90,
    seoPriority: 92,
    language: "shared",
  },
  {
    slug: "actor",
    labelEn: "Actor",
    labelZh: "演員",
    descriptionEn: "Screen and commercial acting talent represented by the agency.",
    descriptionZh: "經紀公司代理的影像與商業演員人才。",
    active: true,
    displayPriority: 100,
    seoPriority: 83,
    language: "shared",
  },
  {
    slug: "influencer",
    labelEn: "Influencer",
    labelZh: "網紅",
    descriptionEn: "Social-first talent for brand collaborations and campaign amplification.",
    descriptionZh: "適合品牌合作與社群擴散的社群型人才。",
    active: true,
    displayPriority: 110,
    seoPriority: 81,
    language: "shared",
  },
  {
    slug: "kol",
    labelEn: "KOL",
    labelZh: "KOL",
    descriptionEn: "Creator and opinion-leader talent for market-facing campaigns.",
    descriptionZh: "適合市場溝通與品牌合作的 KOL 人才。",
    active: true,
    displayPriority: 120,
    seoPriority: 80,
    language: "shared",
  },
  {
    slug: "editorial-model",
    labelEn: "Editorial",
    labelZh: "Editorial",
    descriptionEn: "Faces with a strong fashion editorial presence and portfolio language.",
    descriptionZh: "具備時尚 Editorial 表現力與作品集語言的面孔。",
    active: true,
    displayPriority: 130,
    seoPriority: 91,
    language: "shared",
  },
  {
    slug: "runway",
    labelEn: "Runway",
    labelZh: "Runway",
    descriptionEn: "Runway-ready talent for fashion shows, presentations and designer events.",
    descriptionZh: "適合時裝秀、發表會與設計師活動的人選。",
    active: true,
    displayPriority: 140,
    seoPriority: 87,
    language: "shared",
  },
  {
    slug: "beauty",
    labelEn: "Beauty",
    labelZh: "Beauty",
    descriptionEn: "Beauty, skincare, hair and close-up campaign talent.",
    descriptionZh: "適合美妝、保養、髮妝與近景廣告的人選。",
    active: true,
    displayPriority: 150,
    seoPriority: 89,
    language: "shared",
  },
  {
    slug: "taipei",
    labelEn: "Taipei",
    labelZh: "台北",
    descriptionEn: "Talent and agency activity connected to the Taipei production market.",
    descriptionZh: "與台北製作市場相關的模特兒與經紀公司內容。",
    active: false,
    displayPriority: 220,
    seoPriority: 78,
    language: "shared",
  },
  {
    slug: "tokyo",
    labelEn: "Tokyo",
    labelZh: "東京",
    descriptionEn: "Talent, showrooms and castings connected to Tokyo.",
    descriptionZh: "與東京相關的模特兒、展間與選角內容。",
    active: false,
    displayPriority: 230,
    seoPriority: 78,
    language: "shared",
  },
  {
    slug: "seoul",
    labelEn: "Seoul",
    labelZh: "首爾",
    descriptionEn: "Talent and casting context for Seoul and Korean production needs.",
    descriptionZh: "面向首爾與韓國製作需求的模特兒與選角內容。",
    active: false,
    displayPriority: 240,
    seoPriority: 76,
    language: "shared",
  },
  {
    slug: "asia",
    labelEn: "Asia",
    labelZh: "亞洲",
    descriptionEn: "Regional model discovery across Asian production markets.",
    descriptionZh: "橫跨亞洲製作市場的模特兒探索。",
    active: false,
    displayPriority: 250,
    seoPriority: 82,
    language: "shared",
  },
  {
    slug: "natural-test",
    labelEn: "Natural tests",
    labelZh: "自然試拍",
    descriptionEn: "Unretouched digitals and natural first tests for casting review.",
    descriptionZh: "供選角審閱的未修圖生活照與自然初次試拍。",
    active: false,
    displayPriority: 260,
    seoPriority: 80,
    language: "shared",
  },
  {
    slug: "scouting",
    labelEn: "Scouting",
    labelZh: "星探",
    descriptionEn: "Scouting stories and guidance for future model applicants.",
    descriptionZh: "星探故事與未來模特兒申請指南。",
    active: false,
    displayPriority: 270,
    seoPriority: 79,
    language: "shared",
  },
  {
    slug: "automotive-commercial",
    labelEn: "Automotive commercial",
    labelZh: "汽車廣告",
    descriptionEn: "A future production-need keyword for automotive campaign casting.",
    descriptionZh: "供未來汽車品牌廣告選角使用的製作需求關鍵字。",
    active: false,
    displayPriority: 300,
    seoPriority: 70,
    language: "shared",
  },
  {
    slug: "child-star",
    labelEn: "Child star",
    labelZh: "童星",
    descriptionEn: "A future keyword category; inactive until approved child-talent policy exists.",
    descriptionZh: "未來分類；需等童星政策核准後才啟用。",
    active: false,
    displayPriority: 310,
    seoPriority: 65,
    language: "shared",
  },
];

export function sortKeywords(keywords: Keyword[]) {
  return [...keywords].sort(
    (a, b) => a.displayPriority - b.displayPriority || b.seoPriority - a.seoPriority,
  );
}

const TAG_ALIASES: Record<string, string> = {
  editorial: "editorial-model",
  "editorial-model": "editorial-model",
  編輯: "editorial-model",
  beauty: "beauty",
  美妝: "beauty",
  美容: "beauty",
  runway: "runway",
  伸展台: "runway",
  走秀: "runway",
  fashion: "fashion-model",
  "fashion-model": "fashion-model",
  時裝: "fashion-model",
  commercial: "commercial-model",
  "commercial-model": "commercial-model",
  print: "print-model",
  "print-model": "print-model",
  advertising: "advertising-model",
  "advertising-model": "advertising-model",
  women: "women",
  女模: "women",
  men: "men",
  男模: "men",
  "new-faces": "new-faces",
  新面孔: "new-faces",
  talent: "talent",
  藝人: "talent",
};

const knownSlugs = new Set(seedKeywords.map((keyword) => keyword.slug));

/** Map typed Admin labels onto canonical keyword slugs used by public tag pages. */
export function canonicalizeTag(raw: string): string | null {
  const value = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (!value) return null;
  const aliased = TAG_ALIASES[value] ?? TAG_ALIASES[raw.trim()] ?? value;
  return aliased;
}

export function normalizeStoredTags(tags: string[]): string[] {
  const unique = new Set<string>();
  for (const tag of tags) {
    const next = canonicalizeTag(tag);
    if (next) unique.add(next);
  }
  return [...unique];
}

export function hasKeywordTag(tags: string[], slug: string): boolean {
  const want = canonicalizeTag(slug) ?? slug;
  return normalizeStoredTags(tags).includes(want) || tags.includes(slug);
}

export function isKnownKeywordSlug(slug: string): boolean {
  return knownSlugs.has(slug);
}
