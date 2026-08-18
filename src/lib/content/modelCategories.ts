/** Admin model work-type categories (internal roster label, not public keyword slugs). */
export const MODEL_CATEGORY_OPTIONS = [
  { value: "editorial", label: "Editorial / 編輯" },
  { value: "beauty", label: "Beauty / 美妝" },
  { value: "runway", label: "Runway / 伸展台" },
  { value: "commercial", label: "Commercial / 商業" },
  { value: "fashion", label: "Fashion / 時裝" },
  { value: "print", label: "Print / 平面" },
  { value: "advertising", label: "Advertising / 廣告" },
  { value: "talent", label: "Talent / 藝人" },
  { value: "host", label: "Host / 主持人" },
  { value: "actor", label: "Actor / 演員" },
] as const;

export function normalizeModelCategory(value: string): string {
  const trimmed = value.trim().toLowerCase();
  const match = MODEL_CATEGORY_OPTIONS.find((option) => option.value === trimmed);
  return match?.value ?? trimmed;
}
