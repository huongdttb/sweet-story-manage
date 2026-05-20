import { type ContentBlock } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks.length) return <p className="italic text-muted-foreground">Chưa có nội dung</p>;
  return (
    <div className="space-y-4">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="leading-relaxed text-foreground/90 whitespace-pre-wrap">{block.text}</p>;
    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-4 text-2xl font-bold">{block.text}</h2>
      ) : (
        <h3 className="mt-3 text-xl font-semibold">{block.text}</h3>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80">
          <p>{block.text}</p>
          {block.cite && <footer className="mt-1 text-xs not-italic text-muted-foreground">— {block.cite}</footer>}
        </blockquote>
      );
    case "list":
      return block.ordered ? (
        <ol className="list-decimal space-y-1 pl-5">
          {block.items.filter(Boolean).map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      ) : (
        <ul className="list-disc space-y-1 pl-5">
          {block.items.filter(Boolean).map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case "image":
      if (!block.src) return null;
      return (
        <figure
          className={cn(
            block.align === "left" && "mr-auto max-w-md",
            block.align === "right" && "ml-auto max-w-md",
            block.align === "center" && "mx-auto max-w-2xl",
            block.align === "full" && "w-full",
          )}
        >
          <img src={block.src} alt={block.alt} className="w-full rounded-md" />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm italic text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "gallery":
      if (!block.images.length) return null;
      return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {block.images.map((img, i) => (
            <img key={i} src={img.src} alt={img.caption} className="aspect-square w-full rounded-md object-cover" />
          ))}
        </div>
      );
    case "divider":
      return <hr className="my-6 border-border" />;
  }
}
