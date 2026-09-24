import { contentRepository } from "./repository";
import { seedSpecialistChannels } from "./seed";
import type { Keyword, Model, NewsPost } from "./types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Lightweight, cloud-agnostic retrieval for J Assistant.
 *
 * This intentionally searches the same repository boundary used by pages. It
 * is not an LLM and has no credentials in the browser; a future server-side
 * Supabase/pgvector implementation can return this same result shape.
 */
export type AssistantCandidate = {
  model: Model;
  signalsEn: string[];
  signalsZh: string[];
};

export type AssistantRetrievalResult = {
  candidates: AssistantCandidate[];
  matchedKeywords: Keyword[];
  relatedNews: NewsPost[];
  relatedAbout: { titleEn: string; titleZh: string; excerptEn: string; excerptZh: string } | null;
  relatedKnowledge: Array<{
    titleEn: string;
    titleZh: string;
    contentEn: string;
    contentZh: string;
  }>;
  specialistHandoff: {
    offered: boolean;
    messengerUrl: string | null;
    lineOaUrl: string | null;
  };
  covered: boolean;
  answerEn: string;
  answerZh: string;
};

type SearchIntent = {
  gender: Model["gender"] | undefined;
  city: string | undefined;
  requiresJapanese: boolean;
  japanMarket: boolean;
  requiredTags: string[];
  hasSearchIntent: boolean;
  wantsHandoff: boolean;
  wantsAbout: boolean;
  wantsNews: boolean;
};

const cityLabelsZh: Record<string, string> = {
  taipei: "台北",
  tokyo: "東京",
  seoul: "首爾",
  singapore: "新加坡",
  okinawa: "沖繩",
};

const hasAny = (query: string, terms: string[]) => terms.some((term) => query.includes(term));

function detectIntent(input: string): SearchIntent {
  const query = input.toLowerCase();
  const wantsMen = hasAny(query, ["男模", "男生", "男性", "male model", "male models", "men"]);
  const wantsWomen = hasAny(query, [
    "女模",
    "女生",
    "女性",
    "female model",
    "female models",
    "women",
  ]);
  const requiresJapanese = hasAny(query, [
    "日文",
    "日語",
    "日本語",
    "japanese language",
    "speak japanese",
  ]);
  const japanMarket = hasAny(query, [
    "日本品牌",
    "日本廣告",
    "日本市場",
    "東京",
    "japan brand",
    "japanese brand",
    "japan campaign",
    "tokyo",
  ]);
  const city = [
    ["台北", "taipei"],
    ["taipei", "taipei"],
    ["東京", "tokyo"],
    ["tokyo", "tokyo"],
    ["首爾", "seoul"],
    ["seoul", "seoul"],
    ["新加坡", "singapore"],
    ["singapore", "singapore"],
    ["沖繩", "okinawa"],
    ["okinawa", "okinawa"],
  ].find((entry) => entry[0] !== undefined && query.includes(entry[0]))?.[1];
  const requiredTags = [
    ...(hasAny(query, ["show girl", "showgirl", "展場", "活動女孩"]) ? ["show-girl"] : []),
    ...(hasAny(query, ["美妝", "保養", "彩妝", "beauty", "skincare", "cosmetic"])
      ? ["beauty"]
      : []),
    ...(hasAny(query, ["廣告", "campaign", "advertising", "commercial", "品牌"])
      ? ["advertising-model"]
      : []),
    ...(hasAny(query, ["時裝", "fashion", "runway", "伸展台", "走秀"]) ? ["fashion-model"] : []),
    ...(hasAny(query, ["主持", "host", "presenter"]) ? ["host"] : []),
  ];

  return {
    gender: wantsMen && !wantsWomen ? "men" : wantsWomen && !wantsMen ? "women" : undefined,
    city,
    requiresJapanese,
    japanMarket,
    requiredTags,
    hasSearchIntent:
      wantsMen ||
      wantsWomen ||
      requiresJapanese ||
      japanMarket ||
      requiredTags.length > 0 ||
      hasAny(query, ["找模特", "找人", "推薦", "適合", "model", "talent", "who"]),
    wantsHandoff: hasAny(query, [
      "專人",
      "轉接",
      "真人",
      "客服",
      "顧問",
      "specialist",
      "messenger",
      "facebook",
      "line oa",
      "line官方",
      "官方帳號",
      "handoff",
      "talk to someone",
      "speak to someone",
    ]),
    wantsAbout: hasAny(query, [
      "about",
      "agency",
      "office",
      "offices",
      "經紀",
      "關於",
      "公司",
      "辦公室",
      "據點",
    ]),
    wantsNews: hasAny(query, ["news", "press", "新聞", "消息", "報導", "公告"]),
  };
}

function modelMatches(model: Model, intent: SearchIntent) {
  if (intent.gender && model.gender !== intent.gender) return false;
  if (
    intent.city &&
    !model.city.toLowerCase().includes(intent.city) &&
    !model.cityZh.includes(intent.city) &&
    !model.tags.includes(intent.city)
  ) {
    return false;
  }
  if (intent.requiresJapanese && !model.languages.some((language) => language === "Japanese"))
    return false;
  if (
    intent.requiredTags.length > 0 &&
    !intent.requiredTags.every((tag) => model.tags.includes(tag))
  ) {
    return false;
  }
  if (
    intent.japanMarket &&
    !model.languages.includes("Japanese") &&
    !model.tags.includes("tokyo") &&
    !model.city.toLowerCase().includes("tokyo")
  ) {
    return false;
  }
  return true;
}

function candidateFor(model: Model, intent: SearchIntent, keywords: Keyword[]): AssistantCandidate {
  const signalsEn: string[] = [];
  const signalsZh: string[] = [];
  if (intent.gender) {
    signalsEn.push(intent.gender === "men" ? "Male model" : "Female model");
    signalsZh.push(intent.gender === "men" ? "男模" : "女模");
  }
  if (
    intent.city &&
    (model.city.toLowerCase().includes(intent.city) || model.tags.includes(intent.city))
  ) {
    signalsEn.push(`${intent.city.charAt(0).toUpperCase()}${intent.city.slice(1)} market`);
    signalsZh.push(`${cityLabelsZh[intent.city] ?? intent.city}市場`);
  }
  if (intent.requiresJapanese || (intent.japanMarket && model.languages.includes("Japanese"))) {
    signalsEn.push("Japanese-speaking");
    signalsZh.push("可使用日語");
  }
  if (intent.japanMarket && (model.tags.includes("tokyo") || model.city.includes("Tokyo"))) {
    signalsEn.push("Tokyo market");
    signalsZh.push("東京市場經驗");
  }
  for (const tag of intent.requiredTags) {
    const keyword = keywords.find((item) => item.slug === tag);
    if (!keyword) continue;
    signalsEn.push(keyword.labelEn);
    signalsZh.push(keyword.labelZh);
  }
  if (model.gallery.length > 0) {
    signalsEn.push("Portfolio available");
    signalsZh.push("具備作品集");
  }
  return { model, signalsEn, signalsZh };
}

function scoreCandidate(candidate: AssistantCandidate, intent: SearchIntent) {
  const { model } = candidate;
  let score = model.featured ? 2 : 0;
  if (intent.gender && model.board === intent.gender) score += 4;
  if (
    intent.city &&
    (model.city.toLowerCase().includes(intent.city) || model.tags.includes(intent.city))
  )
    score += 5;
  if (intent.requiresJapanese && model.languages.includes("Japanese")) score += 4;
  if (intent.japanMarket && (model.tags.includes("tokyo") || model.city.includes("Tokyo")))
    score += 3;
  score += intent.requiredTags.filter((tag) => model.tags.includes(tag)).length * 3;
  score += model.gallery.length > 0 ? 1 : 0;
  return score;
}

function scoreText(haystack: string, terms: string[]) {
  const text = haystack.toLowerCase();
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
}

function queryTerms(input: string) {
  return input
    .toLowerCase()
    .split(/[\s,，。？?！!、/]+/)
    .filter((term) => term.length > 1);
}

type PublishedAbout = {
  titleEn: string;
  titleZh: string;
  bodyEn: string[];
  bodyZh: string[];
  messengerUrl: string | null;
  lineOaUrl: string | null;
};

async function loadPublishedAbout(): Promise<PublishedAbout | null> {
  try {
    const client = getSupabaseBrowserClient();
    const withChannels = await client
      .from("site_settings")
      .select(
        "about_title_en, about_title_zh, about_body_en, about_body_zh, messenger_url, line_oa_url",
      )
      .eq("id", "global")
      .maybeSingle();
    const row =
      withChannels.data ??
      (
        await client
          .from("site_settings")
          .select("about_title_en, about_title_zh, about_body_en, about_body_zh")
          .eq("id", "global")
          .maybeSingle()
      ).data;
    if (!row) return null;
    const channels = row as typeof row & {
      messenger_url?: string | null;
      line_oa_url?: string | null;
    };
    return {
      titleEn: row.about_title_en,
      titleZh: row.about_title_zh,
      bodyEn: row.about_body_en ?? [],
      bodyZh: row.about_body_zh ?? [],
      messengerUrl: channels.messenger_url?.trim() || seedSpecialistChannels.messengerUrl,
      lineOaUrl: channels.line_oa_url?.trim() || seedSpecialistChannels.lineOaUrl,
    };
  } catch {
    return {
      titleEn: "",
      titleZh: "",
      bodyEn: [],
      bodyZh: [],
      messengerUrl: seedSpecialistChannels.messengerUrl,
      lineOaUrl: seedSpecialistChannels.lineOaUrl,
    };
  }
}

async function loadKnowledgeOverlay(terms: string[]) {
  try {
    const { data } = await getSupabaseBrowserClient()
      .from("assistant_knowledge_documents")
      .select("title_en, title_zh, content_en, content_zh, tags")
      .eq("published", true)
      .limit(30);
    return (data ?? [])
      .map((row) => ({
        row,
        score: terms.reduce(
          (score, term) =>
            score +
            (row.title_en.toLowerCase().includes(term) ||
            row.title_zh.toLowerCase().includes(term) ||
            row.content_en.toLowerCase().includes(term) ||
            row.content_zh.toLowerCase().includes(term) ||
            row.tags.some((tag) => tag.toLowerCase().includes(term))
              ? 1
              : 0),
          0,
        ),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(({ row }) => ({
        titleEn: row.title_en,
        titleZh: row.title_zh,
        contentEn: row.content_en,
        contentZh: row.content_zh,
      }));
  } catch {
    return [];
  }
}

export async function retrieveModelRecommendations(
  input: string,
): Promise<AssistantRetrievalResult | null> {
  const intent = detectIntent(input);
  const terms = queryTerms(input);

  const [models, keywords, news, about] = await Promise.all([
    contentRepository.listModels(),
    contentRepository.listKeywords(),
    contentRepository.listNews(),
    loadPublishedAbout(),
  ]);

  const matchedKeywords = keywords.filter((keyword) => intent.requiredTags.includes(keyword.slug));
  const intentCandidates = intent.hasSearchIntent
    ? models.filter((model) => modelMatches(model, intent))
    : [];
  const termCandidates = terms.length
    ? models.filter((model) => {
        const haystack = [
          model.name,
          model.nameZh,
          model.city,
          model.cityZh,
          model.bioEn,
          model.bioZh,
          model.tags.join(" "),
        ].join(" ");
        return scoreText(haystack, terms) > 0;
      })
    : [];
  const merged = [
    ...intentCandidates,
    ...termCandidates.filter((model) => !intentCandidates.includes(model)),
  ];
  const candidates = merged
    .map((model) => candidateFor(model, intent, keywords))
    .sort(
      (a, b) =>
        scoreCandidate(b, intent) - scoreCandidate(a, intent) ||
        a.model.name.localeCompare(b.model.name),
    )
    .slice(0, 4);

  const relatedNews = news
    .map((post) => ({
      post,
      score:
        scoreText(
          [
            post.titleEn,
            post.titleZh,
            post.excerptEn,
            post.excerptZh,
            ...post.bodyEn,
            ...post.bodyZh,
          ].join(" "),
          terms,
        ) + (post.tags.some((tag) => intent.requiredTags.includes(tag)) ? 2 : 0),
    }))
    .filter((item) => item.score > 0 || intent.wantsNews)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.post);

  const aboutHaystack = about
    ? [about.titleEn, about.titleZh, ...about.bodyEn, ...about.bodyZh].join(" ")
    : "";
  const aboutScore = about ? scoreText(aboutHaystack, terms) : 0;
  const relatedAbout =
    about && (intent.wantsAbout || aboutScore > 0)
      ? {
          titleEn: about.titleEn,
          titleZh: about.titleZh,
          excerptEn: about.bodyEn[0] ?? about.titleEn,
          excerptZh: about.bodyZh[0] ?? about.titleZh,
        }
      : null;

  const covered = candidates.length > 0 || relatedNews.length > 0 || Boolean(relatedAbout);
  const relatedKnowledge = covered ? [] : await loadKnowledgeOverlay(terms);
  const specialistHandoff = {
    offered: intent.wantsHandoff || !covered,
    messengerUrl: about?.messengerUrl ?? null,
    lineOaUrl: about?.lineOaUrl ?? null,
  };

  if (!covered && !relatedKnowledge.length && !specialistHandoff.offered) {
    return null;
  }

  let answerEn =
    "I can connect you with a booking specialist if this does not cover your question.";
  let answerZh = "如果這些公開資料還不夠，我可以幫你轉接專人。";
  if (candidates.length) {
    answerEn = `I found ${candidates.length} matching ${candidates.length === 1 ? "model" : "models"} from the published roster.`;
    answerZh = `我從目前公開名單中找到 ${candidates.length} 位符合條件的模特兒。`;
  } else if (relatedAbout) {
    answerEn = relatedAbout.excerptEn;
    answerZh = relatedAbout.excerptZh;
  } else if (relatedNews.length) {
    answerEn = `This matches published News: ${relatedNews.map((post) => post.titleEn).join(", ")}.`;
    answerZh = `這與已發佈的新聞相符：${relatedNews.map((post) => post.titleZh).join("、")}。`;
  } else if (relatedKnowledge.length) {
    answerEn = relatedKnowledge[0]!.contentEn;
    answerZh = relatedKnowledge[0]!.contentZh;
  } else if (specialistHandoff.offered) {
    answerEn =
      "I could not match that from published About, News, or the roster. I can hand you to a specialist through booking, Messenger, or LINE.";
    answerZh =
      "公開的關於我們、新聞與模特名單沒有對應答案。我可以幫你轉接專人：預約、Messenger 或 LINE。";
  }

  return {
    candidates,
    matchedKeywords,
    relatedNews,
    relatedAbout,
    relatedKnowledge,
    specialistHandoff,
    covered,
    answerEn,
    answerZh,
  };
}
