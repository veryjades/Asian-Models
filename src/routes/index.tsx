import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { contentRepository } from "@/lib/content/repository";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { AgencyImage } from "@/components/site/AgencyImage";
import { ModelCard } from "@/components/site/ModelGrid";
import { AskAssistant } from "@/components/site/AskAssistant";
import { useI18n } from "@/lib/i18n";
import type { Keyword } from "@/lib/content/types";

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

      <KeywordDynamicRunway keywords={data.keywords} />

      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-10">
        <h2 className="label-xs text-muted-foreground">{t("home.featured")}</h2>
        <ul className="mt-6 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {data.featured.map((model) => (
            <ModelCard key={model.slug} model={model} />
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

function KeywordDynamicRunway({ keywords }: { keywords: Keyword[] }) {
  const { t, pick } = useI18n();
  const duration = 34;

  return (
    <section
      className="keyword-runway"
      data-testid="keyword-dynamic-runway"
      aria-label={t("home.keywordRunway")}
    >
      <h2 className="sr-only">{t("home.keywordRunway")}</h2>
      <div className="keyword-runway-stage">
        {keywords.map((keyword, index) => (
          <a
            key={keyword.slug}
            href={`/keywords/${keyword.slug}`}
            data-keyword-tile={keyword.slug}
            className="keyword-runway-item"
            style={
              {
                "--runway-delay": `${-(index * (duration / keywords.length))}s`,
              } as CSSProperties
            }
          >
            <span className="keyword-runway-label">{pick(keyword.labelEn, keyword.labelZh)}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
