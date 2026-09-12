import type { ClipboardEvent } from "react";
import type { NewsBodyBlock } from "@/lib/content/types";

export type { NewsBodyBlock };

export function splitPastedText(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+|\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function NewsBlockPreview({ blocks }: { blocks: NewsBodyBlock[] }) {
  if (!blocks.length) {
    return <p className="text-sm text-white/40">預覽會顯示在這裡</p>;
  }
  return (
    <div className="space-y-6 border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-wider text-white/40">閱讀預覽（小標 → 段落 → 圖）</p>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 3 ? "h4" : "h3";
          return (
            <Tag
              key={index}
              className="font-serif text-xl font-normal tracking-tight text-white md:text-2xl"
            >
              {block.content || "（小標）"}
            </Tag>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={index} className="space-y-2">
              {block.content ? (
                <img
                  src={block.content}
                  alt={block.caption || ""}
                  className="w-full rounded object-cover"
                />
              ) : (
                <div className="flex h-28 items-center justify-center border border-dashed border-white/20 text-xs text-white/40">
                  圖片
                </div>
              )}
              {block.caption ? (
                <figcaption className="text-xs text-white/45">{block.caption}</figcaption>
              ) : null}
            </figure>
          );
        }
        return (
          <p
            key={index}
            className="font-serif text-[15px] leading-8 text-white/80 whitespace-pre-wrap md:text-base md:leading-8"
          >
            {block.content || "（段落）"}
          </p>
        );
      })}
    </div>
  );
}

export function NewsBlockEditor({
  blocks,
  onChange,
  onUploadImage,
  disabled,
}: {
  blocks: NewsBodyBlock[];
  onChange: (blocks: NewsBodyBlock[]) => void;
  onUploadImage: (file: File) => Promise<string | null>;
  disabled?: boolean;
}) {
  const addHeading = () => onChange([...blocks, { type: "heading", content: "", level: 2 }]);
  const addTextBlock = () => onChange([...blocks, { type: "text", content: "" }]);
  const addImageBlock = async (file: File) => {
    const url = await onUploadImage(file);
    if (url) onChange([...blocks, { type: "image", content: url, caption: "" }]);
  };
  const updateBlock = (index: number, patch: Partial<NewsBodyBlock>) => {
    const next = blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as NewsBodyBlock) : b));
    onChange(next);
  };
  const removeBlock = (index: number) => onChange(blocks.filter((_, i) => i !== index));
  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange(next);
  };

  const handlePasteSplit = (
    index: number,
    event: ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const pasted = event.clipboardData.getData("text/plain");
    if (!pasted || (!pasted.includes("\n") && !pasted.includes("\r"))) return;
    const parts = splitPastedText(pasted);
    if (parts.length <= 1) return;
    event.preventDefault();
    const current = blocks[index];
    if (!current || (current.type !== "text" && current.type !== "heading")) return;
    const prefix = current.content.trim();
    const firstContent = prefix ? `${prefix}\n${parts[0]}` : parts[0]!;
    const inserted: NewsBodyBlock[] = parts.slice(1).map((content) => ({ type: "text", content }));
    onChange([
      ...blocks.slice(0, index),
      { ...current, content: firstContent } as NewsBodyBlock,
      ...inserted,
      ...blocks.slice(index + 1),
    ]);
  };

  const blockLabel = (block: NewsBodyBlock, index: number) => {
    if (block.type === "heading") return `小標 #${index + 1}`;
    if (block.type === "image") return `圖片 #${index + 1}`;
    return `段落 #${index + 1}`;
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-white/65">內文區塊（編輯式排版：小標 → 段落 → 圖）</p>
        <p className="mt-1 text-xs text-white/40">
          參考知識／時尚媒體後台：用區塊組文章。貼上多段文字會自動拆段，避免擠成一團。
        </p>
      </div>
      {blocks.map((block, index) => (
        <div key={index} className="group relative border border-white/10 bg-black/20 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs text-white/40">{blockLabel(block, index)}</span>
            <div className="flex flex-wrap gap-2">
              {block.type === "heading" ? (
                <select
                  value={block.level ?? 2}
                  disabled={disabled}
                  onChange={(e) =>
                    updateBlock(index, { level: Number(e.target.value) === 3 ? 3 : 2 })
                  }
                  className="border border-white/15 bg-slate-950 px-2 py-1 text-xs text-white"
                >
                  <option value={2}>H2 小標</option>
                  <option value={3}>H3 次標</option>
                </select>
              ) : null}
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={disabled || index === 0}
                className="text-xs text-white/50 hover:text-white disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={disabled || index === blocks.length - 1}
                className="text-xs text-white/50 hover:text-white disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                disabled={disabled}
                className="text-xs text-red-300/70 hover:text-red-200 disabled:opacity-30"
              >
                刪除
              </button>
            </div>
          </div>
          {block.type === "heading" ? (
            <input
              value={block.content}
              disabled={disabled}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              onPaste={(e) => handlePasteSplit(index, e)}
              className="w-full border border-white/15 bg-slate-950 px-3 py-2 font-serif text-lg text-white outline-none focus:border-white/50"
              placeholder="例如：2.黑色牛仔褲＋薄針織衫＋T恤"
            />
          ) : block.type === "text" ? (
            <textarea
              value={block.content}
              disabled={disabled}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              onPaste={(e) => handlePasteSplit(index, e)}
              rows={Math.min(12, Math.max(4, block.content.split("\n").length + 2))}
              className="w-full resize-y border border-white/15 bg-slate-950 px-3 py-3 font-serif text-sm leading-8 text-white outline-none focus:border-white/50"
              placeholder="段落文字（中文）。可貼上多段，系統會自動分段。"
            />
          ) : (
            <div>
              {block.content ? (
                <img
                  src={block.content}
                  alt="block"
                  className="mb-2 max-h-48 w-full rounded object-cover"
                />
              ) : null}
              <input
                type="text"
                value={block.caption ?? ""}
                disabled={disabled}
                onChange={(e) => updateBlock(index, { caption: e.target.value })}
                placeholder="圖片說明（選填）"
                className="w-full border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-white/50"
              />
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={addHeading}
          className="border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
        >
          + 小標
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={addTextBlock}
          className="border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
        >
          + 段落
        </button>
        <label
          className={`border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5 ${disabled ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
        >
          + 圖片
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void addImageBlock(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <NewsBlockPreview blocks={blocks} />
    </div>
  );
}
