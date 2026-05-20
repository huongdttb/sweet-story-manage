import { useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Images,
  List as ListIcon,
  ListOrdered,
  Maximize2,
  Minus,
  Plus,
  Quote,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { type ContentBlock, type ImageAlign, newBlock } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_MB = 5;

const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Định dạng ảnh không hỗ trợ.");
      return reject();
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Ảnh phải nhỏ hơn ${MAX_FILE_MB}MB.`);
      return reject();
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function BlockEditor({ blocks, onChange }: Props) {
  const update = (id: string, patch: Partial<ContentBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ContentBlock) : b)));

  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const insertAt = (idx: number, type: ContentBlock["type"]) => {
    const block = newBlock(type);
    const next = [...blocks];
    next.splice(idx, 0, block);
    onChange(next);
  };

  return (
    <div className="space-y-1">
      <AddBlockBar onAdd={(type) => insertAt(0, type)} compact />
      {blocks.map((block, idx) => (
        <div key={block.id}>
          <BlockShell
            block={block}
            onUpdate={(patch) => update(block.id, patch)}
            onRemove={() => remove(block.id)}
            onMoveUp={() => move(block.id, -1)}
            onMoveDown={() => move(block.id, 1)}
            isFirst={idx === 0}
            isLast={idx === blocks.length - 1}
          />
          <AddBlockBar onAdd={(type) => insertAt(idx + 1, type)} />
        </div>
      ))}
      {blocks.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center text-sm text-muted-foreground">
          Chưa có nội dung. Bấm <span className="font-medium text-foreground">+</span> ở trên để thêm khối đầu tiên.
        </div>
      )}
    </div>
  );
}

function BlockShell({
  block,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: ContentBlock;
  onUpdate: (patch: Partial<ContentBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="group relative rounded-lg border border-transparent bg-background p-3 transition-colors hover:border-border hover:bg-muted/30">
      <div className="absolute -left-9 top-3 flex flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={isFirst} onClick={onMoveUp}>
          <ArrowUp className="h-3 w-3" />
        </Button>
        <div className="flex h-6 w-6 cursor-grab items-center justify-center text-muted-foreground">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={isLast} onClick={onMoveDown}>
          <ArrowDown className="h-3 w-3" />
        </Button>
      </div>
      <div className="absolute -right-2 -top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-background text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <BlockBody block={block} onUpdate={onUpdate} />
    </div>
  );
}

function BlockBody({
  block,
  onUpdate,
}: {
  block: ContentBlock;
  onUpdate: (patch: Partial<ContentBlock>) => void;
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <Textarea
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Nhập đoạn văn..."
          rows={3}
          className="resize-none border-0 bg-transparent px-1 focus-visible:ring-0"
        />
      );
    case "heading":
      return (
        <div className="flex items-center gap-2">
          <select
            value={block.level}
            onChange={(e) => onUpdate({ level: Number(e.target.value) as 2 | 3 })}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <Input
            value={block.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Tiêu đề mục..."
            className={cn(
              "border-0 bg-transparent font-bold focus-visible:ring-0",
              block.level === 2 ? "text-2xl" : "text-xl",
            )}
          />
        </div>
      );
    case "quote":
      return (
        <div className="border-l-4 border-primary pl-4">
          <Textarea
            value={block.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Nhập trích dẫn..."
            rows={2}
            className="resize-none border-0 bg-transparent px-0 text-base italic focus-visible:ring-0"
          />
          <Input
            value={block.cite || ""}
            onChange={(e) => onUpdate({ cite: e.target.value })}
            placeholder="Nguồn (tùy chọn)"
            className="mt-1 border-0 bg-transparent px-0 text-xs text-muted-foreground focus-visible:ring-0"
          />
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={!block.ordered ? "secondary" : "ghost"}
              className="h-7 gap-1.5 text-xs"
              onClick={() => onUpdate({ ordered: false })}
            >
              <ListIcon className="h-3.5 w-3.5" /> Bullet
            </Button>
            <Button
              size="sm"
              variant={block.ordered ? "secondary" : "ghost"}
              className="h-7 gap-1.5 text-xs"
              onClick={() => onUpdate({ ordered: true })}
            >
              <ListOrdered className="h-3.5 w-3.5" /> Số thứ tự
            </Button>
          </div>
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-right text-sm text-muted-foreground">
                {block.ordered ? `${i + 1}.` : "•"}
              </span>
              <Input
                value={item}
                onChange={(e) => {
                  const items = [...block.items];
                  items[i] = e.target.value;
                  onUpdate({ items });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const items = [...block.items];
                    items.splice(i + 1, 0, "");
                    onUpdate({ items });
                  }
                  if (e.key === "Backspace" && item === "" && block.items.length > 1) {
                    e.preventDefault();
                    onUpdate({ items: block.items.filter((_, idx) => idx !== i) });
                  }
                }}
                placeholder="Mục danh sách..."
                className="border-0 bg-transparent focus-visible:ring-0"
              />
              {block.items.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => onUpdate({ items: block.items.filter((_, idx) => idx !== i) })}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={() => onUpdate({ items: [...block.items, ""] })}
          >
            <Plus className="h-3 w-3" /> Thêm mục
          </Button>
        </div>
      );
    case "image":
      return <ImageBlockBody block={block} onUpdate={onUpdate} />;
    case "gallery":
      return <GalleryBlockBody block={block} onUpdate={onUpdate} />;
    case "divider":
      return (
        <div className="flex items-center justify-center py-2">
          <div className="h-px w-full bg-border" />
          <span className="px-3 text-xs text-muted-foreground">Phân cách</span>
          <div className="h-px w-full bg-border" />
        </div>
      );
  }
}

function ImageBlockBody({
  block,
  onUpdate,
}: {
  block: Extract<ContentBlock, { type: "image" }>;
  onUpdate: (patch: Partial<Extract<ContentBlock, { type: "image" }>>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const aligns: { value: ImageAlign; icon: typeof AlignLeft; label: string }[] = [
    { value: "left", icon: AlignLeft, label: "Trái" },
    { value: "center", icon: AlignCenter, label: "Giữa" },
    { value: "right", icon: AlignRight, label: "Phải" },
    { value: "full", icon: Maximize2, label: "Tràn viền" },
  ];

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const src = await readFile(file);
      onUpdate({ src, alt: file.name.replace(/\.[^.]+$/, "") });
    } catch {}
  };

  return (
    <div className="space-y-2">
      {block.src ? (
        <div
          className={cn(
            "relative",
            block.align === "left" && "mr-auto max-w-md",
            block.align === "right" && "ml-auto max-w-md",
            block.align === "center" && "mx-auto max-w-xl",
            block.align === "full" && "w-full",
          )}
        >
          <img src={block.src} alt={block.alt} className="w-full rounded-md border" />
          <div className="absolute right-2 top-2 flex gap-1 rounded-md bg-background/95 p-1 shadow-sm">
            {aligns.map((a) => (
              <Button
                key={a.value}
                size="icon"
                variant={block.align === a.value ? "secondary" : "ghost"}
                className="h-7 w-7"
                title={a.label}
                onClick={() => onUpdate({ align: a.value })}
              >
                <a.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
            <div className="mx-1 h-7 w-px bg-border" />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => inputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdate({ src: "" })}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/30 py-10 text-center text-muted-foreground hover:border-primary/50">
            <ImageIcon className="mb-2 h-7 w-7" />
            <span className="text-sm font-medium">Bấm để tải ảnh lên</span>
            <span className="text-xs">JPG, PNG, WEBP • &lt; 5MB</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">hoặc dán URL</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Input
            placeholder="https://..."
            value={block.src}
            onChange={(e) => onUpdate({ src: e.target.value })}
          />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {block.src && (
        <Input
          value={block.caption}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Chú thích ảnh (tùy chọn)..."
          className="border-0 bg-transparent text-center text-sm italic text-muted-foreground focus-visible:ring-0"
        />
      )}
    </div>
  );
}

function GalleryBlockBody({
  block,
  onUpdate,
}: {
  block: Extract<ContentBlock, { type: "gallery" }>;
  onUpdate: (patch: Partial<Extract<ContentBlock, { type: "gallery" }>>) => void;
}) {
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const added: { src: string; caption: string }[] = [];
    for (const f of Array.from(files)) {
      try {
        const src = await readFile(f);
        added.push({ src, caption: "" });
      } catch {}
    }
    onUpdate({ images: [...block.images, ...added] });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {block.images.map((img, i) => (
          <div key={i} className="group/img relative aspect-square overflow-hidden rounded-md border">
            <img src={img.src} alt={img.caption} className="h-full w-full object-cover" />
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover/img:opacity-100"
              onClick={() => onUpdate({ images: block.images.filter((_, idx) => idx !== i) })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground hover:border-primary/50">
          <Plus className="h-5 w-5" />
          <span className="mt-1 text-xs">Thêm ảnh</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">Có thể chọn nhiều ảnh cùng lúc. Ảnh sẽ hiển thị dạng lưới.</p>
    </div>
  );
}

function AddBlockBar({
  onAdd,
  compact,
}: {
  onAdd: (type: ContentBlock["type"]) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("group/add relative flex justify-center", compact ? "py-1" : "py-1")}>
      <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-border opacity-0 transition-opacity group-hover/add:opacity-100" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-6 gap-1 rounded-full border-dashed bg-background px-2.5 text-xs text-muted-foreground opacity-0 transition-opacity group-hover/add:opacity-100 data-[state=open]:opacity-100"
          >
            <Plus className="h-3 w-3" /> Thêm khối
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Văn bản</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onAdd("paragraph")}>
            <Type className="mr-2 h-4 w-4" /> Đoạn văn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAdd("heading")}>
            <Heading2 className="mr-2 h-4 w-4" /> Tiêu đề
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAdd("quote")}>
            <Quote className="mr-2 h-4 w-4" /> Trích dẫn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAdd("list")}>
            <ListIcon className="mr-2 h-4 w-4" /> Danh sách
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Hình ảnh</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onAdd("image")}>
            <ImageIcon className="mr-2 h-4 w-4" /> Ảnh đơn (có caption + căn lề)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAdd("gallery")}>
            <Images className="mr-2 h-4 w-4" /> Thư viện ảnh (gallery)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAdd("divider")}>
            <Minus className="mr-2 h-4 w-4" /> Đường phân cách
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Helper avoid unused import warnings for icons declared but conditionally used
void Heading3;
