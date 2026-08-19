import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { type CSSProperties, useState } from "react";
import { contentRepository } from "@/lib/content/repository";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { AgencyImage } from "@/components/site/AgencyImage";
import { ModelCard } from "@/components/site/ModelGrid";
import { AskAssistant } from "@/components/site/AskAssistant";
import { useI18n } from "@/lib/i18n";
import type { Keyword, NewsPost as NewsPostType } from "@/lib/content/types";
import { agencySlotProps, PUBLIC_MEDIA_SLOTS } from "@/lib/content/mediaSlots";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const [featured, news, keywords] = await Promise.all([
      contentRepository.listFeaturedModels(4),
      contentRepository.listNews(20),
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
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      ...homeQuery,
      revalidateIfStale: true,
    }),
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

      <NewsCarousel news={data.news} />

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

const NEWS_PER_PAGE = 4;

function NewsCarousel({ news }: { news: NewsPostType[] }) {
  const { t, pick, lang } = useI18n();
  const totalPages = Math.max(1, Math.ceil(news.length / NEWS_PER_PAGE));
  const [page, setPage] = useState(0);
  const visible = news.slice(page * NEWS_PER_PAGE, page * NEWS_PER_PAGE + NEWS_PER_PAGE);

  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-10 md:px-10">
      <div className="flex items-baseline justify-between">
        <h2 className="label-xs text-muted-foreground">{t("home.latest")}</h2>
        <Link to="/news" className="label-xs text-muted-foreground hover:text-foreground">
          {lang === "zh" ? "全部新聞 →" : "All news →"}
        </Link>
      </div>
      <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((post) => (
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
              <h3 className="mt-2 text-lg font-light">{pick(post.titleEn, post.titleZh)}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {pick(post.excerptEn, post.excerptZh)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              className={`h-2 w-2 rounded-full transition-all ${
                i === page ? "scale-125 bg-foreground" : "bg-foreground/25 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
