import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { parseYouTubeId, VIDEO_UPLOAD } from "@/lib/content/media";

/**
 * The single video-input control used everywhere a video can be attached:
 * the Get Scouted application today, the admin model / news editors later.
 *
 * Either a file (kept client-side until the MediaStore adapter is wired) or a
 * YouTube link, which is validated and reduced to its video id on entry.
 */
export function VideoUploadField({
  name = "video",
  className = "",
}: {
  name?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"file" | "youtube">("file");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const youTubeId = parseYouTubeId(link);

  return (
    <div className={className}>
      <span className="label-xs text-muted-foreground">{t("video.attach")}</span>

      <div className="mt-2 flex gap-px bg-border">
        {(["file", "youtube"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setError(null);
            }}
            aria-pressed={mode === option}
            className={`label-xs flex-1 px-3 py-2 transition-colors ${
              mode === option
                ? "gradient-accent text-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(option === "file" ? "video.tabFile" : "video.tabLink")}
          </button>
        ))}
      </div>

      {mode === "file" ? (
        <>
          <input
            type="file"
            name={`${name}File`}
            accept={VIDEO_UPLOAD.accept}
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              if (next && next.size > VIDEO_UPLOAD.maxSizeMb * 1024 * 1024) {
                setError(t("video.tooLarge"));
                setFile(null);
                e.target.value = "";
                return;
              }
              setError(null);
              setFile(next);
            }}
            className="mt-3 w-full border border-dashed border-border p-4 text-sm"
          />
          <span className="mt-2 block text-xs text-muted-foreground">
            {t("video.fileHint")} · MP4 / WebM / MOV · ≤ {VIDEO_UPLOAD.maxSizeMb} MB
          </span>
          {file ? (
            <span className="mt-1 block text-xs text-muted-foreground">{file.name}</span>
          ) : null}
        </>
      ) : (
        <>
          <input
            type="url"
            name={`${name}Url`}
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setError(null);
            }}
            placeholder="https://www.youtube.com/watch?v=…"
            inputMode="url"
            className="mt-3 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
          />
          <span className="mt-2 block text-xs text-muted-foreground">{t("video.linkHint")}</span>
          {link && !youTubeId ? (
            <span className="mt-1 block text-xs text-destructive">{t("video.badLink")}</span>
          ) : null}
          {youTubeId ? (
            <img
              src={`https://i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              width={480}
              height={360}
              className="mt-3 aspect-video w-40 object-cover"
            />
          ) : null}
          <input type="hidden" name={`${name}YouTubeId`} value={youTubeId ?? ""} />
        </>
      )}

      {error ? <span className="mt-2 block text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
