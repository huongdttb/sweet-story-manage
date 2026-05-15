import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Edit2, FolderTree, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { adminActions, useAdminStore } from "@/lib/admin-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = useAdminStore((s) => s.categories);
  const posts = useAdminStore((s) => s.posts);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const counts: Record<string, number> = {};
  for (const p of posts) counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return toast.error("Tên danh mục không được để trống.");
    if (name.length > 100) return toast.error("Tên danh mục tối đa 100 ký tự.");
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase()))
      return toast.error("Danh mục đã tồn tại.");
    adminActions.addCategory(name);
    setNewName("");
    toast.success("Đã thêm danh mục");
  };

  const handleEditSave = () => {
    if (!editId) return;
    const name = editName.trim();
    if (!name) return toast.error("Tên danh mục không được để trống.");
    if (name.length > 100) return toast.error("Tên danh mục tối đa 100 ký tự.");
    adminActions.updateCategory(editId, name);
    setEditId(null);
    toast.success("Đã cập nhật danh mục");
  };

  const handleDelete = (id: string) => {
    adminActions.deleteCategory(id);
    setConfirmDelete(null);
    toast.success("Đã xóa danh mục");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Danh mục bài viết</h1>
        <p className="text-sm text-muted-foreground">Phân loại nội dung Blog/Tin tức để người dùng dễ tìm kiếm.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Thêm danh mục mới
          </h3>
          <div className="space-y-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="VD: Kiến thức tuyển dụng"
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tối đa 100 ký tự</span>
              <span>{newName.length}/100</span>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!newName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Danh sách danh mục ({categories.length})</h3>
          <div className="divide-y">
            {categories.map((c) => {
              const used = counts[c.id] || 0;
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {editId === c.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave();
                          if (e.key === "Escape") setEditId(null);
                        }}
                        className="h-8 w-64"
                      />
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          {c.name}
                          {c.isDefault && <Badge variant="secondary" className="text-xs">Mặc định</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">{used} bài viết</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {editId === c.id ? (
                      <>
                        <Button size="sm" onClick={handleEditSave}>Lưu</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Hủy</Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setEditId(c.id); setEditName(c.name); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={c.isDefault}
                          onClick={() => {
                            if (used > 0) {
                              toast.error(`Danh mục đang có ${used} bài viết. Vui lòng chuyển bài viết sang danh mục khác trước khi xóa.`);
                              return;
                            }
                            setConfirmDelete(c.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
