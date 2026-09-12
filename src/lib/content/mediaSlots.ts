/**
 * Public media slot geometry (D-031).
 * Uploads that do not match a slot are center-cropped with object-fit: cover.
 * Do not introduce ad-hoc aspect ratios in pages.
 */
export type MediaFit = "cover" | "contain";

export type PublicMediaSlot = {
  id: string;
  labelEn: string;
  labelZh: string;
  aspectRatio: string;
  width: number;
  height: number;
  fit: MediaFit;
  objectPosition: "50% 50%";
  maxBytes: number;
};

const IMAGE_MAX = 10 * 1024 * 1024;
const VIDEO_MAX = 50 * 1024 * 1024;

export const PUBLIC_MEDIA_SLOTS = {
  hero: {
    id: "hero",
    labelEn: "Homepage hero",
    labelZh: "首頁主視覺",
    aspectRatio: "16 / 9",
    width: 1920,
    height: 1080,
    fit: "cover",
    objectPosition: "50% 50%",
    maxBytes: IMAGE_MAX,
  },
  modelCard: {
    id: "modelCard",
    labelEn: "Model card / hover",
    labelZh: "模特卡片／第二張",
    aspectRatio: "2 / 3",
    width: 800,
    height: 1200,
    fit: "cover",
    objectPosition: "50% 50%",
    maxBytes: IMAGE_MAX,
  },
  modelProfile: {
    id: "modelProfile",
    labelEn: "Model profile portrait",
    labelZh: "模特個人檔主圖",
    aspectRatio: "2 / 3",
    width: 800,
    height: 1200,
    fit: "cover",
    objectPosition: "50% 50%",
    maxBytes: IMAGE_MAX,
  },
  modelGallery: {
    id: "modelGallery",
    labelEn: "Model gallery / digitals",
    labelZh: "作品集／生活照",
    aspectRatio: "2 / 3",
    width: 800,
    height: 1200,
    fit: "cover",
    objectPosition: "50% 50%",
    maxBytes: IMAGE_MAX,
  },
  newsCover: {
    id: "newsCover",
    labelEn: "News cover",
    labelZh: "新聞封面",
    aspectRatio: "3 / 2",
    width: 1600,
    height: 1067,
    fit: "cover",
    objectPosition: "50% 50%",
    maxBytes: IMAGE_MAX,
  },
  videoFrame: {
    id: "videoFrame",
    labelEn: "Showreel / uploaded video",
    labelZh: "動態作品／上傳影片",
    aspectRatio: "16 / 9",
    width: 1280,
    height: 720,
    fit: "cover",
    objectPosition: "50% 50%",
    maxBytes: VIDEO_MAX,
  },
} as const satisfies Record<string, PublicMediaSlot>;

export type PublicMediaSlotId = keyof typeof PUBLIC_MEDIA_SLOTS;

export const MODEL_IMAGE_MAX_BYTES = IMAGE_MAX;
export const MODEL_VIDEO_MAX_BYTES = VIDEO_MAX;

export function slotHint(slot: PublicMediaSlot): string {
  return `${slot.aspectRatio.replace(" / ", ":")} · ${slot.width}×${slot.height} · center crop · ≤ ${Math.round(slot.maxBytes / (1024 * 1024))} MB`;
}

export function agencySlotProps(slot: PublicMediaSlot) {
  return {
    aspectRatio: slot.aspectRatio,
    width: slot.width,
    height: slot.height,
    fit: slot.fit,
    objectPosition: slot.objectPosition,
  } as const;
}
