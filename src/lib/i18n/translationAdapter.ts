/**
 * Replaceable ZH→EN translation boundary (D-029).
 *
 * Admin authors Chinese. Public English uses stored English when present,
 * otherwise falls back to Chinese via `pick()`. A later Phase 6 provider can
 * implement this interface without changing Admin UI. No vendor SDK is bundled.
 */
export type TranslationRequest = {
  sourceLang: "zh";
  targetLang: "en";
  text: string;
};

export interface TranslationAdapter {
  translate(request: TranslationRequest): Promise<string>;
}

/** True when Han characters dominate Latin letters — not usable as English. */
export function isPrimarilyChinese(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  let han = 0;
  let latin = 0;
  for (const char of trimmed) {
    if (char >= "\u4e00" && char <= "\u9fff") han += 1;
    else if (/[A-Za-z]/.test(char)) latin += 1;
  }
  if (han === 0) return false;
  return han >= Math.max(1, latin);
}

/** Prefer stored English only when it is non-empty and not Chinese. */
export function usableEnglish(en: string | null | undefined, zhFallback = ""): string {
  const trimmed = en?.trim() ?? "";
  if (!trimmed) return "";
  if (isPrimarilyChinese(trimmed)) return "";
  if (zhFallback.trim() && trimmed === zhFallback.trim()) return "";
  return trimmed;
}

/** Empty adapter — public EN falls back to Chinese via `pick()`. */
export const emptyTranslationAdapter: TranslationAdapter = {
  async translate() {
    return "";
  },
};

const MYMEMORY_MAX_CHARS = 450;

async function fetchMyMemoryChunk(text: string): Promise<string> {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh-TW|en`,
  );
  if (!response.ok) return "";
  const payload = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  if (payload.responseStatus && payload.responseStatus !== 200) return "";
  const translated = payload.responseData?.translatedText?.trim() ?? "";
  // Reject echo / failed payloads that are still Chinese.
  if (!translated || isPrimarilyChinese(translated)) return "";
  return translated;
}

/**
 * HTTP adapter (replaceable; no vendor SDK).
 * Used by default so Preview/Production Admin can fill English on save.
 * Set VITE_DISABLE_HTTP_TRANSLATION=1 to force the empty adapter.
 */
const httpTranslationAdapter: TranslationAdapter = {
  async translate({ text }) {
    const trimmed = text.trim();
    if (!trimmed) return "";
    // Already English (or Latin-only heading) — keep as-is.
    if (!isPrimarilyChinese(trimmed)) return trimmed;
    try {
      if (trimmed.length <= MYMEMORY_MAX_CHARS) {
        return await fetchMyMemoryChunk(trimmed);
      }
      // Chunk long paragraphs on sentence-ish boundaries so MyMemory stays under limit.
      const parts: string[] = [];
      let buffer = "";
      const pieces = trimmed.split(/(?<=[。！？\n])/);
      for (const piece of pieces) {
        if ((buffer + piece).length > MYMEMORY_MAX_CHARS && buffer) {
          parts.push(buffer);
          buffer = piece;
        } else {
          buffer += piece;
        }
      }
      if (buffer) parts.push(buffer);
      const out: string[] = [];
      for (const part of parts) {
        const translated = await fetchMyMemoryChunk(part.trim());
        if (!translated) return "";
        out.push(translated);
      }
      return out.join(" ").trim();
    } catch {
      return "";
    }
  },
};

export function getTranslationAdapter(): TranslationAdapter {
  if (import.meta.env["VITE_DISABLE_HTTP_TRANSLATION"] === "1") {
    return emptyTranslationAdapter;
  }
  return httpTranslationAdapter;
}

/**
 * Fill English from Chinese. If `existingEn` is already usable English, keep it.
 * Never returns Chinese text as a successful translation.
 */
export async function englishFromChinese(zh: string, existingEn = ""): Promise<string> {
  const kept = usableEnglish(existingEn, zh);
  if (kept) return kept;
  const trimmedZh = zh.trim();
  if (!trimmedZh) return "";
  const translated = await getTranslationAdapter().translate({
    sourceLang: "zh",
    targetLang: "en",
    text: trimmedZh,
  });
  return usableEnglish(translated, trimmedZh);
}
