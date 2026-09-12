import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import { NewsBlockEditor } from "@/components/admin/NewsBlockEditor";
import type { NewsBodyBlock } from "@/lib/content/types";
import {
  NEWS_CATEGORIES,
  NEWS_TAGS,
  primaryCategoryFromTags,
  searchNewsTags,
  suggestNewsTagsFromContent,
  type NewsCategorySlug,
  type NewsTag,
} from "@/lib/content/newsTags";
import { englishFromChinese } from "@/lib/i18n/translationAdapter";
import type { Database } from "@/lib/supabase/database.types";

type NewsRow = Database["public"]["Tables"]["news_posts"]["Row"];
type NewsStatus = "draft" | "published" | "archived";

async function invalidateNewsQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["news"] }),
    queryClient.invalidateQueries({ queryKey: ["home"] }),
    queryClient.invalidateQueries({ queryKey: ["keyword"] }),
  ]);
}

function statusLabel(status: string) {
  if (status === "published") return "已發布";
  if (status === "archived") return "已封存";
  return "草稿";
}

function statusClass(status: string) {
  if (status === "published") return "bg-emerald-500/20 text-emerald-200";
  if (status === "archived") return "bg-white/10 text-white/50";
  return "bg-amber-500/20 text-amber-100";
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${y} 年 ${Number(m)} 月`;
}

function NewsTagChips({
  selectedTags,
  onAdd,
  onRemove,
  onAutoSuggest,
  suggested,
  disabled,
}: {
  selectedTags: string[];
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
  onAutoSuggest: () => void;
  suggested: string[];
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const matches = searchNewsTags(query).filter((tag) => !selectedTags.includes(tag.slug));
  const labelFor = (slug: string) => NEWS_TAGS.find((tag) => tag.slug === slug)?.labelZh ?? slug;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-white/65">SEO 標籤</p>
        <button
          type="button"
          disabled={disabled}
          onClick={onAutoSuggest}
          className="border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
        >
          依內容自動產生
        </button>
      </div>
      {suggested.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-white/40">建議：</span>
          {suggested.map((slug) => (
            <button
              key={slug}
              type="button"
              disabled={disabled || selectedTags.includes(slug)}
              onClick={() => onAdd(slug)}
              className="rounded-full border border-dashed border-white/25 px-2.5 py-1 text-xs text-white/65 hover:bg-white/5 disabled:opacity-30"
            >
              + {labelFor(slug)}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((slug) => (
          <button
            key={slug}
            type="button"
            disabled={disabled}
            onClick={() => onRemove(slug)}
            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white"
          >
            {labelFor(slug)} ×
          </button>
        ))}
      </div>
      <input
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋標籤（可不打字，用自動產生）"
        className="w-full border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-white/50"
      />
      {query.trim() ? (
        <ul className="max-h-36 overflow-auto border border-white/10">
          {matches.slice(0, 12).map((tag: NewsTag) => (
            <li key={tag.slug}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onAdd(tag.slug);
                  setQuery("");
                }}
                className="flex w-full justify-between px-3 py-2 text-left text-xs text-white/70 hover:bg-white/5"
              >
                <span>{tag.labelZh}</span>
                <span className="text-white/35">{tag.labelEn}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function NewsAdminWorkspace({
  client,
  canEdit,
  canDelete,
  onMessage,
}: {
  client: SupabaseClient<Database>;
  canEdit: boolean;
  canDelete: boolean;
  onMessage: (text: string) => void;
}) {
  const queryClient = useQueryClient();
  const [news, setNews] = useState<NewsRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | NewsStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<NewsCategorySlug | "all">("all");
  const [search, setSearch] = useState("");
  const [newsTitleZh, setNewsTitleZh] = useState("");
  const [newsTitleEn, setNewsTitleEn] = useState("");
  const [newsExcerptZh, setNewsExcerptZh] = useState("");
  const [newsExcerptEn, setNewsExcerptEn] = useState("");
  const [newsSlug, setNewsSlug] = useState("");
  const [newsDate, setNewsDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newsCoverFile, setNewsCoverFile] = useState<File | null>(null);
  const [newsCoverPreview, setNewsCoverPreview] = useState("");
  const [newsBodyBlocks, setNewsBodyBlocks] = useState<NewsBodyBlock[]>([
    { type: "heading", content: "", level: 2 },
    { type: "text", content: "" },
  ]);
  const [newsSelectedTags, setNewsSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState<NewsCategorySlug | "">("");
  const titleManualEnRef = useRef(false);
  const excerptManualEnRef = useRef(false);

  const load = useCallback(async () => {
    const { data, error } = await client
      .from("news_posts")
      .select("*")
      .order("date", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) onMessage(error.message);
    setNews(data ?? []);
  }, [client, onMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const contentCorpus = useMemo(() => {
    const bodyText = newsBodyBlocks
      .filter((b) => b.type === "heading" || b.type === "text")
      .map((b) => b.content)
      .join("\n");
    return [newsTitleZh, newsExcerptZh, bodyText].join("\n");
  }, [newsTitleZh, newsExcerptZh, newsBodyBlocks]);

  const refreshSuggestions = useCallback(() => {
    const next = suggestNewsTagsFromContent(contentCorpus, 10).filter(
      (slug) => !newsSelectedTags.includes(slug),
    );
    setSuggestedTags(next);
    return next;
  }, [contentCorpus, newsSelectedTags]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshSuggestions();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [refreshSuggestions]);

  useEffect(() => {
    if (titleManualEnRef.current || !newsTitleZh.trim()) return;
    const timer = window.setTimeout(() => {
      void englishFromChinese(newsTitleZh, "").then((t) => {
        if (!titleManualEnRef.current && t) setNewsTitleEn(t);
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [newsTitleZh]);

  useEffect(() => {
    if (excerptManualEnRef.current || !newsExcerptZh.trim()) return;
    const timer = window.setTimeout(() => {
      void englishFromChinese(newsExcerptZh, "").then((t) => {
        if (!excerptManualEnRef.current && t) setNewsExcerptEn(t);
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [newsExcerptZh]);

  const resetForm = () => {
    setEditingNewsId(null);
    setNewsTitleZh("");
    setNewsTitleEn("");
    setNewsExcerptZh("");
    setNewsExcerptEn("");
    setNewsSlug("");
    setNewsDate(new Date().toISOString().slice(0, 10));
    setNewsCoverPreview("");
    setNewsCoverFile(null);
    setNewsBodyBlocks([
      { type: "heading", content: "", level: 2 },
      { type: "text", content: "" },
    ]);
    setNewsSelectedTags([]);
    setPrimaryCategory("");
    setSuggestedTags([]);
    titleManualEnRef.current = false;
    excerptManualEnRef.current = false;
  };

  const startEdit = (row: NewsRow) => {
    setEditingNewsId(row.id);
    setNewsTitleZh(row.title_zh);
    setNewsTitleEn(row.title_en);
    setNewsExcerptZh(row.excerpt_zh);
    setNewsExcerptEn(row.excerpt_en);
    setNewsSlug(row.slug);
    setNewsDate(row.date);
    setNewsCoverPreview(row.cover_url ?? "");
    setNewsCoverFile(null);
    const raw = row as unknown as Record<string, unknown>;
    const rawBlocks = raw["body_blocks"];
    const blocks =
      Array.isArray(rawBlocks) && rawBlocks.length > 0
        ? (rawBlocks as NewsBodyBlock[])
        : row.body_zh.map((p) => ({ type: "text" as const, content: p }));
    setNewsBodyBlocks(blocks.length ? blocks : [{ type: "text", content: "" }]);
    setNewsSelectedTags(row.tags);
    setPrimaryCategory(primaryCategoryFromTags(row.tags) ?? "");
    titleManualEnRef.current = true;
    excerptManualEnRef.current = true;
  };

  const uploadNewsImage = async (file: File): Promise<string | null> => {
    const id = editingNewsId ?? `draft-${Date.now()}`;
    const path = `news/${id}/${Date.now()}-${file.name}`;
    const { error } = await client.storage.from("model-media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      onMessage(`圖片上傳失敗：${error.message}`);
      return null;
    }
    return client.storage.from("model-media").getPublicUrl(path).data.publicUrl;
  };

  const applyAutoTags = () => {
    const next = refreshSuggestions();
    if (!next.length) {
      onMessage("找不到可對應的 SEO 標籤，請再補標題或內文關鍵字。");
      return;
    }
    setNewsSelectedTags((prev) => {
      const merged = [...prev];
      for (const slug of next) {
        if (!merged.includes(slug)) merged.push(slug);
      }
      return merged.slice(0, 12);
    });
    if (!primaryCategory) {
      const cat = next.find((slug) => NEWS_CATEGORIES.some((c) => c.slug === slug)) as
        NewsCategorySlug | undefined;
      if (cat) setPrimaryCategory(cat);
    }
    onMessage(`已自動套用 ${Math.min(next.length, 8)} 個 SEO 標籤。`);
  };

  const saveNews = async (nextStatus: NewsStatus) => {
    if (!canEdit) return;
    if (!newsSlug.trim() || !newsTitleZh.trim()) {
      onMessage("請先填寫 slug 與中文標題。");
      return;
    }
    setBusy(true);
    onMessage("");

    let coverUrl = newsCoverPreview;
    if (newsCoverFile) {
      const uploaded = await uploadNewsImage(newsCoverFile);
      if (!uploaded) {
        setBusy(false);
        return;
      }
      coverUrl = uploaded;
    }

    const tags = [...newsSelectedTags];
    if (primaryCategory && !tags.includes(primaryCategory)) tags.unshift(primaryCategory);

    const bodyZh = newsBodyBlocks
      .filter((b) => (b.type === "text" || b.type === "heading") && b.content.trim())
      .map((b) => b.content.trim());

    const bodyEnParts: string[] = [];
    for (const block of newsBodyBlocks) {
      if ((block.type === "text" || block.type === "heading") && block.content.trim()) {
        const en = await englishFromChinese(block.content.trim(), "");
        bodyEnParts.push(en || block.content.trim());
      }
    }

    const editing = news.find((row) => row.id === editingNewsId) ?? null;
    const payload = {
      slug: newsSlug.trim(),
      date: newsDate,
      title_en: newsTitleEn.trim() || (await englishFromChinese(newsTitleZh, "")),
      title_zh: newsTitleZh.trim(),
      excerpt_en: newsExcerptEn.trim() || (await englishFromChinese(newsExcerptZh, "")),
      excerpt_zh: newsExcerptZh.trim(),
      body_en: bodyEnParts,
      body_zh: bodyZh,
      body_blocks: newsBodyBlocks as unknown as never,
      cover_url: coverUrl || null,
      tags,
      status: nextStatus,
      published_at:
        nextStatus === "published"
          ? (editing?.published_at ?? new Date().toISOString())
          : (editing?.published_at ?? null),
    };

    if (editingNewsId) {
      const { error } = await client.from("news_posts").update(payload).eq("id", editingNewsId);
      setBusy(false);
      if (error) {
        onMessage(error.message);
        return;
      }
      onMessage(
        nextStatus === "published"
          ? "已發布到前台。"
          : nextStatus === "archived"
            ? "已封存。"
            : "草稿已儲存。",
      );
    } else {
      const { data, error } = await client.from("news_posts").insert(payload).select("id").single();
      setBusy(false);
      if (error) {
        onMessage(error.message);
        return;
      }
      if (data?.id) setEditingNewsId(data.id);
      onMessage(
        nextStatus === "published"
          ? "已新建並發布。"
          : nextStatus === "archived"
            ? "已新建並封存。"
            : "草稿已建立。",
      );
    }

    setNewsCoverFile(null);
    await invalidateNewsQueries(queryClient);
    await load();
  };

  const deleteNews = async (id: string) => {
    if (!canDelete) return;
    const { error } = await client.from("news_posts").delete().eq("id", id);
    if (error) onMessage(error.message);
    else {
      if (editingNewsId === id) resetForm();
      onMessage("已刪除新聞。");
      await load();
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return news.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (categoryFilter !== "all" && !row.tags.includes(categoryFilter)) return false;
      if (!q) return true;
      return (
        row.title_zh.toLowerCase().includes(q) ||
        row.title_en.toLowerCase().includes(q) ||
        row.slug.toLowerCase().includes(q)
      );
    });
  }, [news, statusFilter, categoryFilter, search]);

  const timelineGroups = useMemo(() => {
    const map = new Map<string, NewsRow[]>();
    for (const row of filtered) {
      const key = monthKey(row.date);
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const counts = useMemo(
    () => ({
      all: news.length,
      draft: news.filter((r) => r.status === "draft").length,
      published: news.filter((r) => r.status === "published").length,
      archived: news.filter((r) => r.status === "archived").length,
    }),
    [news],
  );

  const inputClass =
    "mt-2 w-full border border-white/15 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-white/50";

  return (
    <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.35fr)]">
      <aside className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-light">時間軸</h3>
          <button
            type="button"
            onClick={resetForm}
            className="border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
          >
            + 新建
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", `全部 ${counts.all}`],
              ["draft", `草稿 ${counts.draft}`],
              ["published", `已發布 ${counts.published}`],
              ["archived", `封存 ${counts.archived}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-full px-3 py-1 text-xs ${
                statusFilter === value
                  ? "bg-white text-slate-950"
                  : "border border-white/20 text-white/65"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs text-white/40">類別（輔）</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full px-2.5 py-1 text-xs ${
                categoryFilter === "all"
                  ? "bg-white/15 text-white"
                  : "border border-white/15 text-white/55"
              }`}
            >
              全部類別
            </button>
            {NEWS_CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setCategoryFilter(category.slug)}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  categoryFilter === category.slug
                    ? "bg-white/15 text-white"
                    : "border border-white/15 text-white/55"
                }`}
              >
                {category.labelZh}
              </button>
            ))}
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋標題或 slug…"
          className="w-full border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-white/50"
        />

        <div className="max-h-[70vh] space-y-6 overflow-auto border border-white/10 p-3">
          {timelineGroups.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">這個篩選下沒有文章</p>
          ) : (
            timelineGroups.map(([key, rows]) => (
              <section key={key}>
                <div className="sticky top-0 z-10 mb-2 bg-slate-950/95 py-1 text-xs tracking-wide text-white/45">
                  {monthLabel(key)} · {rows.length}
                </div>
                <ul className="space-y-2 border-l border-white/15 pl-3">
                  {rows.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className={`w-full rounded border px-3 py-2 text-left transition ${
                          editingNewsId === row.id
                            ? "border-white/40 bg-white/10"
                            : "border-white/10 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-sm font-normal text-white">
                            {row.title_zh || row.title_en}
                          </strong>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${statusClass(row.status)}`}
                          >
                            {statusLabel(row.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-white/40">
                          {row.date} · /{row.slug}
                        </p>
                        {row.tags[0] ? (
                          <p className="mt-1 text-[11px] text-white/35">
                            {NEWS_TAGS.find((t) => t.slug === row.tags[0])?.labelZh ?? row.tags[0]}
                          </p>
                        ) : null}
                      </button>
                      <div className="mt-1 flex gap-3 pl-1">
                        <button
                          type="button"
                          disabled={!canDelete || busy}
                          onClick={() => void deleteNews(row.id)}
                          className="text-[11px] text-red-200/70 underline disabled:opacity-40"
                        >
                          刪除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-xl font-light">{editingNewsId ? "編輯文章" : "新建文章"}</h3>
          <p className="text-xs text-white/40">先存草稿 → 確認預覽 → 再發布到前台</p>
        </div>

        <label className="block text-sm text-white/65">
          日期（時間軸排序）
          <input
            type="date"
            value={newsDate}
            onChange={(e) => setNewsDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-white/65">
          Slug（網址路徑）
          <input
            value={newsSlug}
            onChange={(e) => setNewsSlug(e.target.value)}
            className={inputClass}
            placeholder="spring-board-update"
          />
        </label>
        <label className="block text-sm text-white/65">
          標題（中文）
          <input
            value={newsTitleZh}
            onChange={(e) => {
              titleManualEnRef.current = false;
              setNewsTitleZh(e.target.value);
            }}
            className={inputClass}
            placeholder="例如：層次穿搭指南"
          />
        </label>
        <label className="block text-sm text-white/65">
          Title (English)
          <input
            value={newsTitleEn}
            onChange={(e) => {
              titleManualEnRef.current = true;
              setNewsTitleEn(e.target.value);
            }}
            className={inputClass}
            placeholder="Auto-translated from Chinese"
          />
        </label>
        <label className="block text-sm text-white/65">
          摘要（中文）
          <input
            value={newsExcerptZh}
            onChange={(e) => {
              excerptManualEnRef.current = false;
              setNewsExcerptZh(e.target.value);
            }}
            className={inputClass}
            placeholder="簡短摘要…"
          />
        </label>
        <label className="block text-sm text-white/65">
          Excerpt (English)
          <input
            value={newsExcerptEn}
            onChange={(e) => {
              excerptManualEnRef.current = true;
              setNewsExcerptEn(e.target.value);
            }}
            className={inputClass}
            placeholder="Auto-translated from Chinese"
          />
        </label>

        <div>
          <p className="text-sm text-white/65">主類別（輔）</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {NEWS_CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                disabled={!canEdit}
                onClick={() => {
                  setPrimaryCategory(category.slug);
                  setNewsSelectedTags((prev) =>
                    prev.includes(category.slug) ? prev : [category.slug, ...prev],
                  );
                }}
                className={`rounded-full px-3 py-1 text-xs ${
                  primaryCategory === category.slug
                    ? "bg-white text-slate-950"
                    : "border border-white/20 text-white/65"
                }`}
              >
                {category.labelZh}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-white/65">封面圖片</p>
          {(newsCoverPreview || newsCoverFile) && (
            <img
              src={newsCoverFile ? URL.createObjectURL(newsCoverFile) : newsCoverPreview}
              alt="cover preview"
              className="mt-2 max-h-40 w-full rounded object-cover"
            />
          )}
          <label className="mt-2 inline-block cursor-pointer border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
            {newsCoverPreview || newsCoverFile ? "更換封面" : "選擇封面"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={!canEdit}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setNewsCoverFile(file);
                if (file) setNewsCoverPreview("");
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <NewsBlockEditor
          blocks={newsBodyBlocks}
          onChange={setNewsBodyBlocks}
          onUploadImage={uploadNewsImage}
          disabled={!canEdit}
        />

        <NewsTagChips
          selectedTags={newsSelectedTags}
          suggested={suggestedTags}
          disabled={!canEdit}
          onAdd={(slug) =>
            setNewsSelectedTags((prev) => (prev.includes(slug) ? prev : [...prev, slug]))
          }
          onRemove={(slug) => setNewsSelectedTags((prev) => prev.filter((s) => s !== slug))}
          onAutoSuggest={applyAutoTags}
        />

        <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-white/10 bg-slate-950/95 py-4">
          <button
            type="button"
            disabled={!canEdit || busy}
            onClick={() => void saveNews("draft")}
            className="label-xs border border-white/25 px-5 py-3 text-white disabled:opacity-50"
          >
            {busy ? "儲存中…" : "存成草稿"}
          </button>
          <button
            type="button"
            disabled={!canEdit || busy}
            onClick={() => void saveNews("published")}
            className="label-xs bg-white px-5 py-3 text-slate-950 disabled:opacity-50"
          >
            {busy ? "儲存中…" : "發布到前台"}
          </button>
          <button
            type="button"
            disabled={!canEdit || busy || !editingNewsId}
            onClick={() => void saveNews("archived")}
            className="label-xs border border-white/15 px-5 py-3 text-white/70 disabled:opacity-50"
          >
            封存
          </button>
          {editingNewsId ? (
            <button
              type="button"
              disabled={busy}
              onClick={resetForm}
              className="label-xs px-5 py-3 text-white/50 underline disabled:opacity-50"
            >
              取消編輯
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
