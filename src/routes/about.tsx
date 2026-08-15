import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const aboutQuery = queryOptions({
  queryKey: ["site-settings", "about"],
  queryFn: async () => {
    try {
      const { data, error } = await getSupabaseBrowserClient()
        .from("site_settings")
        .select("about_title_en, about_title_zh, about_body_en, about_body_zh, offices")
        .eq("id", "global")
        .maybeSingle();
      return error ? null : data;
    } catch {
      return null;
    }
  },
});

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(aboutQuery),
  head: () => ({
    meta: [
      { title: "About — J&J Model Agency" },
      {
        name: "description",
        content:
          "J&J Model Agency is a model management house built around Asian faces, with desks in Taipei, Tokyo, Seoul and Singapore.",
      },
      { property: "og:title", content: "About — J&J Model Agency" },
      {
        property: "og:description",
        content:
          "A model management house built around Asian faces, with four desks across the region.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const offices = [
  { city: "Taipei", cityZh: "台北", line: "No. 12, Section 4, Zhongxiao E Rd, Da'an" },
  { city: "Tokyo", cityZh: "東京", line: "2-11-3 Jingumae, Shibuya-ku" },
  { city: "Seoul", cityZh: "首爾", line: "44 Apgujeong-ro, Gangnam-gu" },
  { city: "Singapore", cityZh: "新加坡", line: "18 Cross Street, China Square Central" },
];

function AboutPage() {
  const { t, pick, lang } = useI18n();
  const { data: settings } = useSuspenseQuery(aboutQuery);
  const bodyEn = settings?.about_body_en?.length
    ? settings.about_body_en
    : [
        "J&J is a model management house built around Asian faces. We believe a face from this region does not need to be translated into someone else's idea of beauty to stand on an international stage.",
        "We keep the roster deliberately small. Every model is scouted, developed and booked by the same team — from a first test shoot through to international seasons.",
        "We represent talent for editorial, campaign, runway and brand ambassadorship, and work in Traditional Chinese, Japanese, Korean and English across four desks.",
      ];
  const bodyZh = settings?.about_body_zh?.length
    ? settings.about_body_zh
    : [
        "J&J 是一間圍繞亞洲面孔而生的模特兒經紀公司。我們相信亞洲的臉不需要被翻譯成別人的審美，也能站在國際舞台上。",
        "我們的規模刻意維持精簡：每位模特兒都由同一組人負責發掘、培養與安排工作，從第一次試拍到國際檔期皆然。",
        "我們代理雜誌、廣告、伸展台與品牌代言，四個據點以繁體中文、日文、韓文與英文提供服務。",
      ];
  const officeRows =
    Array.isArray(settings?.offices) && settings.offices.length
      ? (settings.offices as Array<{ city?: string; cityZh?: string; line?: string }>)
      : offices;

  return (
    <div>
      <div className="halftone h-24 w-full opacity-50" aria-hidden="true" />
      <div className="mx-auto max-w-[1600px] px-5 pb-10 md:px-10">
        <h1 className="text-3xl font-light md:text-4xl">
          {pick(settings?.about_title_en ?? "", settings?.about_title_zh ?? "") || t("about.title")}
        </h1>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
            {(lang === "zh" ? bodyZh : bodyEn).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div>
            <h2 className="label-xs text-muted-foreground">{t("about.offices")}</h2>
            <ul className="mt-4">
              {officeRows.map((office) => (
                <li key={office.city} className="border-t border-border py-4">
                  <p className="text-lg font-light">
                    {pick(office.city ?? "", office.cityZh ?? office.city ?? "")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{office.line}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
