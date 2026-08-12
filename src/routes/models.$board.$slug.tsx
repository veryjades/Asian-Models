import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { contentRepository } from "@/lib/content/repository";
import { boards, type BoardId, type Keyword, type Model } from "@/lib/content/types";
import { useI18n } from "@/lib/i18n";
import { VideoGallery } from "@/components/site/VideoGallery";
import { AgencyImage } from "@/components/site/AgencyImage";
import { QuickBooking } from "@/components/site/QuickBooking";
import { seedKeywords } from "@/lib/content/keywords";

const languageLabels: Record<string, { en: string; zh: string }> = {
  Mandarin: { en: "Mandarin", zh: "中文" },
  Japanese: { en: "Japanese", zh: "日語" },
  English: { en: "English", zh: "英語" },
  Korean: { en: "Korean", zh: "韓語" },
  Malay: { en: "Malay", zh: "馬來語" },
  Hindi: { en: "Hindi", zh: "印地語" },
  Tamil: { en: "Tamil", zh: "坦米爾語" },
  Filipino: { en: "Filipino", zh: "菲律賓語" },
  Spanish: { en: "Spanish", zh: "西班牙語" },
  Swedish: { en: "Swedish", zh: "瑞典語" },
};

const modelQuery = (board: BoardId, slug: string) =>
  queryOptions({
    queryKey: ["model", board, slug],
    queryFn: async () => {
      const model = await contentRepository.getModel(board, slug);
      if (!model) throw notFound();
      return model;
    },
  });

export const Route = createFileRoute("/models/$board/$slug")({
  loader: async ({ context, params }) => {
    const board = params.board as BoardId;
    const model = await context.queryClient.ensureQueryData(modelQuery(board, params.slug));
    return { board, slug: params.slug, name: model.name, city: model.city };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — J&J Model Agency" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — J&J Model Agency`;
    const description = `${loaderData.name}, represented by J&J Model Agency in ${loaderData.city}. Portfolio, digitals and statistics.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `/models/${params.board}/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/models/${params.board}/${params.slug}` }],
    };
  },
  component: ModelPage,
  errorComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">This profile didn't load.</p>
  ),
  notFoundComponent: () => (
    <p className="px-5 py-24 text-sm text-muted-foreground md:px-10">Model not found.</p>
  ),
});

function Stat({ label, value }: { label: string; value?: string | undefined }) {
  if (!value) return null;
  return (
    <div className="border-t border-border py-2.5">
      <dt className="label-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function ModelPage() {
  const { board } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { data: model } = useSuspenseQuery(modelQuery(board, slug));
  const { pick, t } = useI18n();
  const boardMeta = boards.find((b) => b.id === model.board)!;
  const modelDisplayName = pick(model.name, model.nameZh);
  const modelLanguages = model.languages
    .map((language) => languageLabels[language] ?? { en: language, zh: language })
    .map((language) => pick(language.en, language.zh))
    .join(pick(", ", "、"));
  const modelTags = model.tags
    .map((slug) => seedKeywords.find((keyword) => keyword.slug === slug))
    .filter((keyword): keyword is Keyword => Boolean(keyword));

  return (
    <article className="mx-auto max-w-[1600px] px-5 py-8 md:px-10">
      <Link
        to="/models/$board"
        params={{ board: model.board }}
        className="label-xs text-muted-foreground hover:text-foreground"
      >
        ← {pick(boardMeta.labelEn, boardMeta.labelZh)}
      </Link>

      <header className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-border pb-6">
        <h1 className="text-4xl font-light md:text-5xl">{modelDisplayName}</h1>
        <p className="label-xs text-muted-foreground">{pick(model.city, model.cityZh)}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <AgencyImage
            src={model.portrait}
            alt={model.name}
            width={768}
            height={1024}
            fit="contain"
          />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {pick(model.bioEn, model.bioZh)}
          </p>
        </div>

        <aside>
          <h2 className="label-xs pb-3">{t("model.stats")}</h2>
          <dl>
            <Stat
              label={pick("Category", "分類")}
              value={pick(boardMeta.labelEn, boardMeta.labelZh)}
            />
            <Stat
              label={pick("Gender", "性別")}
              value={pick(
                model.gender === "men" ? "Male" : "Female",
                model.gender === "men" ? "男" : "女",
              )}
            />
            <Stat label={pick("Market", "市場／地點")} value={pick(model.city, model.cityZh)} />
            <Stat label={pick("Languages", "工作語言")} value={modelLanguages} />
            <Stat label={t("model.height")} value={model.stats.height} />
            <Stat label={t("model.weight")} value={model.stats.weight} />
            <Stat label={t("model.bust")} value={model.stats.bust} />
            <Stat label={t("model.waist")} value={model.stats.waist} />
            <Stat label={t("model.hips")} value={model.stats.hips} />
            <Stat label={t("model.shoes")} value={model.stats.shoes} />
            <Stat label={t("model.hair")} value={pick(model.stats.hair, model.stats.hairZh)} />
            <Stat label={t("model.eyes")} value={pick(model.stats.eyes, model.stats.eyesZh)} />
          </dl>
        </aside>
      </div>

      <QuickBooking
        modelId={model.slug}
        modelName={modelDisplayName}
        className="model-profile-quick-booking"
      />

      <Gallery title={t("model.portfolio")} images={model.gallery} model={model} />
      <Gallery title={t("model.digitals")} images={model.digitals} model={model} />
      <VideoGallery title={t("video.showreel")} videos={model.videos} />
      <section className="mt-16">
        <h2 className="label-xs pb-4 text-muted-foreground">{pick("Tags", "標籤")}</h2>
        <ul className="flex flex-wrap gap-2">
          {modelTags.map((tag) => (
            <li
              key={tag.slug}
              className="label-xs border border-border px-2.5 py-2 text-muted-foreground"
            >
              {pick(tag.labelEn, tag.labelZh)}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function Gallery({ title, images, model }: { title: string; images: string[]; model: Model }) {
  if (images.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="label-xs pb-4 text-muted-foreground">{title}</h2>
      <ul className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
        {images.map((src, i) => (
          <li key={`${title}-${i}`} className="bg-background">
            <AgencyImage
              src={src}
              alt={`${model.name} — ${title} ${i + 1}`}
              loading="lazy"
              width={768}
              height={1024}
              aspectRatio="3 / 4"
              fit="contain"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
