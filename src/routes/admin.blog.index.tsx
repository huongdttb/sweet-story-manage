import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  adminActions,
  formatDateTime,
  type PostStatus,
  useAdminStore,
} from "@/lib/admin-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog/")({
  component: BlogListPage,
});

const PAGE_SIZE = 8;

function BlogListPage() {
  const navigate = useNavigate();
  const posts = useAdminStore((s) => s.posts);
  const categories = useAdminStore((s) => s.categories);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "views">("newest");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const authors = useMemo(
    () => Array.from(new Set(posts.map((p) => p.author))),
    [posts],
  );

  const filtered = useMemo(() => {
    let list = posts;
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter((p) => p.categoryId === categoryFilter);
    if (authorFilter !== "all") list = list.filter((p) => p.author === authorFilter);
    list = [...list].sort((a, b) => {
      if (sort === "views") return b.views - a.views;
      const da = new Date(a.publishedAt || a.createdAt).getTime();
      const db = new Date(b.publishedAt || b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [posts, search, statusFilter, categoryFilter, authorFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (id: string) => {
    adminActions.deletePost(id);
    toast.success("Đã xóa bài viết");
    setConfirmDelete(null);
  };

  const handleStatusChange = (id: string, status: PostStatus) => {
    adminActions.updatePost(id, { status });
    toast.success("Đã cập nhật trạng thái");
  };

  const counts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      hidden: posts.filter((p) => p.status === "hidden").length,
    };
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Blog / Tin tức</h1>
          <p className="text-sm text-muted-foreground">
            Tạo, chỉnh sửa và quản lý toàn bộ bài viết trên website.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" /> Tạo bài viết mới
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Tổng bài viết", value: counts.all, color: "text-foreground" },
          { label: "Đã xuất bản", value: counts.published, color: "text-emerald-600" },
          { label: "Nháp", value: counts.draft, color: "text-muted-foreground" },
          { label: "Đã lên lịch", value: counts.scheduled, color: "text-amber-600" },
          { label: "Đã ẩn", value: counts.hidden, color: "text-slate-500" },
        ].map((c) => (
          <Card key={c.label} className="p-4">
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className={`mt-1 text-2xl font-bold ${c.color}`}>{c.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tiêu đề..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="hidden">Đã ẩn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Danh mục" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={authorFilter} onValueChange={(v) => { setAuthorFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Tác giả" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tác giả</SelectItem>
                {authors.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-full lg:w-40">
                <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="views">Lượt xem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[280px]">Bài viết</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>Xuất bản</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState hasFilter={search !== "" || statusFilter !== "all" || categoryFilter !== "all" || authorFilter !== "all"} />
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((post) => {
                  const cat = categories.find((c) => c.id === post.categoryId);
                  return (
                    <TableRow key={post.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                            {post.cover ? (
                              <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <FileText className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to="/admin/blog/$postId"
                              params={{ postId: post.id }}
                              className="line-clamp-2 font-medium text-foreground hover:text-primary"
                            >
                              {post.title}
                            </Link>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" /> {post.views.toLocaleString()} lượt xem
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{cat?.name || "—"}</TableCell>
                      <TableCell className="text-sm">{post.author}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(post.updatedAt)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(post.publishedAt)}</TableCell>
                      <TableCell><StatusBadge status={post.status} /></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate({ to: "/admin/blog/$postId", params: { postId: post.id } })}>
                              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            {post.status !== "published" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(post.id, "published")}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Xuất bản
                              </DropdownMenuItem>
                            )}
                            {post.status === "published" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(post.id, "hidden")}>
                                <EyeOff className="mr-2 h-4 w-4" /> Ẩn bài viết
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setConfirmDelete(post.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} bài viết
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Trước
              </Button>
              <div className="flex items-center px-3 text-sm">{page} / {totalPages}</div>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết sẽ được chuyển vào thùng rác và có thể khôi phục trong 30 ngày. Nếu bài viết đang xuất bản,
              người dùng sẽ không truy cập được nội dung này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              Xóa bài viết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold">
        {hasFilter ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết nào"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilter
          ? "Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc."
          : "Bắt đầu bằng cách tạo bài viết đầu tiên cho website của bạn."}
      </p>
      {!hasFilter && (
        <Button asChild className="mt-4">
          <Link to="/admin/blog/new"><Plus className="mr-2 h-4 w-4" /> Tạo bài viết mới</Link>
        </Button>
      )}
    </div>
  );
}
