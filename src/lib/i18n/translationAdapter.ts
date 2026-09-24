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

const HAN_RE = /[\u4e00-\u9fff]/;

/** Any Han character — fashion titles mix brands + Chinese and still need translation. */
export function containsHan(text: string): boolean {
  return HAN_RE.test(text);
}

/**
 * True when Han characters dominate Latin letters.
 * Used to spot Chinese leftovers wrongly stored in EN fields.
 */
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

/**
 * Prefer stored English only when it is non-empty and has no Han characters.
 * Mixed ZH/EN brand titles must not count as English (they need translation).
 */
export function usableEnglish(en: string | null | undefined, zhFallback = ""): string {
  const trimmed = en?.trim() ?? "";
  if (!trimmed) return "";
  if (containsHan(trimmed)) return "";
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
  // Reject echo / failed payloads that still contain Han.
  if (!translated || containsHan(translated)) return "";
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
    // Latin-only (or no Han) — keep as-is. Any Han → always translate.
    // Do NOT use "primarily Chinese" here: "Irina Shayk於Versace…" has more
    // Latin letters than Han and was wrongly skipped, leaving empty EN fields.
    if (!containsHan(trimmed)) return trimmed;
    try {
      if (trimmed.length <= MYMEMORY_MAX_CHARS) {
        const once = await fetchMyMemoryChunk(trimmed);
        if (once) return once;
        // One retry for transient quota/network blips.
        return await fetchMyMemoryChunk(trimmed);
      }
      const parts: string[] = [];
      let buffer = "";
      const pieces = trimmed.split(/(?<=[。！？；;\n])/);
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
        const chunk = part.trim();
        if (!chunk) continue;
        if (!containsHan(chunk)) {
          out.push(chunk);
          continue;
        }
        let translated = await fetchMyMemoryChunk(chunk);
        if (!translated) translated = await fetchMyMemoryChunk(chunk);
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
 * Never returns text that still contains Han characters.
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
