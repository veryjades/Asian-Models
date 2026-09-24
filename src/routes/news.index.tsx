import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { contentRepository } from "@/lib/content/repository";
import { useI18n } from "@/lib/i18n";
import { AgencyImage } from "@/components/site/AgencyImage";
import { agencySlotProps, PUBLIC_MEDIA_SLOTS } from "@/lib/content/mediaSlots";
import { NEWS_CATEGORIES, NEWS_TAGS } from "@/lib/content/newsTags";

const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: () => contentRepository.listNews(),
});

export const Route = createFileRoute("/news/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tag: typeof search["tag"] === "string" ? (search["tag"] as string) : undefined,
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      ...newsQuery,
      revalidateIfStale: true,
    }),
  head: () => ({
    meta: [
      { title: "News — J&J Model Agency" },
      {
        name: "description",
        content:
          "Board updates, showrooms and notes on scouting from J&J Model Agency across Taipei, Tokyo, Seoul and Singapore.",
      },
      { property: "og:title", content: "News — J&J Model Agency" },
      {
        property: "og:description",
        content: "Board updates, showrooms and notes on scouting from J&J Model Agency.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsIndex,
  errorComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">News didn't load.</p>
  ),
  notFoundComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">Not found.</p>
  ),
});

function tagLabel(slug: string, lang: string) {
  const hit =
    NEWS_TAGS.find((t) => t.slug === slug) ?? NEWS_CATEGORIES.find((t) => t.slug === slug);
  if (!hit) return slug;
  return lang === "zh" ? hit.labelZh : hit.labelEn;
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string, lang: string) {
  const [y, m] = key.split("-");
  if (lang === "zh") return `${y} 年 ${Number(m)} 月`;
  const date = new Date(`${key}-01T00:00:00`);
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "long" });
}

function NewsIndex() {
  const { data } = useSuspenseQuery(newsQuery);
  const { tag } = useSearch({ from: "/news/" });
  const { pick, t, lang } = useI18n();

  const activeCategories = useMemo(() => {
    const present = new Set(data.flatMap((post) => post.tags));
    return NEWS_CATEGORIES.filter((category) => present.has(category.slug));
  }, [data]);

  const filtered = tag
    ? data.filter((p) => p.tags.some((value) => value.toLowerCase() === tag.toLowerCase()))
    : data;

  const timeline = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const post of filtered) {
      const key = monthKey(post.date);
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-10">
      <h1 className="text-3xl font-light md:text-4xl">{t("news.title")}</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {lang === "zh"
          ? "依時間閱讀最新動態；可用類別快速篩選。"
          : "Browse stories by timeline, then refine by category."}
      </p>

      {(activeCategories.length > 0 || tag) && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/news"
            search={{ tag: undefined }}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              !tag
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang === "zh" ? "全部" : "All"}
          </Link>
          {activeCategories.map((category) => (
            <Link
              key={category.slug}
              to="/news"
              search={{ tag: category.slug }}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                tag === category.slug
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "zh" ? category.labelZh : category.labelEn}
            </Link>
          ))}
        </div>
      )}

      {tag && !activeCategories.some((c) => c.slug === tag) && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {lang === "zh" ? "篩選標籤" : "Filtered by"}: <strong>{tagLabel(tag, lang)}</strong>
          </span>
          <Link
            to="/news"
            search={{ tag: undefined }}
            className="text-xs underline hover:text-foreground"
          >
            {lang === "zh" ? "清除" : "Clear"}
          </Link>
        </div>
      )}

      <div className="gradient-accent mt-6 h-1 w-24" aria-hidden="true" />

      <div className="mt-10 space-y-14">
        {timeline.map(([key, posts]) => (
          <section key={key}>
            <h2 className="label-xs text-muted-foreground">{monthLabel(key, lang)}</h2>
            <ul className="mt-6 grid gap-12 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    to="/news/$slug"
                    params={{ slug: post.slug }}
                    className="portrait-hover group block"
                  >
                    <AgencyImage
                      src={post.cover}
                      alt={pick(post.titleEn, post.titleZh)}
                      loading="lazy"
                      {...agencySlotProps(PUBLIC_MEDIA_SLOTS.newsCover)}
                    />
                    <p className="label-xs mt-4 text-muted-foreground">
                      {new Date(post.date).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="mt-2 text-xl font-light">{pick(post.titleEn, post.titleZh)}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pick(post.excerptEn, post.excerptZh)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {lang === "zh" ? "此篩選暫無新聞" : "No news found for this filter."}
        </p>
      )}
    </div>
  );
}
