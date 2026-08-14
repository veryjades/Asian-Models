import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export const MODEL_MEDIA_BUCKET = "model-media" as const;
export const MODEL_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export const MODEL_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
] as const;

export type MediaOwner = "models" | "portfolios";
export type ModelMediaMimeType = (typeof MODEL_MEDIA_MIME_TYPES)[number];

function isSafePathSegment(value: string): boolean {
  return value.length > 0 && value !== "." && value !== ".." && !/[\\/\0]/u.test(value);
}

function assertManagedMediaPath(path: string): void {
  const segments = path.split("/");
  if (
    segments.length < 3 ||
    (segments[0] !== "models" && segments[0] !== "portfolios") ||
    segments.some((segment) => !isSafePathSegment(segment))
  ) {
    throw new Error("Media paths must start with models/<id>/ or portfolios/<id>/.");
  }
}

/** Build only paths covered by the Phase 2 Storage policies. */
export function createModelMediaPath(owner: MediaOwner, ownerId: string, filename: string): string {
  if (owner !== "models" && owner !== "portfolios") {
    throw new Error("Media owner must be models or portfolios.");
  }
  const normalizedFilename = filename.trim();
  if (
    !isSafePathSegment(ownerId) ||
    !isSafePathSegment(normalizedFilename) ||
    normalizedFilename.startsWith(".")
  ) {
    throw new Error("Media paths must contain safe owner and filename segments.");
  }

  return `${owner}/${ownerId}/${normalizedFilename}`;
}

export function assertAllowedModelMedia(file: Pick<Blob, "size" | "type">): void {
  if (file.size > MODEL_MEDIA_MAX_BYTES) {
    throw new Error("Model media must be 50 MiB or smaller.");
  }
  if (!(MODEL_MEDIA_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Model media must be JPEG, PNG, WebP, or MP4.");
  }
}

/**
 * Browser-safe Storage boundary for the private model-media bucket. RLS is
 * still authoritative; these checks only prevent malformed client requests.
 */
export function createModelMediaAdapter(client: SupabaseClient<Database>) {
  const bucket = client.storage.from(MODEL_MEDIA_BUCKET);

  return {
    list: (owner: MediaOwner, ownerId: string) => {
      if (owner !== "models" && owner !== "portfolios") {
        throw new Error("Media owner must be models or portfolios.");
      }
      if (!isSafePathSegment(ownerId)) {
        throw new Error("Media owner id must be a safe path segment.");
      }
      return bucket.list(`${owner}/${ownerId}`, {
        sortBy: { column: "name", order: "asc" },
      });
    },
    download: (path: string) => {
      assertManagedMediaPath(path);
      return bucket.download(path);
    },
    upload: (path: string, file: Blob, options?: { cacheControl?: string; upsert?: boolean }) => {
      assertManagedMediaPath(path);
      assertAllowedModelMedia(file);
      return bucket.upload(path, file, options);
    },
    update: (path: string, file: Blob, options?: { cacheControl?: string; upsert?: boolean }) => {
      assertManagedMediaPath(path);
      assertAllowedModelMedia(file);
      return bucket.update(path, file, options);
    },
    remove: (paths: string[]) => {
      paths.forEach(assertManagedMediaPath);
      return bucket.remove(paths);
    },
  };
}
