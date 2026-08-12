import { contentRepository } from "./repository";
import type { Keyword, Model, NewsPost } from "./types";

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
  answerEn: string;
  answerZh: string;
};

type SearchIntent = {
  gender?: Model["gender"];
  city?: string;
  requiresJapanese: boolean;
  japanMarket: boolean;
  requiredTags: string[];
  hasSearchIntent: boolean;
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
  ].find(([term]) => query.includes(term))?.[1];
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
    signalsEn.push(`${intent.city[0].toUpperCase()}${intent.city.slice(1)} market`);
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

export async function retrieveModelRecommendations(
  input: string,
): Promise<AssistantRetrievalResult | null> {
  const intent = detectIntent(input);
  if (!intent.hasSearchIntent) return null;

  const [models, keywords, news] = await Promise.all([
    contentRepository.listModels(),
    contentRepository.listKeywords(),
    contentRepository.listNews(),
  ]);
  const matchedKeywords = keywords.filter((keyword) => intent.requiredTags.includes(keyword.slug));
  const candidates = models
    .filter((model) => modelMatches(model, intent))
    .map((model) => candidateFor(model, intent, keywords))
    .sort(
      (a, b) =>
        scoreCandidate(b, intent) - scoreCandidate(a, intent) ||
        a.model.name.localeCompare(b.model.name),
    )
    .slice(0, 4);
  const candidateTags = new Set(candidates.flatMap(({ model }) => model.tags));
  const relatedNews = news
    .filter((post) => post.tags.some((tag) => candidateTags.has(tag)))
    .slice(0, 2);

  if (candidates.length === 0) {
    return {
      candidates: [],
      matchedKeywords,
      relatedNews: [],
      answerEn:
        "I couldn't find an exact match in the current board. Please share the market, language, and campaign type and I’ll narrow the active roster.",
      answerZh:
        "目前名單沒有完全符合的人選。請告訴我市場、語言與拍攝類型，我會再從現有資料中精準篩選。",
    };
  }

  return {
    candidates,
    matchedKeywords,
    relatedNews,
    answerEn: `I found ${candidates.length} matching ${candidates.length === 1 ? "model" : "models"} from the current roster.`,
    answerZh: `我從目前名單中找到 ${candidates.length} 位符合條件的模特兒。`,
  };
}
