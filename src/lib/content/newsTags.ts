/**
 * News-specific tag taxonomy (separate from model keyword slugs).
 * These tags are used for news categorization and search within the news section.
 * Type the first letter/character to trigger the autocomplete dropdown.
 */
export type NewsTag = {
  slug: string;
  labelEn: string;
  labelZh: string;
};

export const NEWS_TAGS: NewsTag[] = [
  { slug: "runway", labelEn: "Runway", labelZh: "伸展台" },
  { slug: "editorial", labelEn: "Editorial", labelZh: "編輯" },
  { slug: "beauty", labelEn: "Beauty", labelZh: "美妝" },
  { slug: "campaign", labelEn: "Campaign", labelZh: "廣告" },
  { slug: "commercial", labelEn: "Commercial", labelZh: "商業" },
  { slug: "fashion-week", labelEn: "Fashion Week", labelZh: "時裝週" },
  { slug: "lookbook", labelEn: "Lookbook", labelZh: "型錄" },
  { slug: "streetwear", labelEn: "Streetwear", labelZh: "街頭" },
  { slug: "couture", labelEn: "Couture", labelZh: "高訂" },
  { slug: "resort", labelEn: "Resort", labelZh: "度假系列" },
  { slug: "menswear", labelEn: "Menswear", labelZh: "男裝" },
  { slug: "womenswear", labelEn: "Womenswear", labelZh: "女裝" },
  { slug: "accessories", labelEn: "Accessories", labelZh: "配件" },
  { slug: "jewelry", labelEn: "Jewelry", labelZh: "珠寶" },
  { slug: "skincare", labelEn: "Skincare", labelZh: "保養" },
  { slug: "fragrance", labelEn: "Fragrance", labelZh: "香氛" },
  { slug: "sustainability", labelEn: "Sustainability", labelZh: "永續" },
  { slug: "casting", labelEn: "Casting", labelZh: "選角" },
  { slug: "scouting", labelEn: "Scouting", labelZh: "星探" },
  { slug: "agency-news", labelEn: "Agency News", labelZh: "公司消息" },
  { slug: "new-faces", labelEn: "New Faces", labelZh: "新面孔" },
  { slug: "photography", labelEn: "Photography", labelZh: "攝影" },
  { slug: "video", labelEn: "Video", labelZh: "影片" },
  { slug: "interview", labelEn: "Interview", labelZh: "訪談" },
  { slug: "event", labelEn: "Event", labelZh: "活動" },
  { slug: "showroom", labelEn: "Showroom", labelZh: "展間" },
  { slug: "collaboration", labelEn: "Collaboration", labelZh: "合作" },
  { slug: "lifestyle", labelEn: "Lifestyle", labelZh: "生活風格" },
  { slug: "fitness", labelEn: "Fitness", labelZh: "健身" },
  { slug: "travel", labelEn: "Travel", labelZh: "旅遊" },
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
  { slug: "digital", labelEn: "Digital", labelZh: "數位" },
  { slug: "print", labelEn: "Print", labelZh: "平面" },
  { slug: "film", labelEn: "Film", labelZh: "影視" },
  { slug: "luxury", labelEn: "Luxury", labelZh: "精品" },
  { slug: "sportswear", labelEn: "Sportswear", labelZh: "運動" },
  { slug: "denim", labelEn: "Denim", labelZh: "丹寧" },
  { slug: "lingerie", labelEn: "Lingerie", labelZh: "內衣" },
  { slug: "swimwear", labelEn: "Swimwear", labelZh: "泳裝" },
  { slug: "bridal", labelEn: "Bridal", labelZh: "婚紗" },
  { slug: "hair", labelEn: "Hair", labelZh: "髮型" },
  { slug: "makeup", labelEn: "Makeup", labelZh: "彩妝" },
  { slug: "trend", labelEn: "Trend", labelZh: "趨勢" },
  { slug: "behind-the-scenes", labelEn: "Behind the Scenes", labelZh: "幕後" },
];

export function searchNewsTags(query: string): NewsTag[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return NEWS_TAGS.filter(
    (tag) =>
      tag.slug.startsWith(q) ||
      tag.labelEn.toLowerCase().startsWith(q) ||
      tag.labelZh.startsWith(q),
  );
}
