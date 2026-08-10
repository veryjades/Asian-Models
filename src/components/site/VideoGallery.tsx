import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { youTubeEmbedUrl, youTubeThumbnail, type VideoMedia } from "@/lib/content/media";

function VideoItem({ video }: { video: VideoMedia }) {
  const { pick, t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const title = pick(video.titleEn, video.titleZh);

  if (video.source === "youtube") {
    const poster = video.poster ?? youTubeThumbnail(video.src);
    return (
      <figure className="bg-background">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {playing ? (
            <iframe
              src={`${youTubeEmbedUrl(video.src)}&autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group relative block h-full w-full"
              aria-label={`${t("video.play")} — ${title}`}
            >
              <img
                src={poster}
                alt={title}
                loading="lazy"
                width={1280}
                height={720}
                className="h-full w-full object-cover"
              />
              <span className="gradient-accent absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-foreground transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
            </button>
          )}
        </div>
        <figcaption className="label-xs px-1 py-3 text-muted-foreground">{title}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="bg-background">
      <video
        src={video.src}
        poster={video.poster}
        controls
        preload="metadata"
        playsInline
        className="aspect-video w-full bg-muted object-cover"
      />
      <figcaption className="label-xs px-1 py-3 text-muted-foreground">{title}</figcaption>
    </figure>
  );
}

export function VideoGallery({ title, videos }: { title?: string | undefined; videos?: VideoMedia[] | undefined }) {
  const { t } = useI18n();
  if (!videos || videos.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="label-xs pb-4 text-muted-foreground">{title ?? t("video.showreel")}</h2>
      <ul className="grid gap-8 md:grid-cols-2">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoItem video={video} />
          </li>
        ))}
      </ul>
    </section>
  );
}
