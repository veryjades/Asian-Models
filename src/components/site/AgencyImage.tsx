import type { CSSProperties, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type AgencyImageFit = "contain" | "cover";

export type AgencyImageSource = {
  media: string;
  srcSet: string;
  sizes?: string;
};

type AgencyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string;
  alt: string;
  /** CSS ratio such as "16 / 9". Omit for an intrinsic image. */
  aspectRatio?: string;
  /** Use `cover` only after the asset's focal safe area has been reviewed. */
  fit?: AgencyImageFit;
  /** Focal point, for example "50% 20%". */
  objectPosition?: string;
  /** Optional art-directed source for a narrower viewport. */
  responsiveSources?: AgencyImageSource[];
  containerClassName?: string;
};

/**
 * Presentation boundary for bundled prototype media and future CMS media.
 * It deliberately keeps crop behaviour with the asset, not hard-coded in a page.
 */
export function AgencyImage({
  src,
  alt,
  aspectRatio,
  fit = "contain",
  objectPosition = "50% 50%",
  responsiveSources,
  containerClassName,
  className,
  style,
  ...imgProps
}: AgencyImageProps) {
  const frameStyle = aspectRatio ? ({ aspectRatio } as CSSProperties) : undefined;
  const imageStyle = { objectFit: fit, objectPosition, ...style } as CSSProperties;

  return (
    <div className={cn("overflow-hidden bg-muted", containerClassName)} style={frameStyle}>
      <picture className="block h-full w-full">
        {responsiveSources?.map((source) => (
          <source
            key={source.media}
            media={source.media}
            srcSet={source.srcSet}
            sizes={source.sizes}
          />
        ))}
        <img
          src={src}
          alt={alt}
          className={cn("block h-full w-full", className)}
          style={imageStyle}
          {...imgProps}
        />
      </picture>
    </div>
  );
}
