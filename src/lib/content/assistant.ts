/**
 * Front-desk assistant knowledge base.
 *
 * Deliberately vendor-free: answers are matched locally against keywords so
 * the widget works with no backend. When an AI model is wired in later, the
 * same `AssistantAnswer` shape can be returned from a server function and the
 * widget stays unchanged.
 */
export type AssistantAnswer = {
  id: string;
  /** Lower-case keywords, English and Chinese */
  keywords: string[];
  questionEn: string;
  questionZh: string;
  answerEn: string;
  answerZh: string;
  link?: { to: string; params?: Record<string, string>; labelEn: string; labelZh: string };
};

export const assistantAnswers: AssistantAnswer[] = [
  {
    id: "become-model",
    keywords: ["scout", "apply", "become", "model application", "join", "招募", "應徵", "面試", "當模特"],
    questionEn: "How do I apply to be a model?",
    questionZh: "我要如何應徵模特兒？",
    answerEn:
      "Send an application through Get Scouted: daylight, unretouched photographs (face, full body, profile), your measurements and city. We review every submission.",
    answerZh:
      "請透過「模特招募」頁面申請：日光下、未修圖的照片（臉部、全身、側面），並附上三圍與所在城市。我們會審閱每一份申請。",
    link: { to: "/scouted", labelEn: "Get Scouted", labelZh: "模特招募" },
  },
  {
    id: "booking",
    keywords: ["book", "booking", "hire", "rate", "campaign", "shoot", "工作", "洽詢", "預約", "檔期", "報價"],
    questionEn: "How do I book a model?",
    questionZh: "我要如何預約模特兒？",
    answerEn:
      "Use the contact form and choose “Booking / job enquiry”, or email bookings@asianstars.agency with dates, usage and budget. The nearest desk replies within one working day.",
    answerZh:
      "請於聯絡表單選擇「工作洽詢」，或來信 bookings@asianstars.agency，並附上檔期、使用範圍與預算。最近的辦公室將於一個工作天內回覆。",
    link: { to: "/contact", labelEn: "Contact", labelZh: "聯絡我們" },
  },
  {
    id: "collaboration",
    keywords: ["collab", "partnership", "brand", "sponsor", "合作", "邀約", "品牌", "贊助"],
    questionEn: "We'd like to propose a collaboration.",
    questionZh: "我們想提出合作邀約。",
    answerEn:
      "Choose “Collaboration / partnership” on the contact form and outline the project, timing and territories. Partnership enquiries go straight to the agency directors.",
    answerZh:
      "請於聯絡表單選擇「合作邀約」，並說明專案內容、時程與地區。合作提案會直接送達經紀公司負責人。",
    link: { to: "/contact", labelEn: "Contact", labelZh: "聯絡我們" },
  },
  {
    id: "boards",
    keywords: ["board", "women", "men", "new face", "talent", "models", "分類", "女模", "男模", "新面孔", "藝人"],
    questionEn: "Where can I see the models?",
    questionZh: "我可以在哪裡看到模特兒？",
    answerEn:
      "The boards are Women, Men, New Faces and Talent. Each profile carries statistics, portfolio and digitals.",
    answerZh: "分類包含女模、男模、新面孔與藝人。每位模特兒的頁面皆有身型資料、作品集與生活照。",
    link: { to: "/models/$board", params: { board: "women" }, labelEn: "Women board", labelZh: "女模分類" },
  },
  {
    id: "press",
    keywords: ["press", "media", "interview", "journalist", "媒體", "採訪", "新聞", "報導"],
    questionEn: "I'm from the press.",
    questionZh: "我是媒體。",
    answerEn:
      "Press requests go to press@asianstars.agency, or select “Press & media” on the contact form. Recent announcements are on the News page.",
    answerZh:
      "媒體需求請寄 press@asianstars.agency，或於聯絡表單選擇「媒體採訪」。最新公告請見消息頁面。",
    link: { to: "/news", labelEn: "News", labelZh: "最新消息" },
  },
  {
    id: "offices",
    keywords: ["office", "where", "address", "location", "taipei", "tokyo", "seoul", "singapore", "據點", "辦公室", "地址", "台北", "東京"],
    questionEn: "Where are your offices?",
    questionZh: "你們的據點在哪裡？",
    answerEn: "Desks in Taipei, Tokyo, Seoul and Singapore. Phone numbers and emails are on the contact page.",
    answerZh: "我們在台北、東京、首爾與新加坡設有據點，電話與信箱請見聯絡頁面。",
    link: { to: "/contact", labelEn: "Contact", labelZh: "聯絡我們" },
  },
  {
    id: "about",
    keywords: ["about", "agency", "who", "story", "關於", "介紹", "公司"],
    questionEn: "Tell me about the agency.",
    questionZh: "介紹一下這間經紀公司。",
    answerEn:
      "We are a model management house working across Asia — editorial, campaign and runway — with a bilingual team.",
    answerZh: "我們是立足亞洲的模特兒經紀公司，服務雜誌、廣告與伸展台，團隊使用中英雙語。",
    link: { to: "/about", labelEn: "About", labelZh: "關於我們" },
  },
];

export function matchAnswer(input: string): AssistantAnswer | null {
  const q = input.toLowerCase().trim();
  if (!q) return null;
  let best: { answer: AssistantAnswer; score: number } | null = null;
  for (const answer of assistantAnswers) {
    let score = 0;
    for (const keyword of answer.keywords) {
      if (q.includes(keyword)) score += keyword.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { answer, score };
  }
  return best ? best.answer : null;
}
