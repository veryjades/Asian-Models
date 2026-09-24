/** News cover focal helpers — durable via cover URL query when DB column is absent. */

const DEFAULT_NEWS_COVER_POSITION = "50% 15%";

export function normalizeObjectPosition(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (/^[\d.]+%\s+[\d.]+%$/.test(trimmed)) return trimmed;
  return DEFAULT_NEWS_COVER_POSITION;
}

export function parseObjectPosition(value: string): { x: number; y: number } {
  const match = normalizeObjectPosition(value).match(/^([\d.]+)%\s+([\d.]+)%$/);
  if (!match) return { x: 50, y: 15 };
  return { x: Number(match[1]), y: Number(match[2]) };
}

export function formatObjectPosition(x: number, y: number): string {
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
  return `${clamp(x)}% ${clamp(y)}%`;
}

/** Embed focal point as `fp=X-Y` query on the public cover URL. */
export function withCoverFocalParam(coverUrl: string, position: string): string {
  if (!coverUrl || coverUrl.startsWith("blob:")) return coverUrl;
  try {
    const url = new URL(coverUrl);
    const { x, y } = parseObjectPosition(position);
    url.searchParams.set("fp", `${x}-${y}`);
    return url.toString();
  } catch {
    return coverUrl;
  }
}

/** Read focal from `fp` query and return a clean image src (fp removed). */
export function readCoverFocal(coverUrl: string | null | undefined): {
  src: string;
  objectPosition: string;
} {
  if (!coverUrl) {
    return { src: "", objectPosition: DEFAULT_NEWS_COVER_POSITION };
  }
  try {
    const url = new URL(coverUrl);
    const fp = url.searchParams.get("fp");
    if (fp) {
      const [xRaw, yRaw] = fp.split("-");
      const x = Number(xRaw);
      const y = Number(yRaw);
      url.searchParams.delete("fp");
      return {
        src: url.toString(),
        objectPosition: formatObjectPosition(
          Number.isFinite(x) ? x : 50,
          Number.isFinite(y) ? y : 15,
        ),
      };
    }
  } catch {
    // not an absolute URL — return as-is
  }
  return { src: coverUrl, objectPosition: DEFAULT_NEWS_COVER_POSITION };
}

export { DEFAULT_NEWS_COVER_POSITION };
