import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { useI18n } from "@/lib/i18n";
import { VideoGallery } from "@/components/site/VideoGallery";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["news", slug],
    queryFn: async () => {
      const post = await contentRepository.getNewsPost(slug);
      if (!post) throw notFound();
      return post;
    },
  });

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.slug));
    return { slug: params.slug, title: post.titleEn, excerpt: post.excerptEn, date: post.date };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — J&J Model Agency" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — J&J Model Agency`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/news/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/news/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            datePublished: loaderData.date,
            publisher: { "@type": "Organization", name: "J&J Model Agency" },
          }),
        },
      ],
    };
  },
  component: NewsPost,
  errorComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">This article didn't load.</p>
  ),
  notFoundComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">Article not found.</p>
  ),
});

function NewsPost() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  const { pick, t, lang } = useI18n();

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 md:px-10">
      <Link to="/news" className="label-xs text-muted-foreground hover:text-foreground">
        ← {t("news.back")}
      </Link>
      <p className="label-xs mt-8 text-muted-foreground">
        {new Date(post.date).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <h1 className="mt-3 text-3xl font-light md:text-4xl">{pick(post.titleEn, post.titleZh)}</h1>
      <img
        src={post.cover}
        alt={pick(post.titleEn, post.titleZh)}
        width={768}
        height={1024}
        className="mt-8 aspect-[4/3] w-full object-cover"
      />
      <div className="mt-8 space-y-5">
        {(lang === "zh" ? post.bodyZh : post.bodyEn).map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {para}
          </p>
        ))}
      </div>
      <VideoGallery title={t("video.media")} videos={post.videos} />
    </article>
  );
}
