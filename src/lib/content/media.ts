/**
 * Video media layer.
 *
 * Two sources are supported everywhere a video can appear:
 *  - "file"    — an uploaded file (mp4/webm) served from the MediaStore
 *                (Supabase Storage today, S3 / R2 later — same interface).
 *  - "youtube" — a pasted YouTube URL of any shape; only the id is stored.
 *
 * Pages and components only ever read `VideoMedia`, so switching where files
 * are hosted never touches UI code.
 */
export type VideoMedia = {
  id: string;
  source: "file" | "youtube";
  /** File URL for "file", or the YouTube video id for "youtube". */
  src: string;
  titleEn: string;
  titleZh?: string | undefined;
  /** Optional still shown before playback. */
  poster?: string | undefined;
};

/** Accepts watch, share, mobile, shorts, embed, youtu.be, or a bare id. */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((part) => ["embed", "shorts", "live", "v"].includes(part));
      const fromPath = marker >= 0 ? (parts[marker + 1] ?? "") : "";
      return /^[\w-]{11}$/.test(fromPath) ? fromPath : null;
    }
  } catch {
    // Fall through to the regex for pasted fragments.
  }
  const match = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

/** Canonical HTTPS watch URL that satisfies the live `model_video_links` check. */
export function canonicalYouTubeUrl(input: string): string | null {
  const id = parseYouTubeId(input);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

export function youTubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Upload limits surfaced in the UI and enforced again server-side later. */
export const VIDEO_UPLOAD = {
  accept: "video/mp4,video/webm,video/quicktime",
  maxSizeMb: 50,
} as const;

/**
 * Where uploaded video files land. Implemented by the Supabase Storage
 * adapter first; an S3 / R2 adapter can drop in for an Asia-region CDN.
 */
export interface MediaStore {
  uploadVideo(file: File, path: string): Promise<{ url: string }>;
  remove(url: string): Promise<void>;
}
