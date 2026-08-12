import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";

const STORAGE_KEY = "asa-lang";

type Dict = Record<string, { en: string; zh: string }>;

const dict: Dict = {
  "nav.women": { en: "Women", zh: "女模" },
  "nav.men": { en: "Men", zh: "男模" },
  "nav.newFaces": { en: "New Faces", zh: "新面孔" },
  "nav.talent": { en: "Talent", zh: "藝人" },
  "nav.news": { en: "News", zh: "消息" },
  "nav.about": { en: "About", zh: "關於" },
  "nav.contact": { en: "Contact", zh: "聯絡" },
  "nav.scouted": { en: "Get Scouted", zh: "模特招募" },
  "nav.menu": { en: "Menu", zh: "選單" },
  "nav.close": { en: "Close", zh: "關閉" },

  "home.tagline": {
    en: "A model management house for Asia.",
    zh: "立足亞洲的模特兒經紀公司。",
  },
  "home.intro": {
    en: "Representing faces across Taipei, Tokyo, Seoul and Singapore for editorial, campaign and runway.",
    zh: "代理台北、東京、首爾與新加坡的面孔，服務時尚雜誌、品牌廣告與伸展台。",
  },
  "home.boards": { en: "Boards", zh: "分類" },
  "home.featured": { en: "Featured", zh: "精選" },
  "home.viewBoard": { en: "View board", zh: "查看分類" },
  "home.latest": { en: "Latest", zh: "最新消息" },

  "board.count": { en: "models", zh: "位模特兒" },
  "board.all": { en: "All", zh: "全部" },
  "board.empty": { en: "No models on this board yet.", zh: "此分類尚無模特兒。" },
  "board.back": { en: "Back to board", zh: "返回分類" },

  "model.stats": { en: "Statistics", zh: "身型資料" },
  "model.height": { en: "Height", zh: "身高" },
  "model.bust": { en: "Bust", zh: "胸圍" },
  "model.waist": { en: "Waist", zh: "腰圍" },
  "model.hips": { en: "Hips", zh: "臀圍" },
  "model.shoes": { en: "Shoes", zh: "鞋號" },
  "model.hair": { en: "Hair", zh: "髮色" },
  "model.eyes": { en: "Eyes", zh: "眼睛" },
  "model.portfolio": { en: "Portfolio", zh: "作品集" },
  "model.digitals": { en: "Digitals", zh: "生活照" },
  "model.booking": { en: "Quick booking", zh: "快速預約" },

  "news.title": { en: "News", zh: "最新消息" },
  "news.readMore": { en: "Read", zh: "閱讀" },
  "news.back": { en: "All news", zh: "所有消息" },

  "about.title": { en: "About", zh: "關於我們" },
  "about.offices": { en: "Offices", zh: "據點" },

  "contact.title": { en: "Contact", zh: "聯絡我們" },
  "contact.general": { en: "General", zh: "一般洽詢" },
  "contact.bookings": { en: "Bookings", zh: "快速預約" },
  "contact.press": { en: "Press", zh: "媒體聯繫" },

  "scout.title": { en: "Get Scouted", zh: "模特招募" },
  "scout.intro": {
    en: "We review every application. Send clear, unretouched photographs taken in daylight.",
    zh: "我們會審閱每一份申請。請提供日光下拍攝、未經修圖的清晰照片。",
  },
  "scout.name": { en: "Full name", zh: "姓名" },
  "scout.age": { en: "Age", zh: "年齡" },
  "scout.city": { en: "City", zh: "所在城市" },
  "scout.email": { en: "Email", zh: "電子信箱" },
  "scout.phone": { en: "Phone", zh: "電話" },
  "scout.height": { en: "Height (cm)", zh: "身高（公分）" },
  "scout.measurements": { en: "Measurements", zh: "三圍" },
  "scout.instagram": { en: "Instagram", zh: "Instagram" },
  "scout.photos": { en: "Photographs", zh: "照片" },
  "scout.photosHint": {
    en: "Face, full body and profile. Up to 6 images.",
    zh: "臉部、全身與側面，最多 6 張。",
  },
  "scout.message": { en: "Anything else", zh: "其他說明" },
  "scout.submit": { en: "Submit application", zh: "送出申請" },
  "scout.sending": { en: "Sending…", zh: "傳送中…" },
  "scout.thanks": {
    en: "Thank you. Your application has been received.",
    zh: "感謝您，我們已收到您的申請。",
  },
  "scout.required": { en: "Please complete the required fields.", zh: "請填寫必填欄位。" },

  "hero.label": { en: "Agency highlights", zh: "本期焦點" },
  "hero.goTo": { en: "Go to slide", zh: "前往第" },

  "contactForm.title": { en: "Send an enquiry", zh: "來信洽詢" },
  "contactForm.intro": {
    en: "Tell us what you need and the nearest desk will reply within one working day.",
    zh: "請說明您的需求，最近的辦公室將於一個工作天內回覆。",
  },
  "contactForm.type": { en: "Enquiry type", zh: "洽詢類型" },
  "contactForm.name": { en: "Your name", zh: "您的姓名" },
  "contactForm.company": { en: "Company / brand", zh: "公司／品牌" },
  "contactForm.email": { en: "Email", zh: "電子信箱" },
  "contactForm.phone": { en: "Phone", zh: "電話" },
  "contactForm.subject": { en: "Subject", zh: "主旨" },
  "contactForm.budget": { en: "Dates or budget", zh: "檔期或預算" },
  "contactForm.message": { en: "Message", zh: "訊息內容" },
  "contactForm.submit": { en: "Send enquiry", zh: "送出洽詢" },
  "contactForm.sending": { en: "Sending…", zh: "傳送中…" },
  "contactForm.thanks": {
    en: "Thank you. Your enquiry has been received — we will be in touch shortly.",
    zh: "感謝您，我們已收到您的洽詢，將盡快與您聯繫。",
  },

  "assistant.cta": { en: "Any questions? I can help", zh: "有任何問題？我可以協助" },
  "assistant.open": { en: "Open J Agent", zh: "開啟 J Agent" },
  "assistant.close": { en: "Close", zh: "關閉" },
  "assistant.title": { en: "J Agent", zh: "J Agent 線上客服" },
  "assistant.intro": {
    en: "Ask about booking, applying, our boards or our offices.",
    zh: "可詢問工作洽詢、模特應徵、分類或據點等問題。",
  },
  "assistant.placeholder": { en: "Type your question", zh: "輸入您的問題" },
  "assistant.send": { en: "Ask", zh: "詢問" },
  "assistant.fallback": {
    en: "I am not sure about that one. The contact page reaches a real person at every desk.",
    zh: "這題我不太確定。您可以透過聯絡頁面直接與各據點的同事聯繫。",
  },

  "booking.cta": { en: "Quick booking", zh: "快速預約" },
  "booking.title": { en: "Quick booking request", zh: "快速預約需求" },
  "booking.intro": {
    en: "Build a booking request quickly. A full casting brief is not required at this stage.",
    zh: "用幾個選項快速建立預約需求，此階段不需要完整選角簡報。",
  },
  "booking.contact": { en: "Contact person", zh: "聯絡人" },
  "booking.phone": { en: "Phone", zh: "電話" },
  "booking.email": { en: "Email", zh: "電子信箱" },
  "booking.note": { en: "Note (optional)", zh: "備註（選填）" },
  "booking.submit": { en: "Send booking request", zh: "送出預約需求" },
  "booking.sending": { en: "Sending…", zh: "傳送中…" },
  "booking.thanks": {
    en: "Received. A booker will contact you shortly.",
    zh: "已收到，經紀人將盡快與您聯繫。",
  },

  "footer.follow": { en: "Follow", zh: "追蹤我們" },

  "video.showreel": { en: "Showreel", zh: "動態作品" },
  "video.media": { en: "Media", zh: "影音" },
  "video.play": { en: "Play video", zh: "播放影片" },
  "video.attach": { en: "Video (optional)", zh: "影片（選填）" },
  "video.tabFile": { en: "Upload file", zh: "上傳檔案" },
  "video.tabLink": { en: "YouTube link", zh: "YouTube 連結" },
  "video.fileHint": {
    en: "A short walking or talking clip, filmed in daylight.",
    zh: "日光下拍攝的走路或說話短片。",
  },
  "video.linkHint": {
    en: "Paste any YouTube URL — watch, share or Shorts.",
    zh: "貼上任何 YouTube 連結，watch、分享或 Shorts 皆可。",
  },
  "video.badLink": {
    en: "That does not look like a YouTube link.",
    zh: "這似乎不是 YouTube 連結。",
  },
  "video.tooLarge": { en: "That file is too large.", zh: "檔案容量過大。" },

  "footer.rights": { en: "All rights reserved.", zh: "版權所有。" },
};

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  pick: (en: string, zh?: string | null) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") {
      setLangState(stored);
      return;
    }
    if (navigator.language?.toLowerCase().startsWith("zh")) setLangState("zh");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key) => dict[key]?.[lang] ?? key,
      pick: (en, zh) => (lang === "zh" && zh ? zh : en),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
