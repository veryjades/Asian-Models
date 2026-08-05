export type BoardId = "women" | "men" | "new-faces" | "talent";

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
];

export type ModelStats = {
  height: string;
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
  featured: boolean;
  city: string;
  cityZh: string;
  bioEn: string;
  bioZh: string;
  stats: ModelStats;
  portrait: string;
  gallery: string[];
  digitals: string[];
};

export type NewsPost = {
  slug: string;
  date: string;
  titleEn: string;
  titleZh: string;
  excerptEn: string;
  excerptZh: string;
  bodyEn: string[];
  bodyZh: string[];
  cover: string;
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
