import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { useI18n } from "@/lib/i18n";
import { AgencyImage } from "@/components/site/AgencyImage";
import { agencySlotProps, PUBLIC_MEDIA_SLOTS } from "@/lib/content/mediaSlots";

const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: () => contentRepository.listNews(),
});

export const Route = createFileRoute("/news/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tag: typeof search.tag === "string" ? search.tag : undefined,
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

function NewsIndex() {
  const { data } = useSuspenseQuery(newsQuery);
  const { tag } = useSearch({ from: "/news/" });
  const { pick, t, lang } = useI18n();

  const filtered = tag
    ? data.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
    : data;

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-10">
      <h1 className="text-3xl font-light md:text-4xl">{t("news.title")}</h1>
      {tag && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {lang === "zh" ? "篩選標籤" : "Filtered by"}: <strong>{tag}</strong>
          </span>
          <Link to="/news" search={{}} className="text-xs underline hover:text-foreground">
            {lang === "zh" ? "清除" : "Clear"}
          </Link>
        </div>
      )}
      <div className="gradient-accent mt-6 h-1 w-24" aria-hidden="true" />
      <ul className="mt-10 grid gap-12 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((post) => (
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
              <h2 className="mt-2 text-xl font-light">{pick(post.titleEn, post.titleZh)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {pick(post.excerptEn, post.excerptZh)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {lang === "zh" ? "此標籤暫無新聞" : "No news found for this tag."}
        </p>
      )}
    </div>
  );
}
