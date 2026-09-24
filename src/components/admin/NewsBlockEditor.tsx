import { useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import type { NewsBodyBlock } from "@/lib/content/types";

export type { NewsBodyBlock };

type BlockKind = NewsBodyBlock["type"];

export function splitPastedText(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+|\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function convertBlock(block: NewsBodyBlock, nextType: BlockKind): NewsBodyBlock {
  if (block.type === nextType) return block;
  if (nextType === "heading") {
    const content = block.type === "image" ? (block.caption ?? "") : block.content;
    return { type: "heading", content, level: 2 };
  }
  if (nextType === "text") {
    const content = block.type === "image" ? (block.caption ?? "") : block.content;
    return { type: "text", content };
  }
  return {
    type: "image",
    content: block.type === "image" ? block.content : "",
    caption: block.type === "image" ? (block.caption ?? "") : "",
  };
}

export function NewsBlockPreview({ blocks }: { blocks: NewsBodyBlock[] }) {
  if (!blocks.length) {
    return <p className="text-sm text-white/40">預覽會顯示在這裡</p>;
  }
  return (
    <div className="space-y-6 border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-wider text-white/40">閱讀預覽（小標 → 內文 → 圖）</p>
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
            {block.content || "（內文）"}
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
  const [addKind, setAddKind] = useState<BlockKind>("text");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const replaceImageIndexRef = useRef<number | null>(null);

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

  const reorderBlocks = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    onChange(next);
  };

  const changeBlockType = (index: number, nextType: BlockKind) => {
    const current = blocks[index];
    if (!current) return;
    const converted = convertBlock(current, nextType);
    const next = blocks.map((b, i) => (i === index ? converted : b));
    onChange(next);
    if (nextType === "image" && !converted.content) {
      replaceImageIndexRef.current = index;
      window.setTimeout(() => replaceImageInputRef.current?.click(), 0);
    }
  };

  const addBlock = () => {
    if (addKind === "image") {
      addImageInputRef.current?.click();
      return;
    }
    if (addKind === "heading") {
      onChange([...blocks, { type: "heading", content: "", level: 2 }]);
      return;
    }
    onChange([...blocks, { type: "text", content: "" }]);
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

  const onDragStart = (index: number, event: DragEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const onDragOverRow = (index: number, event: DragEvent<HTMLDivElement>) => {
    if (disabled || dragIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropIndex !== index) setDropIndex(index);
  };

  const onDropRow = (index: number, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled || dragIndex === null) return;
    reorderBlocks(dragIndex, index);
    setDragIndex(null);
    setDropIndex(null);
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-white/65">內文區塊</p>
        <p className="mt-1 text-xs text-white/40">
          下拉選類型後新增；可用「上移／下移」或左側拖曳把手調整順序。貼上多段文字會自動拆段。
        </p>
      </div>

      {blocks.length === 0 ? (
        <p className="border border-dashed border-white/15 px-3 py-6 text-center text-xs text-white/40">
          尚無區塊 — 下方選擇類型後按「新增」
        </p>
      ) : null}

      {blocks.map((block, index) => (
        <div
          key={index}
          onDragOver={(e) => onDragOverRow(index, e)}
          onDrop={(e) => onDropRow(index, e)}
          className={`group relative border bg-black/20 p-3 transition ${
            dropIndex === index && dragIndex !== null && dragIndex !== index
              ? "border-white/50"
              : "border-white/10"
          } ${dragIndex === index ? "opacity-60" : ""}`}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                draggable={!disabled}
                disabled={disabled}
                onDragStart={(e) => onDragStart(index, e)}
                onDragEnd={onDragEnd}
                aria-label={`拖曳第 ${index + 1} 列`}
                className="cursor-grab border border-white/15 px-2 py-1 text-xs text-white/50 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
              >
                ⋮⋮
              </button>
              <select
                value={block.type}
                disabled={disabled}
                onChange={(e) => changeBlockType(index, e.target.value as BlockKind)}
                className="border border-white/15 bg-slate-950 px-2 py-1 text-xs text-white"
                aria-label={`第 ${index + 1} 列類型`}
              >
                <option value="heading">小標</option>
                <option value="text">內文</option>
                <option value="image">圖</option>
              </select>
              {block.type === "heading" ? (
                <select
                  value={block.level ?? 2}
                  disabled={disabled}
                  onChange={(e) =>
                    updateBlock(index, { level: Number(e.target.value) === 3 ? 3 : 2 })
                  }
                  className="border border-white/15 bg-slate-950 px-2 py-1 text-xs text-white"
                >
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                </select>
              ) : null}
              <span className="text-xs text-white/35">#{index + 1}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={disabled || index === 0}
                className="border border-white/15 px-2 py-1 text-xs text-white/70 hover:bg-white/5 disabled:opacity-30"
              >
                上移
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={disabled || index === blocks.length - 1}
                className="border border-white/15 px-2 py-1 text-xs text-white/70 hover:bg-white/5 disabled:opacity-30"
              >
                下移
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                disabled={disabled}
                className="border border-red-400/30 px-2 py-1 text-xs text-red-300/80 hover:bg-red-500/10 disabled:opacity-30"
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
              placeholder="內文（中文）。可貼上多段，系統會自動分段。"
            />
          ) : (
            <div className="space-y-2">
              {block.content ? (
                <img
                  src={block.content}
                  alt="block"
                  className="max-h-48 w-full rounded object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center border border-dashed border-white/20 text-xs text-white/40">
                  尚未選擇圖片
                </div>
              )}
              <label
                className={`inline-block border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 ${disabled ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
              >
                {block.content ? "更換圖片" : "選擇圖片"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={disabled}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    void onUploadImage(file).then((url) => {
                      if (url) updateBlock(index, { content: url });
                    });
                  }}
                />
              </label>
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

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={addKind}
          disabled={disabled}
          onChange={(e) => setAddKind(e.target.value as BlockKind)}
          className="border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
          aria-label="新增區塊類型"
        >
          <option value="heading">小標</option>
          <option value="text">內文</option>
          <option value="image">圖</option>
        </select>
        <button
          type="button"
          disabled={disabled}
          onClick={addBlock}
          className="border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
        >
          新增
        </button>
        <input
          ref={addImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            void onUploadImage(file).then((url) => {
              if (url) onChange([...blocks, { type: "image", content: url, caption: "" }]);
            });
          }}
        />
        <input
          ref={replaceImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const index = replaceImageIndexRef.current;
            e.target.value = "";
            replaceImageIndexRef.current = null;
            if (!file || index === null) return;
            void onUploadImage(file).then((url) => {
              if (url) updateBlock(index, { content: url });
            });
          }}
        />
      </div>

      <NewsBlockPreview blocks={blocks} />
    </div>
  );
}
