import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { heroImage } from "@/lib/content/seed";
import { boards } from "@/lib/content/types";
import { useI18n } from "@/lib/i18n";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: async () => ({
    featured: await contentRepository.listFeaturedModels(4),
    news: await contentRepository.listNews(3),
  }),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "Asian Stars Agency — Model Management for Asia" },
      {
        name: "description",
        content:
          "A bilingual model management house representing faces across Taipei, Tokyo, Seoul and Singapore for editorial, campaign and runway.",
      },
      { property: "og:title", content: "Asian Stars Agency — Model Management for Asia" },
      {
        property: "og:description",
        content:
          "Representing faces across Taipei, Tokyo, Seoul and Singapore for editorial, campaign and runway.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQuery);
  const { t, pick, lang } = useI18n();

  return (
    <div>
      <section className="relative">
        <img
          src={heroImage}
          alt="Two models in muted blue-grey coats in a bright minimal room"
          width={1920}
          height={1024}
          className="h-[62vh] w-full object-cover md:h-[78vh]"
        />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 md:px-10 md:pb-12">
          <h1 className="max-w-3xl text-3xl font-light leading-tight text-foreground md:text-5xl">
            {t("home.tagline")}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            {t("home.intro")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10">
        <h2 className="label-xs text-muted-foreground">{t("home.boards")}</h2>
        <ul className="mt-6 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {boards.map((board) => (
            <li key={board.id} className="bg-background">
              <Link
                to="/models/$board"
                params={{ board: board.id }}
                className="group flex h-28 items-end p-4 transition-colors md:h-36"
              >
                <span className="relative z-10">
                  <span className="block text-xl font-light md:text-2xl">
                    {pick(board.labelEn, board.labelZh)}
                  </span>
                  <span className="label-xs mt-2 block text-muted-foreground group-hover:text-foreground">
                    {t("home.viewBoard")}
                  </span>
                </span>
                <span className="gradient-accent pointer-events-none absolute inset-x-0 bottom-0 h-0.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="halftone h-20 w-full opacity-50" aria-hidden="true" />

      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10">
        <h2 className="label-xs text-muted-foreground">{t("home.featured")}</h2>
        <ul className="mt-6 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {data.featured.map((model) => (
            <li key={model.slug} className="bg-background">
              <Link
                to="/models/$board/$slug"
                params={{ board: model.board, slug: model.slug }}
                className="portrait-hover group block"
              >
                <div className="relative overflow-hidden bg-muted">
                  <img
                    src={model.portrait}
                    alt={model.name}
                    loading="lazy"
                    width={768}
                    height={1024}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <div className="gradient-accent-soft pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <p className="label-xs px-3 py-3">{pick(model.name, model.nameZh)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-6 md:px-10">
        <h2 className="label-xs text-muted-foreground">{t("home.latest")}</h2>
        <ul className="mt-6 grid gap-10 md:grid-cols-3">
          {data.news.map((post) => (
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
                <h3 className="mt-2 text-lg font-light">{pick(post.titleEn, post.titleZh)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pick(post.excerptEn, post.excerptZh)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
