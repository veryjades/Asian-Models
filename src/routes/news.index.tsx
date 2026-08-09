import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { useI18n } from "@/lib/i18n";

const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: () => contentRepository.listNews(),
});

export const Route = createFileRoute("/news/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(newsQuery),
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
  const { pick, t, lang } = useI18n();

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-10">
      <h1 className="text-3xl font-light md:text-4xl">{t("news.title")}</h1>
      <div className="gradient-accent mt-6 h-1 w-24" aria-hidden="true" />
      <ul className="mt-10 grid gap-12 md:grid-cols-2 xl:grid-cols-3">
        {data.map((post) => (
          <li key={post.slug}>
            <Link to="/news/$slug" params={{ slug: post.slug }} className="portrait-hover group block">
              <img
                src={post.cover}
                alt={pick(post.titleEn, post.titleZh)}
                loading="lazy"
                width={768}
                height={1024}
                className="aspect-[4/3] w-full object-cover"
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
    </div>
  );
}
