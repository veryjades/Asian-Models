import type { VideoMedia } from "./media";

export type BoardId = "women" | "men" | "new-faces" | "talent" | "singers";

export type Board = {
  id: BoardId;
  labelEn: string;
  labelZh: string;
};

export const boards: Board[] = [
  { id: "women", labelEn: "Women", labelZh: "女模" },
  { id: "men", labelEn: "Men", labelZh: "男模" },
  { id: "new-faces", labelEn: "New Faces", labelZh: "新面孔" },
  { id: "talent", labelEn: "Talent", labelZh: "藝人" },
  { id: "singers", labelEn: "Singers", labelZh: "歌手" },
];

export type ModelStats = {
  height: string;
  weight: string;
  bust?: string;
  waist?: string;
  hips?: string;
  shoes: string;
  hair: string;
  hairZh: string;
  eyes: string;
  eyesZh: string;
};

export type Model = {
  slug: string;
  name: string;
  nameZh: string;
  board: BoardId;
  /**
   * Casting metadata. Board membership and gender are intentionally separate:
   * a male/female talent can be represented outside the Men/Women boards.
   */
  gender: "women" | "men";
  /** Languages available for casting, interviews, and on-set direction. */
  languages: string[];
  featured: boolean;
  city: string;
  cityZh: string;
  bioEn: string;
  bioZh: string;
  stats: ModelStats;
  portrait: string;
  /**
   * A reviewed second frame from the same photo session as `portrait`.
   * It must preserve identity, wardrobe, scene, camera position and framing;
   * only pose or expression may differ.
   */
  hoverPortrait?: string;
  gallery: string[];
  digitals: string[];
  /** Canonical keyword/tag slugs from the shared taxonomy registry. */
  tags: string[];
  /** Showreel / motion tests — uploaded files or YouTube links. */
  videos?: VideoMedia[];
  /** Public social channels maintained from the Admin profile. */
  socialLinks?: { platform: string; label: string; url: string }[];
};

export type NewsBodyBlock = { type: "text" | "image"; content: string; caption?: string };

export type NewsPost = {
  slug: string;
  date: string;
  titleEn: string;
  titleZh: string;
  excerptEn: string;
  excerptZh: string;
  bodyEn: string[];
  bodyZh: string[];
  /** Block-based body content (段落 + 圖片交替). Takes precedence over bodyEn/bodyZh when present. */
  bodyBlocks?: NewsBodyBlock[];
  cover: string;
  /** Canonical keyword/tag slugs from the shared taxonomy registry. */
  tags: string[];
  /** Optional media clip attached to the story. */
  videos?: VideoMedia[];
};

export type Keyword = {
  slug: string;
  labelEn: string;
  labelZh: string;
  descriptionEn: string;
  descriptionZh: string;
  active: boolean;
  /** Manual homepage/display priority. Lower numbers appear first. */
  displayPriority: number;
  /** Search/landing-page priority. Higher numbers signal stronger SEO value. */
  seoPriority: number;
  language: "shared" | "en" | "zh";
};

export type KeywordResult = {
  keyword: Keyword;
  models: Model[];
  news: NewsPost[];
  /** Current prototype portfolio content is model gallery media. */
  portfolio: Model[];
};

/**
 * The only surface the pages talk to. Swapping Supabase for any other
 * Postgres host, or for a CMS, means writing one more implementation of this
 * interface — no page or component changes.
 */
export interface ContentRepository {
  listBoards(): Promise<Board[]>;
  listModels(board?: BoardId): Promise<Model[]>;
  getModel(board: BoardId, slug: string): Promise<Model | null>;
  listFeaturedModels(limit?: number): Promise<Model[]>;
  listNews(limit?: number): Promise<NewsPost[]>;
  getNewsPost(slug: string): Promise<NewsPost | null>;
  listKeywords(options?: { activeOnly?: boolean; limit?: number }): Promise<Keyword[]>;
  getKeyword(slug: string): Promise<Keyword | null>;
  getKeywordResult(slug: string): Promise<KeywordResult | null>;
}

export type ScoutApplication = {
  name: string;
  age: string;
  city: string;
  email: string;
  phone: string;
  height: string;
  measurements: string;
  instagram: string;
  message: string;
  photoCount: number;
};
