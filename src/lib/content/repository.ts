import { hasKeywordTag, normalizeStoredTags, seedKeywords, sortKeywords } from "./keywords";
import { parseYouTubeId } from "./media";
import { boards, type BoardId, type ContentRepository, type Model } from "./types";
import { seedModels, seedNews } from "./seed";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/database.types";

/**
 * Seed-backed implementation. Reads from bundled content so the site is fully
 * populated before the database is connected.
 *
 * To move to your own Supabase project (or any Postgres host), add a
 * `supabaseRepository` in this folder implementing the same interface and
 * change the single export at the bottom of this file. Nothing else changes.
 */
const sortModels = (list: Model[]) => [...list].sort((a, b) => a.name.localeCompare(b.name));

export const seedRepository: ContentRepository = {
  async listBoards() {
    return boards;
  },
  async listModels(board?: BoardId) {
    return sortModels(board ? seedModels.filter((m) => m.board === board) : seedModels);
  },
  async getModel(board: BoardId, slug: string) {
    return seedModels.find((m) => m.board === board && m.slug === slug) ?? null;
  },
  async listFeaturedModels(limit = 4) {
    return seedModels.filter((m) => m.featured).slice(0, limit);
  },
  async listNews(limit) {
    const sorted = [...seedNews].sort((a, b) => b.date.localeCompare(a.date));
    return limit ? sorted.slice(0, limit) : sorted;
  },
  async getNewsPost(slug: string) {
    return seedNews.find((p) => p.slug === slug) ?? null;
  },
  async listKeywords(options) {
    const activeOnly = options?.activeOnly ?? false;
    const keywords = sortKeywords(
      activeOnly ? seedKeywords.filter((keyword) => keyword.active) : seedKeywords,
    );
    return options?.limit ? keywords.slice(0, options.limit) : keywords;
  },
  async getKeyword(slug: string) {
    return seedKeywords.find((keyword) => keyword.slug === slug) ?? null;
  },
  async getKeywordResult(slug: string) {
    const keyword = seedKeywords.find((item) => item.slug === slug && item.active);
    if (!keyword) return null;

    const models = sortModels(
      (await this.listModels()).filter((model) => hasKeywordTag(model.tags, keyword.slug)),
    );
    const news = (await this.listNews())
      .filter((post) => hasKeywordTag(post.tags, keyword.slug))
      .sort((a, b) => b.date.localeCompare(a.date));
    const portfolio = models.filter((model) => model.gallery.length > 0);

    return { keyword, models, news, portfolio };
  },
};

const fallbackModel = (row: Database["public"]["Tables"]["models"]["Row"]): Model => {
  const stats = (row.stats && typeof row.stats === "object" ? row.stats : {}) as Record<
    string,
    Json
  >;
  const textStat = (key: string, fallback = "") => String(stats[key] ?? fallback);
  const optionalStat = (key: string) => {
    const value = stats[key];
    return value ? String(value) : undefined;
  };
  const bust = optionalStat("bust");
  const waist = optionalStat("waist");
  const hips = optionalStat("hips");
  const modelStats = {
    height: textStat("height", String(row.height ?? "")),
    weight: textStat("weight"),
    shoes: textStat("shoes"),
    hair: textStat("hair"),
    hairZh: textStat("hairZh", textStat("hair")),
    eyes: textStat("eyes"),
    eyesZh: textStat("eyesZh", textStat("eyes")),
    ...(bust ? { bust } : {}),
    ...(waist ? { waist } : {}),
    ...(hips ? { hips } : {}),
  };
  const seed = seedModels.find((model) => model.slug === row.slug || model.name === row.name);
  return {
    slug: row.slug,
    name: row.name,
    nameZh: row.name_zh ?? seed?.nameZh ?? row.name,
    board: (row.board as BoardId) ?? (row.gender === "men" ? "men" : "women"),
    gender: row.gender === "men" ? "men" : "women",
    languages: row.languages,
    featured: row.featured,
    city: row.city ?? "",
    cityZh: row.city_zh ?? seed?.cityZh ?? row.city ?? "",
    bioEn: row.bio_en ?? seed?.bioEn ?? row.bio ?? "",
    bioZh: row.bio_zh ?? seed?.bioZh ?? row.bio_en ?? row.bio ?? "",
    stats: modelStats,
    portrait: seed?.portrait ?? "",
    ...(seed?.hoverPortrait ? { hoverPortrait: seed.hoverPortrait } : {}),
    gallery: seed?.gallery ?? [],
    digitals: seed?.digitals ?? [],
    tags: normalizeStoredTags(row.tags.length ? row.tags : (seed?.tags ?? [])),
    ...(seed?.videos ? { videos: seed.videos } : {}),
    socialLinks: [],
  };
};

const supabaseRepository: ContentRepository = {
  ...seedRepository,
  async listModels(board) {
    try {
      const client = getSupabaseBrowserClient();
      let query = client.from("models").select("*").eq("status", "active").order("display_name");
      if (board) query = query.eq("board", board);
      const { data, error } = await query;
      if (error || !data?.length) return seedRepository.listModels(board);
      const models = data.map(fallbackModel);
      const { data: media } = await client
        .from("media_assets")
        .select("owner_id, file_url, type, sort_order")
        .eq("owner_type", "model")
        .eq("visibility", "public")
        .in(
          "owner_id",
          data.map((row) => row.id),
        )
        .order("sort_order");
      const [videoResult, socialResult] = await Promise.all([
        client
          .from("model_video_links")
          .select("id, model_id, title, youtube_url, sort_order")
          .in(
            "model_id",
            data.map((row) => row.id),
          )
          .order("sort_order"),
        client
          .from("model_social_links")
          .select("id, model_id, platform, label, url, sort_order")
          .in(
            "model_id",
            data.map((row) => row.id),
          )
          .order("sort_order"),
      ]);
      type PublicMediaRow = NonNullable<typeof media>[number];
      const byOwner = new Map<string, PublicMediaRow[]>();
      for (const asset of media ?? []) {
        const list = byOwner.get(asset.owner_id) ?? [];
        list.push(asset);
        byOwner.set(asset.owner_id, list);
      }
      const videosByOwner = new Map<string, NonNullable<typeof videoResult.data>>();
      for (const video of videoResult.data ?? []) {
        const list = videosByOwner.get(video.model_id) ?? [];
        list.push(video);
        videosByOwner.set(video.model_id, list);
      }
      const socialsByOwner = new Map<string, NonNullable<typeof socialResult.data>>();
      for (const social of socialResult.data ?? []) {
        const list = socialsByOwner.get(social.model_id) ?? [];
        list.push(social);
        socialsByOwner.set(social.model_id, list);
      }
      return data.map((row, index) => {
        const base = models[index]!;
        const assets = byOwner.get(row.id) ?? [];
        const publicUrl = (path: string) =>
          client.storage.from("model-media").getPublicUrl(path).data.publicUrl;
        const primary = assets.find((asset) => asset.sort_order === 0);
        const hover = assets.find((asset) => asset.sort_order === 1);
        const gallery = assets
          .filter((asset) => asset.sort_order > 1 && asset.type === "image")
          .map((asset) => publicUrl(asset.file_url));
        const fileVideos = assets
          .filter((asset) => asset.type === "video")
          .map((asset) => ({
            id: `file-${asset.owner_id}-${asset.sort_order}`,
            source: "file" as const,
            src: publicUrl(asset.file_url),
            titleEn: "Showreel",
            titleZh: "動態作品",
          }));
        const youtubeVideos = (videosByOwner.get(row.id) ?? []).flatMap((video) => {
          const id = parseYouTubeId(video.youtube_url);
          if (!id) return [];
          return [
            {
              id: `db-${video.id}`,
              source: "youtube" as const,
              src: id,
              titleEn: video.title,
              titleZh: video.title,
            },
          ];
        });
        const videos = [...fileVideos, ...youtubeVideos];
        const socialLinks = (socialsByOwner.get(row.id) ?? []).map((social) => ({
          platform: social.platform,
          label: social.label,
          url: social.url,
        }));
        return {
          ...base,
          ...(primary ? { portrait: publicUrl(primary.file_url) } : {}),
          ...(hover ? { hoverPortrait: publicUrl(hover.file_url) } : {}),
          ...(gallery.length ? { gallery } : {}),
          ...(videos.length ? { videos } : {}),
          ...(socialLinks.length ? { socialLinks } : {}),
        };
      });
    } catch {
      return seedRepository.listModels(board);
    }
  },
  async getModel(board, slug) {
    const models = await this.listModels(board);
    return models.find((model) => model.slug === slug) ?? seedRepository.getModel(board, slug);
  },
  async listFeaturedModels(limit = 4) {
    const models = await this.listModels();
    return models.filter((model) => model.featured).slice(0, limit);
  },
  async listNews(limit) {
    try {
      const client = getSupabaseBrowserClient();
      let query = client
        .from("news_posts")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error || !data?.length) return seedRepository.listNews(limit);
      return data.map((row) => ({
        slug: row.slug,
        date: row.date,
        titleEn: row.title_en,
        titleZh: row.title_zh,
        excerptEn: row.excerpt_en,
        excerptZh: row.excerpt_zh,
        bodyEn: row.body_en,
        bodyZh: row.body_zh,
        cover: row.cover_url ?? seedNews.find((post) => post.slug === row.slug)?.cover ?? "",
        tags: normalizeStoredTags(row.tags),
      }));
    } catch {
      return seedRepository.listNews(limit);
    }
  },
  async getNewsPost(slug) {
    try {
      const client = getSupabaseBrowserClient();
      const { data, error } = await client
        .from("news_posts")
        .select("*")
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return seedRepository.getNewsPost(slug);
      return {
        slug: data.slug,
        date: data.date,
        titleEn: data.title_en,
        titleZh: data.title_zh,
        excerptEn: data.excerpt_en,
        excerptZh: data.excerpt_zh,
        bodyEn: data.body_en,
        bodyZh: data.body_zh,
        cover: data.cover_url ?? seedNews.find((post) => post.slug === data.slug)?.cover ?? "",
        tags: normalizeStoredTags(data.tags),
      };
    } catch {
      return seedRepository.getNewsPost(slug);
    }
  },
};

export const contentRepository: ContentRepository = supabaseRepository;
