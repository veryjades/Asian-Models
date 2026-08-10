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
  titleZh?: string;
  /** Optional still shown before playback. */
  poster?: string;
};

/** Accepts watch, youtu.be, shorts and embed URLs — or a bare id. */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^[\w-]{11}$/.test(value)) return value;
  const match = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] ?? null;
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
  maxSizeMb: 200,
} as const;

/**
 * Where uploaded video files land. Implemented by the Supabase Storage
 * adapter first; an S3 / R2 adapter can drop in for an Asia-region CDN.
 */
export interface MediaStore {
  uploadVideo(file: File, path: string): Promise<{ url: string }>;
  remove(url: string): Promise<void>;
}
