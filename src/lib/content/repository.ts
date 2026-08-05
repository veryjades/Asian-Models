import { boards, type BoardId, type ContentRepository, type Model } from "./types";
import { seedModels, seedNews } from "./seed";

/**
 * Seed-backed implementation. Reads from bundled content so the site is fully
 * populated before the database is connected.
 *
 * To move to your own Supabase project (or any Postgres host), add a
 * `supabaseRepository` in this folder implementing the same interface and
 * change the single export at the bottom of this file. Nothing else changes.
 */
const sortModels = (list: Model[]) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name));

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
};

export const contentRepository: ContentRepository = seedRepository;
