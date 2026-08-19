import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { useI18n } from "@/lib/i18n";
import { AgencyImage } from "@/components/site/AgencyImage";
import { VideoGallery } from "@/components/site/VideoGallery";
import { agencySlotProps, PUBLIC_MEDIA_SLOTS } from "@/lib/content/mediaSlots";

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
    const post = await context.queryClient.ensureQueryData({
      ...postQuery(params.slug),
      revalidateIfStale: true,
    });
    return { slug: params.slug, title: post.titleEn, excerpt: post.excerptEn, date: post.date };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — J&J Model Agency" }, { name: "robots", content: "noindex" }],
      };
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
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.jjmodelagency.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "News",
                item: "https://www.jjmodelagency.com/news",
              },
              { "@type": "ListItem", position: 3, name: loaderData.title },
            ],
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
      <AgencyImage
        src={post.cover}
        alt={pick(post.titleEn, post.titleZh)}
        {...agencySlotProps(PUBLIC_MEDIA_SLOTS.newsCover)}
        containerClassName="mt-8"
      />
      <div className="mt-8 space-y-6">
        {post.bodyBlocks && post.bodyBlocks.length > 0
          ? (() => {
              const textBlocks = post.bodyBlocks.filter((b) => b.type === "text");
              const enParagraphs = post.bodyEn.length >= textBlocks.length ? post.bodyEn : [];
              let textIndex = 0;
              return post.bodyBlocks.map((block, i) => {
                if (block.type === "image") {
                  return (
                    <figure key={i}>
                      <img
                        src={block.content}
                        alt={block.caption || pick(post.titleEn, post.titleZh)}
                        className="w-full rounded object-cover"
                        loading="lazy"
                      />
                      {block.caption && (
                        <figcaption className="mt-2 text-xs text-muted-foreground">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }
                const zhText = block.content;
                const enText = enParagraphs[textIndex] ?? zhText;
                textIndex++;
                return (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {lang === "zh" ? zhText : enText}
                  </p>
                );
              });
            })()
          : (lang === "zh" ? post.bodyZh : post.bodyEn).map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {para}
              </p>
            ))}
      </div>
      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to="/news"
              search={{ tag }}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
      <VideoGallery title={t("video.media")} videos={post.videos} />
    </article>
  );
}
