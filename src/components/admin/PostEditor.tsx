import { useEffect, useState } from "react";
import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, ImagePlus, Save, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { BlockRenderer } from "@/components/admin/BlockRenderer";
import {
  adminActions,
  type BlogPost,
  type ContentBlock,
  newBlock,
  useAdminStore,
} from "@/lib/admin-store";
import { toast } from "sonner";

interface Props {
  post?: BlogPost;
}

const MAX_TITLE = 200;
const MAX_FILE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];

const blocksHaveContent = (blocks: ContentBlock[]) =>
  blocks.some((b) => {
    if (b.type === "paragraph" || b.type === "heading" || b.type === "quote") return b.text.trim();
    if (b.type === "list") return b.items.some((i) => i.trim());
    if (b.type === "image") return !!b.src;
    if (b.type === "gallery") return b.images.length > 0;
    return false;
  });

export function PostEditor({ post }: Props) {
  const navigate = useNavigate();
  const categories = useAdminStore((s) => s.categories);

  const [title, setTitle] = useState(post?.title || "");
  const [categoryId, setCategoryId] = useState(post?.categoryId || categories[0]?.id || "");
  const [cover, setCover] = useState(post?.cover || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    post?.blocks?.length ? post.blocks : [newBlock("paragraph")],
  );
  const [dirty, setDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDirty(false);
  }, [post?.id]);

  useBlocker({
    shouldBlockFn: () => {
      if (!dirty) return false;
      return !window.confirm("Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời trang?");
    },
  });

  const markDirty = () => setDirty(true);
  const onTitle = (v: string) => { setTitle(v); markDirty(); };
  const onExcerpt = (v: string) => { setExcerpt(v); markDirty(); };
  const onCategory = (v: string) => { setCategoryId(v); markDirty(); };
  const onBlocks = (b: ContentBlock[]) => { setBlocks(b); markDirty(); };

  const validate = (forPublish: boolean) => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Tiêu đề bài viết không được để trống.";
    if (title.length > MAX_TITLE) e.title = `Tiêu đề không được vượt quá ${MAX_TITLE} ký tự.`;
    if (forPublish) {
      if (!blocksHaveContent(blocks)) e.content = "Nội dung bài viết không được để trống khi xuất bản.";
      if (!categoryId) e.categoryId = "Vui lòng chọn danh mục.";
      if (!cover) e.cover = "Vui lòng tải lên ảnh đại diện.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return toast.error("Định dạng ảnh không được hỗ trợ. Hỗ trợ JPG, JPEG, PNG.");
    if (file.size > MAX_FILE_MB * 1024 * 1024) return toast.error(`Ảnh phải nhỏ hơn ${MAX_FILE_MB}MB.`);
    const reader = new FileReader();
    reader.onload = () => { setCover(reader.result as string); markDirty(); };
    reader.readAsDataURL(file);
  };

  const save = (status: "draft" | "published") => {
    if (!validate(status === "published")) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }
    if (post) {
      adminActions.updatePost(post.id, { title, categoryId, cover, excerpt, blocks, status });
      toast.success(status === "published" ? "Đã xuất bản bài viết" : "Đã lưu thay đổi");
      setDirty(false);
    } else {
      const created = adminActions.createPost({ title, categoryId, cover, excerpt, blocks, status });
      toast.success(status === "published" ? "Đã xuất bản bài viết" : "Đã lưu nháp thành công");
      setDirty(false);
      navigate({ to: "/admin/blog/$postId", params: { postId: created.id } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/blog"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {post ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {post && <StatusBadge status={post.status} />}
              {dirty && <span className="text-amber-600">• Có thay đổi chưa lưu</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" /> Xem trước
          </Button>
          <Button variant="outline" onClick={() => save("draft")}>
            <Save className="mr-2 h-4 w-4" /> Lưu nháp
          </Button>
          <Button onClick={() => save("published")}>
            <Send className="mr-2 h-4 w-4" />
            {post?.status === "published" ? "Cập nhật" : "Xuất bản"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="space-y-4 p-6">
            <div>
              <Label htmlFor="title">Tiêu đề bài viết *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => onTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                className="mt-1.5 text-lg font-medium"
                maxLength={MAX_TITLE}
              />
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-destructive">{errors.title}</span>
                <span className="text-muted-foreground">{title.length}/{MAX_TITLE}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="excerpt">Mô tả ngắn</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => onExcerpt(e.target.value)}
                placeholder="Tóm tắt bài viết hiển thị ngoài danh sách..."
                rows={2}
                className="mt-1.5"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <Label>Nội dung bài viết *</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Thêm các khối văn bản, ảnh, danh sách... xen kẽ tùy ý. Di chuột vào từng khối để sắp xếp hoặc xóa.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{blocks.length} khối</span>
            </div>
            <div className="pl-8">
              <BlockEditor blocks={blocks} onChange={onBlocks} />
            </div>
            {errors.content && <p className="mt-2 text-xs text-destructive">{errors.content}</p>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <h3 className="text-sm font-semibold">Ảnh đại diện *</h3>
            {cover ? (
              <div className="relative overflow-hidden rounded-md border">
                <img src={cover} alt="cover" className="aspect-video w-full object-cover" />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-2 h-7 w-7"
                  onClick={() => { setCover(""); markDirty(); }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-center text-muted-foreground hover:border-primary/50 hover:bg-muted/50">
                <ImagePlus className="mb-2 h-8 w-8" />
                <span className="text-sm font-medium">Tải ảnh lên</span>
                <span className="mt-0.5 text-xs">JPG, JPEG, PNG • &lt; 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
            )}
            {errors.cover && <p className="text-xs text-destructive">{errors.cover}</p>}
          </Card>

          <Card className="space-y-3 p-5">
            <h3 className="text-sm font-semibold">Phân loại</h3>
            <div>
              <Label className="text-xs">Danh mục *</Label>
              <Select value={categoryId} onValueChange={onCategory}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId}</p>}
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Tác giả</span>
                <span className="font-medium text-foreground">{post?.author || "Admin"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">Mẹo soạn thảo</div>
            • Bấm <span className="font-medium text-foreground">+ Thêm khối</span> giữa các khối để chèn ảnh/văn bản xen kẽ.<br />
            • Ảnh có thể căn trái/giữa/phải hoặc tràn viền, kèm chú thích.<br />
            • Dùng khối <span className="font-medium text-foreground">Gallery</span> để chèn nhiều ảnh cùng lúc.<br />
            • Trong khối danh sách, nhấn <span className="font-medium text-foreground">Enter</span> để xuống dòng mới.
          </Card>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Xem trước bài viết</DialogTitle>
            <DialogDescription>Hiển thị giống như trên trang Tin tức.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {cover && <img src={cover} alt="cover" className="mb-4 aspect-video w-full rounded-md object-cover" />}
            <h2 className="text-2xl font-bold">{title || "Tiêu đề bài viết"}</h2>
            {excerpt && <p className="mt-2 text-muted-foreground">{excerpt}</p>}
            <div className="mt-6">
              <BlockRenderer blocks={blocks} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
