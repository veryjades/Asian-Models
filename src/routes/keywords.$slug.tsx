import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { AgencyImage } from "@/components/site/AgencyImage";
import { ModelGrid } from "@/components/site/ModelGrid";
import { QuickBooking } from "@/components/site/QuickBooking";
import { useI18n } from "@/lib/i18n";

const keywordQuery = (slug: string) =>
  queryOptions({
    queryKey: ["keyword", slug],
    queryFn: async () => {
      const result = await contentRepository.getKeywordResult(slug);
      if (!result) throw notFound();
      return result;
    },
  });

export const Route = createFileRoute("/keywords/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      ...keywordQuery(params.slug),
      revalidateIfStale: true,
    }),
  head: ({ params, loaderData }) => {
    const keyword = loaderData?.keyword;
    const title = keyword ? `${keyword.labelEn} — J&J Model Agency` : "Keyword — J&J Model Agency";
    const description =
      keyword?.descriptionEn ??
      "Discover relevant models, news and portfolio work from J&J Model Agency.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/keywords/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/keywords/${params.slug}` }],
    };
  },
  component: KeywordPage,
  errorComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">
      This keyword page didn't load.
    </p>
  ),
  notFoundComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">Keyword not found.</p>
  ),
});

function KeywordPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(keywordQuery(slug));
  const { pick, t, lang } = useI18n();
  const hasContent = data.models.length > 0 || data.news.length > 0 || data.portfolio.length > 0;

  return (
    <div>
      <div className="gradient-accent h-1 w-full" aria-hidden="true" />
      <header className="mx-auto grid max-w-[1600px] gap-8 px-5 py-10 md:grid-cols-[1fr_280px] md:px-10">
        <div>
          <Link to="/" className="label-xs text-muted-foreground hover:text-foreground">
            ← {t("keyword.back")}
          </Link>
          <h1 className="mt-6 text-4xl font-light md:text-6xl">
            {pick(data.keyword.labelEn, data.keyword.labelZh)}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {pick(data.keyword.descriptionEn, data.keyword.descriptionZh)}
          </p>
        </div>
        <aside className="border border-border p-4">
          <p className="label-xs text-muted-foreground">{t("keyword.booking")}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {pick(
              "Need a shortlist? Send the keyword and production context to a booker.",
              "需要候選名單？可將關鍵字與製作需求送給經紀人。",
            )}
          </p>
          <QuickBooking className="mt-5 w-full" />
        </aside>
      </header>

      {hasContent ? (
        <>
          <section className="mx-auto max-w-[1600px] px-5 py-8 md:px-10">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="label-xs text-muted-foreground">{t("keyword.models")}</h2>
              <p className="label-xs text-muted-foreground">{data.models.length}</p>
            </div>
            <ModelGrid models={data.models} />
          </section>

          {data.portfolio.length > 0 ? (
            <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
              <h2 className="label-xs text-muted-foreground">{t("keyword.portfolio")}</h2>
              <div className="mt-6">
                <ModelGrid models={data.portfolio.slice(0, 6)} />
              </div>
            </section>
          ) : null}

          {data.news.length > 0 ? (
            <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
              <h2 className="label-xs text-muted-foreground">{t("keyword.news")}</h2>
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
                      <h3 className="mt-2 text-xl font-light">
                        {pick(post.titleEn, post.titleZh)}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {pick(post.excerptEn, post.excerptZh)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : (
        <p className="mx-auto max-w-[1600px] px-5 py-12 text-sm text-muted-foreground md:px-10">
          {t("keyword.empty")}
        </p>
      )}
    </div>
  );
}
