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

/** Default: no paid provider. Empty English lets public EN fall back to Chinese. */
export const emptyTranslationAdapter: TranslationAdapter = {
  async translate() {
    return "";
  },
};

/** Dev-only HTTP adapter (replaceable; no vendor SDK). */
const devHttpTranslationAdapter: TranslationAdapter = {
  async translate({ text }) {
    if (!text.trim()) return "";
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh-TW|en`,
      );
      if (!response.ok) return "";
      const payload = (await response.json()) as {
        responseData?: { translatedText?: string };
      };
      return payload.responseData?.translatedText?.trim() ?? "";
    } catch {
      return "";
    }
  },
};

export function getTranslationAdapter(): TranslationAdapter {
  return import.meta.env.DEV ? devHttpTranslationAdapter : emptyTranslationAdapter;
}

export async function englishFromChinese(zh: string, existingEn = ""): Promise<string> {
  const trimmedEn = existingEn.trim();
  if (trimmedEn) return trimmedEn;
  const trimmedZh = zh.trim();
  if (!trimmedZh) return "";
  const translated = await getTranslationAdapter().translate({
    sourceLang: "zh",
    targetLang: "en",
    text: trimmedZh,
  });
  return translated.trim();
}
