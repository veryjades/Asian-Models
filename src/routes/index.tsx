import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { AgencyImage } from "@/components/site/AgencyImage";
import { AskAssistant } from "@/components/site/AskAssistant";
import { useI18n } from "@/lib/i18n";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const [featured, news, keywords] = await Promise.all([
      contentRepository.listFeaturedModels(4),
      contentRepository.listNews(3),
      contentRepository.listKeywords({ activeOnly: true, limit: 15 }),
    ]);

    return {
      featured,
      news,
      keywords,
    };
  },
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "J&J Model Agency — Model Management for Asia" },
      {
        name: "description",
        content:
          "A bilingual model management house representing faces across Taipei, Tokyo, Seoul and Singapore for editorial, campaign and runway.",
      },
      { property: "og:title", content: "J&J Model Agency — Model Management for Asia" },
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
      <HeroCarousel />

      <section className="mx-auto max-w-[1600px] px-5 pt-12 md:px-10">
        <h1 className="max-w-3xl text-3xl font-light leading-tight md:text-5xl">
          {t("home.tagline")}
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          {t("home.intro")}
        </p>
      </section>

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
                <div className="relative">
                  <AgencyImage
                    src={model.portrait}
                    alt={model.name}
                    loading="lazy"
                    width={1024}
                    height={1536}
                    aspectRatio="2 / 3"
                    fit="contain"
                  />
                  <div className="gradient-accent-soft pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <p className="label-xs px-3 py-3">{pick(model.name, model.nameZh)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mx-auto max-w-[1600px] px-5 pb-14 md:px-10"
        data-testid="keyword-dynamic-runway"
        aria-label={t("home.keywordRunway")}
      >
        <div className="halftone mb-10 h-14 w-full opacity-40" aria-hidden="true" />
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="label-xs text-muted-foreground">{t("home.keywordRunway")}</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              {t("home.keywordRunwayIntro")}
            </p>
          </div>
          <span className="label-xs text-muted-foreground">{t("home.keywordRunwayDynamic")}</span>
        </div>
        <ul className="mt-6 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {data.keywords.map((keyword) => (
            <li key={keyword.slug} className="bg-background">
              <Link
                to="/keywords/$slug"
                params={{ slug: keyword.slug }}
                data-keyword-tile={keyword.slug}
                className="group relative flex min-h-[9rem] flex-col justify-between overflow-hidden p-4 transition-colors hover:bg-foreground hover:text-background md:min-h-[10rem]"
              >
                <span>
                  <span className="label-xs block text-muted-foreground transition-colors group-hover:text-background/70">
                    {t("home.keywordRunwayMeta")}
                  </span>
                  <span className="mt-4 block text-2xl font-light leading-none md:text-3xl">
                    {pick(keyword.labelEn, keyword.labelZh)}
                  </span>
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground transition-colors group-hover:text-background/70">
                    {pick(keyword.descriptionEn, keyword.descriptionZh)}
                  </span>
                  <span className="label-xs mt-4 inline-flex border-b border-current pb-1">
                    {t("home.keywordRunwayCta")}
                  </span>
                </span>
                <span
                  className="gradient-accent pointer-events-none absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
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
              <Link
                to="/news/$slug"
                params={{ slug: post.slug }}
                className="portrait-hover group block"
              >
                <AgencyImage
                  src={post.cover}
                  alt={pick(post.titleEn, post.titleZh)}
                  loading="lazy"
                  width={768}
                  height={512}
                  aspectRatio="3 / 2"
                  fit="contain"
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

      <AskAssistant />
    </div>
  );
}
