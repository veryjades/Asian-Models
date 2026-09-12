/**
 * News-specific tag taxonomy (separate from model keyword slugs).
 * Supports English and Chinese substring matching for autocomplete.
 */
export type NewsTag = {
  slug: string;
  labelEn: string;
  labelZh: string;
};

export const NEWS_TAGS: NewsTag[] = [
  // --- Primary categories ---
  { slug: "fashion", labelEn: "Fashion", labelZh: "時尚" },
  { slug: "culture", labelEn: "Culture", labelZh: "文化" },
  // --- Fashion categories ---
  { slug: "runway", labelEn: "Runway", labelZh: "伸展台" },
  { slug: "editorial", labelEn: "Editorial", labelZh: "編輯" },
  { slug: "beauty", labelEn: "Beauty", labelZh: "美妝" },
  { slug: "campaign", labelEn: "Campaign", labelZh: "廣告企劃" },
  { slug: "commercial", labelEn: "Commercial", labelZh: "商業" },
  { slug: "fashion-week", labelEn: "Fashion Week", labelZh: "時裝週" },
  { slug: "lookbook", labelEn: "Lookbook", labelZh: "型錄" },
  { slug: "streetwear", labelEn: "Streetwear", labelZh: "街頭" },
  { slug: "couture", labelEn: "Couture", labelZh: "高訂" },
  { slug: "haute-couture", labelEn: "Haute Couture", labelZh: "高級訂製" },
  { slug: "resort", labelEn: "Resort", labelZh: "度假系列" },
  { slug: "pre-fall", labelEn: "Pre-Fall", labelZh: "早秋" },
  { slug: "spring-summer", labelEn: "Spring/Summer", labelZh: "春夏" },
  { slug: "fall-winter", labelEn: "Fall/Winter", labelZh: "秋冬" },
  { slug: "menswear", labelEn: "Menswear", labelZh: "男裝" },
  { slug: "womenswear", labelEn: "Womenswear", labelZh: "女裝" },
  { slug: "ready-to-wear", labelEn: "Ready-to-Wear", labelZh: "成衣" },
  // --- Product categories ---
  { slug: "accessories", labelEn: "Accessories", labelZh: "配件" },
  { slug: "jewelry", labelEn: "Jewelry", labelZh: "珠寶" },
  { slug: "watches", labelEn: "Watches", labelZh: "腕錶" },
  { slug: "handbags", labelEn: "Handbags", labelZh: "手袋" },
  { slug: "shoes", labelEn: "Shoes", labelZh: "鞋履" },
  { slug: "eyewear", labelEn: "Eyewear", labelZh: "眼鏡" },
  { slug: "skincare", labelEn: "Skincare", labelZh: "保養" },
  { slug: "fragrance", labelEn: "Fragrance", labelZh: "香氛" },
  { slug: "cosmetics", labelEn: "Cosmetics", labelZh: "化妝品" },
  { slug: "luxury", labelEn: "Luxury", labelZh: "精品" },
  { slug: "sportswear", labelEn: "Sportswear", labelZh: "運動" },
  { slug: "denim", labelEn: "Denim", labelZh: "丹寧" },
  { slug: "lingerie", labelEn: "Lingerie", labelZh: "內衣" },
  { slug: "swimwear", labelEn: "Swimwear", labelZh: "泳裝" },
  { slug: "bridal", labelEn: "Bridal", labelZh: "婚紗" },
  // --- Beauty & grooming ---
  { slug: "hair", labelEn: "Hair", labelZh: "髮型" },
  { slug: "makeup", labelEn: "Makeup", labelZh: "彩妝" },
  { slug: "nail-art", labelEn: "Nail Art", labelZh: "美甲" },
  // --- Industry roles / activities ---
  { slug: "casting", labelEn: "Casting", labelZh: "選角" },
  { slug: "scouting", labelEn: "Scouting", labelZh: "星探" },
  { slug: "fitting", labelEn: "Fitting", labelZh: "試裝" },
  { slug: "styling", labelEn: "Styling", labelZh: "造型" },
  { slug: "model-off-duty", labelEn: "Model Off-Duty", labelZh: "模特私服" },
  { slug: "backstage", labelEn: "Backstage", labelZh: "後台" },
  { slug: "behind-the-scenes", labelEn: "Behind the Scenes", labelZh: "幕後" },
  // --- Content types ---
  { slug: "photography", labelEn: "Photography", labelZh: "攝影" },
  { slug: "video", labelEn: "Video", labelZh: "影片" },
  { slug: "interview", labelEn: "Interview", labelZh: "訪談" },
  { slug: "cover-story", labelEn: "Cover Story", labelZh: "封面故事" },
  { slug: "profile", labelEn: "Profile", labelZh: "人物特寫" },
  { slug: "review", labelEn: "Review", labelZh: "評論" },
  // --- Agency ---
  { slug: "agency-news", labelEn: "Agency News", labelZh: "公司消息" },
  { slug: "new-faces", labelEn: "New Faces", labelZh: "新面孔" },
  { slug: "roster-update", labelEn: "Roster Update", labelZh: "名單更新" },
  { slug: "signing", labelEn: "Signing", labelZh: "簽約" },
  { slug: "collaboration", labelEn: "Collaboration", labelZh: "合作" },
  { slug: "partnership", labelEn: "Partnership", labelZh: "夥伴關係" },
  // --- Events ---
  { slug: "event", labelEn: "Event", labelZh: "活動" },
  { slug: "showroom", labelEn: "Showroom", labelZh: "展間" },
  { slug: "exhibition", labelEn: "Exhibition", labelZh: "展覽" },
  { slug: "gala", labelEn: "Gala", labelZh: "晚宴" },
  { slug: "award", labelEn: "Award", labelZh: "獎項" },
  { slug: "red-carpet", labelEn: "Red Carpet", labelZh: "紅毯" },
  { slug: "press-day", labelEn: "Press Day", labelZh: "媒體日" },
  // --- Talent types ---
  { slug: "singer", labelEn: "Singer", labelZh: "歌手" },
  { slug: "actor", labelEn: "Actor", labelZh: "演員" },
  { slug: "kol", labelEn: "KOL", labelZh: "意見領袖" },
  { slug: "influencer", labelEn: "Influencer", labelZh: "網紅" },
  { slug: "host", labelEn: "Host", labelZh: "主持人" },
  { slug: "dancer", labelEn: "Dancer", labelZh: "舞者" },
  { slug: "musician", labelEn: "Musician", labelZh: "音樂人" },
  { slug: "celebrity", labelEn: "Celebrity", labelZh: "名人" },
  { slug: "brand-ambassador", labelEn: "Brand Ambassador", labelZh: "品牌大使" },
  // --- Lifestyle ---
  { slug: "lifestyle", labelEn: "Lifestyle", labelZh: "生活風格" },
  { slug: "fitness", labelEn: "Fitness", labelZh: "健身" },
  { slug: "travel", labelEn: "Travel", labelZh: "旅遊" },
  { slug: "food", labelEn: "Food", labelZh: "美食" },
  { slug: "wellness", labelEn: "Wellness", labelZh: "養生" },
  // --- Brands (generic categories) ---
  { slug: "designer", labelEn: "Designer", labelZh: "設計師品牌" },
  { slug: "fast-fashion", labelEn: "Fast Fashion", labelZh: "快時尚" },
  { slug: "sustainable-fashion", labelEn: "Sustainable Fashion", labelZh: "永續時尚" },
  { slug: "independent-label", labelEn: "Independent Label", labelZh: "獨立品牌" },
  // --- Sustainability ---
  { slug: "sustainability", labelEn: "Sustainability", labelZh: "永續" },
  { slug: "eco-fashion", labelEn: "Eco Fashion", labelZh: "環保時尚" },
  { slug: "upcycling", labelEn: "Upcycling", labelZh: "升級改造" },
  // --- Media / platforms ---
  { slug: "digital", labelEn: "Digital", labelZh: "數位" },
  { slug: "print", labelEn: "Print", labelZh: "平面" },
  { slug: "film", labelEn: "Film", labelZh: "影視" },
  { slug: "magazine", labelEn: "Magazine", labelZh: "雜誌" },
  { slug: "social-media", labelEn: "Social Media", labelZh: "社群媒體" },
  { slug: "tiktok", labelEn: "TikTok", labelZh: "TikTok" },
  { slug: "instagram", labelEn: "Instagram", labelZh: "Instagram" },
  { slug: "youtube", labelEn: "YouTube", labelZh: "YouTube" },
  // --- Trend ---
  { slug: "trend", labelEn: "Trend", labelZh: "趨勢" },
  { slug: "trend-report", labelEn: "Trend Report", labelZh: "趨勢報告" },
  { slug: "color-trend", labelEn: "Color Trend", labelZh: "色彩趨勢" },
  // --- Cities ---
  { slug: "asia", labelEn: "Asia", labelZh: "亞洲" },
  { slug: "tokyo", labelEn: "Tokyo", labelZh: "東京" },
  { slug: "taipei", labelEn: "Taipei", labelZh: "台北" },
  { slug: "seoul", labelEn: "Seoul", labelZh: "首爾" },
  { slug: "singapore", labelEn: "Singapore", labelZh: "新加坡" },
  { slug: "paris", labelEn: "Paris", labelZh: "巴黎" },
  { slug: "milan", labelEn: "Milan", labelZh: "米蘭" },
  { slug: "new-york", labelEn: "New York", labelZh: "紐約" },
  { slug: "london", labelEn: "London", labelZh: "倫敦" },
  { slug: "shanghai", labelEn: "Shanghai", labelZh: "上海" },
  { slug: "hong-kong", labelEn: "Hong Kong", labelZh: "香港" },
  { slug: "mumbai", labelEn: "Mumbai", labelZh: "孟買" },
  { slug: "bangkok", labelEn: "Bangkok", labelZh: "曼谷" },
  { slug: "jakarta", labelEn: "Jakarta", labelZh: "雅加達" },
  { slug: "beijing", labelEn: "Beijing", labelZh: "北京" },
  { slug: "osaka", labelEn: "Osaka", labelZh: "大阪" },
  { slug: "kuala-lumpur", labelEn: "Kuala Lumpur", labelZh: "吉隆坡" },
  { slug: "manila", labelEn: "Manila", labelZh: "馬尼拉" },
  // --- Misc ---
  { slug: "diversity", labelEn: "Diversity", labelZh: "多元" },
  { slug: "inclusion", labelEn: "Inclusion", labelZh: "共融" },
  { slug: "body-positivity", labelEn: "Body Positivity", labelZh: "身體自信" },
  { slug: "street-snap", labelEn: "Street Snap", labelZh: "街拍" },
  { slug: "editorial-shoot", labelEn: "Editorial Shoot", labelZh: "編輯拍攝" },
  { slug: "advertising", labelEn: "Advertising", labelZh: "廣告" },
  { slug: "e-commerce", labelEn: "E-Commerce", labelZh: "電商" },
  { slug: "catalog", labelEn: "Catalog", labelZh: "目錄" },
];

/** Default suggestions shown when the input is empty. */
export const DEFAULT_NEWS_TAGS = NEWS_TAGS.slice(0, 10);

/** Primary editorial categories for timeline filters (類別為輔). */
export const NEWS_CATEGORIES = [
  { slug: "fashion", labelEn: "Fashion", labelZh: "時尚", seoPriority: 100 },
  { slug: "trend", labelEn: "Trend", labelZh: "流行", seoPriority: 95 },
  { slug: "beauty", labelEn: "Beauty", labelZh: "美容", seoPriority: 90 },
  { slug: "culture", labelEn: "Culture", labelZh: "文化", seoPriority: 85 },
  { slug: "luxury", labelEn: "Luxury", labelZh: "名牌", seoPriority: 88 },
  { slug: "runway", labelEn: "Runway", labelZh: "伸展台", seoPriority: 80 },
  { slug: "campaign", labelEn: "Campaign", labelZh: "廣告", seoPriority: 78 },
  { slug: "editorial", labelEn: "Editorial", labelZh: "編輯", seoPriority: 76 },
  { slug: "sustainability", labelEn: "Sustainability", labelZh: "永續", seoPriority: 70 },
  { slug: "celebrity", labelEn: "Celebrity", labelZh: "名人", seoPriority: 72 },
] as const;

export type NewsCategorySlug = (typeof NEWS_CATEGORIES)[number]["slug"];

const SEO_ALIASES: Record<string, string[]> = {
  fashion: ["時尚", "時裝", "fashion"],
  trend: ["流行", "趨勢", "trend"],
  beauty: ["美容", "美妝", "beauty"],
  culture: ["文化", "藝術", "culture"],
  luxury: ["名牌", "精品", "奢華", "luxury"],
  runway: ["伸展台", "走秀", "runway"],
  campaign: ["廣告", "campaign"],
  editorial: ["編輯", "editorial"],
  sustainability: ["永續", "環保", "sustainability"],
  celebrity: ["名人", "明星", "celebrity"],
};

export function searchNewsTags(query: string): NewsTag[] {
  const q = query.trim().toLowerCase();
  if (!q) return DEFAULT_NEWS_TAGS;
  return NEWS_TAGS.filter(
    (tag) =>
      tag.slug.includes(q) || tag.labelEn.toLowerCase().includes(q) || tag.labelZh.includes(q),
  );
}

/**
 * Lexicon SEO tag suggestions from title/excerpt/body.
 * No vendor AI — matches Chinese/English labels and aliases, ranked by SEO priority.
 */
export function suggestNewsTagsFromContent(text: string, limit = 8): string[] {
  const hay = text.toLowerCase();
  if (!hay.trim()) return [];

  const scored = NEWS_TAGS.map((tag) => {
    let score = 0;
    if (hay.includes(tag.labelZh.toLowerCase())) score += 55;
    if (hay.includes(tag.labelEn.toLowerCase())) score += 45;
    const slugWords = tag.slug.replace(/-/g, " ");
    if (hay.includes(slugWords)) score += 30;
    if (hay.includes(tag.slug)) score += 20;

    const aliases = SEO_ALIASES[tag.slug];
    if (aliases) {
      for (const alias of aliases) {
        if (hay.includes(alias.toLowerCase())) score += 50;
      }
    }

    const category = NEWS_CATEGORIES.find((c) => c.slug === tag.slug);
    if (category && score > 0) score += category.seoPriority / 10;

    return { slug: tag.slug, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));

  return scored.slice(0, limit).map((row) => row.slug);
}

export function primaryCategoryFromTags(tags: string[]): NewsCategorySlug | null {
  for (const category of NEWS_CATEGORIES) {
    if (tags.includes(category.slug)) return category.slug;
  }
  return null;
}
