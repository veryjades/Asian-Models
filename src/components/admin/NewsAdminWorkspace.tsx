import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import { NewsBlockEditor, serializeNewsBodyBlocks } from "@/components/admin/NewsBlockEditor";
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
import {
  DEFAULT_NEWS_COVER_POSITION,
  formatObjectPosition,
  parseObjectPosition,
  readCoverFocal,
  withCoverFocalParam,
} from "@/lib/content/newsCoverFocal";
import type { Database } from "@/lib/supabase/database.types";

type NewsRow = Database["public"]["Tables"]["news_posts"]["Row"];
type NewsStatus = "draft" | "published" | "archived";
type NewsWritePayload = Database["public"]["Tables"]["news_posts"]["Insert"];

/** Live DB may not have cover_object_position yet — remember after first schema miss. */
let coverObjectPositionColumnOk: boolean | null = null;

function isMissingCoverObjectPositionColumn(message: string): boolean {
  return /cover_object_position|schema cache|Could not find the .* column/i.test(message);
}

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

function extFromMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function safeNewsImagePath(folderId: string, file: File): string {
  const ext = extFromMime(file.type);
  return `news/${folderId}/img-${Date.now()}.${ext}`;
}

type FormSnapshot = {
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  slug: string;
  date: string;
  coverUrl: string;
  coverFileKey: string;
  coverObjectPosition: string;
  blocks: NewsBodyBlock[];
  tags: string[];
  category: string;
};

function buildFormSnapshot(input: FormSnapshot): string {
  return JSON.stringify(input);
}

function readCoverObjectPosition(row: NewsRow): string {
  const raw = row as unknown as Record<string, unknown>;
  const column = raw["cover_object_position"];
  if (typeof column === "string" && column.trim()) return column.trim();
  return readCoverFocal(row.cover_url ?? "").objectPosition;
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
  const [saveProgress, setSaveProgress] = useState(0);
  const [savePhase, setSavePhase] = useState("");
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<NewsStatus | null>(null);
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
  const [newsCoverBlobUrl, setNewsCoverBlobUrl] = useState("");
  const [coverObjectPosition, setCoverObjectPosition] = useState(DEFAULT_NEWS_COVER_POSITION);
  const [newsBodyBlocks, setNewsBodyBlocks] = useState<NewsBodyBlock[]>([]);
  const [newsSelectedTags, setNewsSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState<NewsCategorySlug | "">("");
  const titleManualEnRef = useRef(false);
  const excerptManualEnRef = useRef(false);
  const coverFrameRef = useRef<HTMLButtonElement>(null);

  // Never call createObjectURL during render — it recreates blobs on every
  // suggestion/translation re-render and freezes the Admin tab on large covers.
  useEffect(() => {
    if (!newsCoverFile) {
      setNewsCoverBlobUrl("");
      return;
    }
    const url = URL.createObjectURL(newsCoverFile);
    setNewsCoverBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newsCoverFile]);

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

  const currentSnapshot = useMemo(
    () =>
      buildFormSnapshot({
        titleZh: newsTitleZh,
        titleEn: newsTitleEn,
        excerptZh: newsExcerptZh,
        excerptEn: newsExcerptEn,
        slug: newsSlug,
        date: newsDate,
        coverUrl: newsCoverPreview,
        coverFileKey: newsCoverFile
          ? `${newsCoverFile.name}:${newsCoverFile.size}:${newsCoverFile.lastModified}`
          : "",
        coverObjectPosition,
        blocks: newsBodyBlocks,
        tags: newsSelectedTags,
        category: primaryCategory,
      }),
    [
      newsTitleZh,
      newsTitleEn,
      newsExcerptZh,
      newsExcerptEn,
      newsSlug,
      newsDate,
      newsCoverPreview,
      newsCoverFile,
      coverObjectPosition,
      newsBodyBlocks,
      newsSelectedTags,
      primaryCategory,
    ],
  );

  // New unsaved form is always dirty; after load/save, compare snapshots.
  const isDirty = savedSnapshot === null || currentSnapshot !== savedSnapshot;
  const draftClean = !isDirty && savedStatus === "draft";
  const publishClean = !isDirty && savedStatus === "published";

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
    setCoverObjectPosition(DEFAULT_NEWS_COVER_POSITION);
    setNewsBodyBlocks([]);
    setNewsSelectedTags([]);
    setPrimaryCategory("");
    setSuggestedTags([]);
    setSavedSnapshot(null);
    setSavedStatus(null);
    setSaveProgress(0);
    setSavePhase("");
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
    const position = readCoverObjectPosition(row);
    setCoverObjectPosition(position);
    const raw = row as unknown as Record<string, unknown>;
    const rawBlocks = raw["body_blocks"];
    const blocks =
      Array.isArray(rawBlocks) && rawBlocks.length > 0
        ? (rawBlocks as NewsBodyBlock[])
        : row.body_zh.map((p) => ({ type: "text" as const, content: p }));
    const nextBlocks = blocks.length ? blocks : [];
    setNewsBodyBlocks(nextBlocks);
    setNewsSelectedTags(row.tags);
    const category = primaryCategoryFromTags(row.tags) ?? "";
    setPrimaryCategory(category);
    titleManualEnRef.current = true;
    excerptManualEnRef.current = true;
    setSavedStatus(row.status as NewsStatus);
    setSavedSnapshot(
      buildFormSnapshot({
        titleZh: row.title_zh,
        titleEn: row.title_en,
        excerptZh: row.excerpt_zh,
        excerptEn: row.excerpt_en,
        slug: row.slug,
        date: row.date,
        coverUrl: row.cover_url ?? "",
        coverFileKey: "",
        coverObjectPosition: position,
        blocks: nextBlocks,
        tags: row.tags,
        category,
      }),
    );
    setSaveProgress(0);
    setSavePhase("");
  };

  const uploadNewsImage = async (file: File): Promise<string | null> => {
    const id = editingNewsId ?? `draft-${Date.now()}`;
    const path = safeNewsImagePath(id, file);
    const { error } = await client.storage.from("model-media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      onMessage(`圖片上傳失敗：${error.message}`);
      return null;
    }
    const publicUrl = client.storage.from("model-media").getPublicUrl(path).data.publicUrl;
    if (!publicUrl || publicUrl.startsWith("blob:")) {
      onMessage("圖片公開網址無效，請重試上傳。");
      return null;
    }
    return publicUrl;
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

  const generateEnglish = async () => {
    if (!canEdit || busy) return;
    if (!newsTitleZh.trim() && !newsExcerptZh.trim()) {
      onMessage("請先填寫中文標題或摘要。");
      return;
    }
    setBusy(true);
    setSavePhase("產生英文…");
    setSaveProgress(15);
    onMessage("");
    try {
      const titleEn = await englishFromChinese(newsTitleZh, "");
      setSaveProgress(40);
      const excerptEn = await englishFromChinese(newsExcerptZh, "");
      setSaveProgress(70);
      if (titleEn) {
        titleManualEnRef.current = true;
        setNewsTitleEn(titleEn);
      }
      if (excerptEn) {
        excerptManualEnRef.current = true;
        setNewsExcerptEn(excerptEn);
      }
      setSaveProgress(100);
      if (!titleEn && !excerptEn) {
        onMessage("英文未產出，請手動填 Title/Excerpt 或稍後再試。");
      } else {
        onMessage("已產生英文標題／摘要。內文英文會在存檔時一併翻譯。");
      }
    } finally {
      setBusy(false);
      window.setTimeout(() => {
        setSaveProgress(0);
        setSavePhase("");
      }, 800);
    }
  };

  const setCoverFocusFromClick = (clientX: number, clientY: number) => {
    const el = coverFrameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setCoverObjectPosition(formatObjectPosition(x, y));
  };

  const saveNews = async (nextStatus: NewsStatus) => {
    if (!canEdit) return;
    if (!newsSlug.trim() || !newsTitleZh.trim()) {
      onMessage("請先填寫 slug 與中文標題。");
      return;
    }
    setBusy(true);
    setSaveProgress(8);
    setSavePhase("驗證欄位…");
    onMessage("");

    try {
      setSaveProgress(20);
      setSavePhase("上傳封面…");
      let coverUrl = newsCoverPreview;
      if (newsCoverFile) {
        const uploaded = await uploadNewsImage(newsCoverFile);
        if (!uploaded) {
          setBusy(false);
          setSaveProgress(0);
          setSavePhase("");
          return;
        }
        coverUrl = uploaded;
      }
      if (coverUrl.startsWith("blob:")) {
        onMessage("封面網址無效，請重新選擇封面後再存。");
        setBusy(false);
        setSaveProgress(0);
        setSavePhase("");
        return;
      }

      setSaveProgress(45);
      setSavePhase("組裝內容與翻譯…");
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
      const titleEn = newsTitleEn.trim() || (await englishFromChinese(newsTitleZh, ""));
      const excerptEn = newsExcerptEn.trim() || (await englishFromChinese(newsExcerptZh, ""));
      const serializedBlocks = serializeNewsBodyBlocks(newsBodyBlocks);
      const coverWithFocal = coverUrl ? withCoverFocalParam(coverUrl, coverObjectPosition) : "";
      // Focal is always durable on cover_url (?fp=X-Y). The DB column is optional
      // until supabase/migrations/20260924160000_news_cover_object_position.sql is applied.
      const basePayload: NewsWritePayload = {
        slug: newsSlug.trim(),
        date: newsDate,
        title_en: titleEn,
        title_zh: newsTitleZh.trim(),
        excerpt_en: excerptEn,
        excerpt_zh: newsExcerptZh.trim(),
        body_en: bodyEnParts,
        body_zh: bodyZh,
        body_blocks: serializedBlocks as unknown as never,
        cover_url: coverWithFocal || null,
        tags,
        status: nextStatus,
        published_at:
          nextStatus === "published"
            ? (editing?.published_at ?? new Date().toISOString())
            : (editing?.published_at ?? null),
      };

      setSaveProgress(75);
      setSavePhase("寫入資料庫…");

      const writePayload = async (body: NewsWritePayload) => {
        if (editingNewsId) {
          return client.from("news_posts").update(body).eq("id", editingNewsId);
        }
        return client.from("news_posts").insert(body).select("id").single();
      };

      const withFocalColumn: NewsWritePayload = {
        ...basePayload,
        cover_object_position: coverObjectPosition,
      };

      let writeResult =
        coverObjectPositionColumnOk === false
          ? await writePayload(basePayload)
          : await writePayload(withFocalColumn);

      if (
        writeResult.error &&
        coverObjectPositionColumnOk !== false &&
        isMissingCoverObjectPositionColumn(writeResult.error.message)
      ) {
        coverObjectPositionColumnOk = false;
        writeResult = await writePayload(basePayload);
      } else if (!writeResult.error && coverObjectPositionColumnOk !== false) {
        coverObjectPositionColumnOk = true;
      }

      if (writeResult.error) {
        // Never surface the missing-column schema-cache noise; only real failures.
        onMessage(
          isMissingCoverObjectPositionColumn(writeResult.error.message)
            ? "儲存失敗：焦點欄位尚未建立，且寫入封面網址時也失敗。請再試一次。"
            : writeResult.error.message,
        );
        setBusy(false);
        setSaveProgress(0);
        setSavePhase("");
        return;
      }

      if (!editingNewsId) {
        const inserted = writeResult.data as { id?: string } | null;
        if (inserted?.id) setEditingNewsId(inserted.id);
      }

      // Prevent auto-translate effects from dirtying the form right after save.
      titleManualEnRef.current = true;
      excerptManualEnRef.current = true;
      setNewsCoverFile(null);
      setNewsCoverPreview(coverWithFocal || "");
      setNewsTitleEn(basePayload.title_en);
      setNewsExcerptEn(basePayload.excerpt_en ?? "");
      setNewsBodyBlocks(serializedBlocks);
      setSavedStatus(nextStatus);
      setSavedSnapshot(
        buildFormSnapshot({
          titleZh: basePayload.title_zh,
          titleEn: basePayload.title_en,
          excerptZh: basePayload.excerpt_zh ?? "",
          excerptEn: basePayload.excerpt_en ?? "",
          slug: basePayload.slug,
          date: basePayload.date ?? newsDate,
          coverUrl: coverWithFocal || "",
          coverFileKey: "",
          coverObjectPosition,
          blocks: serializedBlocks,
          tags,
          category: primaryCategory,
        }),
      );

      setSaveProgress(100);
      setSavePhase("完成");
      const enMissing =
        !basePayload.title_en.trim() ||
        Boolean((basePayload.excerpt_zh ?? "").trim() && !(basePayload.excerpt_en ?? "").trim());
      if (enMissing) {
        onMessage("已儲存，但英文未產出，請按「產生英文」或手動填 Title/Excerpt 後再存一次。");
      } else {
        onMessage(
          nextStatus === "published"
            ? "已前台發布"
            : nextStatus === "archived"
              ? "已封存。"
              : "草稿已存",
        );
      }

      await invalidateNewsQueries(queryClient);
      await load();
    } finally {
      setBusy(false);
      window.setTimeout(() => {
        setSaveProgress(0);
        setSavePhase("");
      }, 1200);
    }
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
        <button
          type="button"
          disabled={!canEdit || busy}
          onClick={() => void generateEnglish()}
          className="border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
        >
          產生英文
        </button>

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
          <p className="text-sm text-white/65">封面圖片（3:2）</p>
          <p className="mt-1 text-xs text-white/40">
            點預覽設定焦點，避免直圖斷頭。也可拖曳垂直滑桿微調。
          </p>
          {(newsCoverBlobUrl || newsCoverPreview) && (
            <div className="mt-2 space-y-2">
              <button
                type="button"
                ref={coverFrameRef}
                disabled={!canEdit}
                onClick={(e) => setCoverFocusFromClick(e.clientX, e.clientY)}
                className="relative block w-full overflow-hidden border border-white/15 bg-black/40 disabled:opacity-60"
                style={{ aspectRatio: "3 / 2" }}
                aria-label="點選封面焦點"
              >
                <img
                  src={newsCoverBlobUrl || newsCoverPreview}
                  alt="cover preview"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: coverObjectPosition }}
                  draggable={false}
                />
                <span
                  className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                  style={{
                    left: `${parseObjectPosition(coverObjectPosition).x}%`,
                    top: `${parseObjectPosition(coverObjectPosition).y}%`,
                  }}
                />
              </button>
              <label className="flex items-center gap-3 text-xs text-white/55">
                垂直焦點
                <input
                  type="range"
                  min={0}
                  max={100}
                  disabled={!canEdit}
                  value={parseObjectPosition(coverObjectPosition).y}
                  onChange={(e) =>
                    setCoverObjectPosition(
                      formatObjectPosition(
                        parseObjectPosition(coverObjectPosition).x,
                        Number(e.target.value),
                      ),
                    )
                  }
                  className="w-full"
                />
                <span className="w-16 shrink-0 text-right text-white/40">
                  {coverObjectPosition}
                </span>
              </label>
            </div>
          )}
          <label className="mt-2 inline-block cursor-pointer border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
            {newsCoverBlobUrl || newsCoverPreview ? "更換封面" : "選擇封面"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={!canEdit}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setNewsCoverFile(file);
                if (file) {
                  setNewsCoverPreview("");
                  setCoverObjectPosition(DEFAULT_NEWS_COVER_POSITION);
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <NewsBlockEditor
          key={editingNewsId ?? "new-article"}
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

        <div className="sticky bottom-0 space-y-3 border-t border-white/10 bg-slate-950/95 py-4">
          {(busy || saveProgress > 0) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>{savePhase || "處理中…"}</span>
                <span>{Math.min(100, Math.round(saveProgress))}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-white transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.min(100, saveProgress)}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canEdit || busy || draftClean}
              onClick={() => void saveNews("draft")}
              className={`label-xs px-5 py-3 ${
                draftClean
                  ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/35"
                  : "border border-white/25 text-white hover:bg-white/5 disabled:opacity-50"
              }`}
            >
              {busy && savePhase ? "儲存中…" : draftClean ? "草稿已存" : "存成草稿"}
            </button>
            <button
              type="button"
              disabled={!canEdit || busy || publishClean}
              onClick={() => void saveNews("published")}
              className={`label-xs px-5 py-3 ${
                publishClean
                  ? "cursor-not-allowed bg-black text-white/70"
                  : "bg-white text-slate-950 hover:bg-white/90 disabled:opacity-50"
              }`}
            >
              {busy && savePhase ? "儲存中…" : publishClean ? "已前台發布" : "發布到前台"}
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
        </div>
      </section>
    </div>
  );
}
