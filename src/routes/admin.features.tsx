import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cpu, Pencil, Plus, Search, Sparkles, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export const Route = createFileRoute("/admin/features")({
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Tính năng & Models AI</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách dùng chung. Cập nhật tại đây sẽ tự đồng bộ vào tất cả các gói trong Bảng giá.
        </p>
      </div>

      <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
        <div className="text-sm text-muted-foreground">
          Khi đổi tên một tính năng/model, tất cả các gói đang tick chọn sẽ tự cập nhật. Xóa sẽ gỡ khỏi mọi gói.
        </div>
      </Card>

      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Tính năng</TabsTrigger>
          <TabsTrigger value="models">Models AI</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-4">
          <FeatureCatalogPanel />
        </TabsContent>
        <TabsContent value="models" className="mt-4">
          <AiModelPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeatureCatalogPanel() {
  const items = useAdminStore((s) => s.featureCatalog);
  const plans = useAdminStore((s) => s.plans);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string } | null>(null);

  const usage = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of plans) {
      for (const fid of p.catalogFeatureIds) {
        if (!map.has(fid)) map.set(fid, []);
        map.get(fid)!.push(p.name || "(chưa đặt tên)");
      }
    }
    return map;
  }, [plans]);

  const filtered = items.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  const add = () => {
    const v = name.trim();
    if (!v) return;
    if (v.length > 200) return toast.error("Tối đa 200 ký tự.");
    if (items.some((f) => f.name.toLowerCase() === v.toLowerCase()))
      return toast.error("Tính năng đã tồn tại.");
    adminActions.addFeatureCatalog(v);
    setName("");
    toast.success("Đã thêm tính năng");
  };

  const saveEdit = (id: string) => {
    const v = editingName.trim();
    if (!v) return toast.error("Tên không được trống.");
    if (v.length > 200) return toast.error("Tối đa 200 ký tự.");
    adminActions.updateFeatureCatalog(id, v);
    setEditingId(null);
    toast.success("Đã cập nhật, đồng bộ tới các gói liên quan");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Thêm tính năng mới, vd: Tích hợp Slack"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            maxLength={200}
          />
          <Button onClick={add}>
            <Plus className="mr-1 h-4 w-4" /> Thêm
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tính năng..."
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng: <span className="font-semibold text-foreground">{items.length}</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-12 gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
          <div className="col-span-6">Tên tính năng</div>
          <div className="col-span-4">Đang dùng bởi gói</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Không có tính năng nào phù hợp.
          </div>
        )}
        {filtered.map((f) => {
          const planNames = usage.get(f.id) || [];
          const isEditing = editingId === f.id;
          return (
            <div key={f.id} className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 last:border-b-0">
              <div className="col-span-6">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      maxLength={200}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(f.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <Button size="icon" variant="ghost" onClick={() => saveEdit(f.id)}>
                      <Check className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-medium">{f.name}</span>
                )}
              </div>
              <div className="col-span-4 flex flex-wrap gap-1">
                {planNames.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Chưa gói nào dùng</span>
                ) : (
                  planNames.map((n, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{n}</Badge>
                  ))
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-1">
                {!isEditing && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(f.id);
                      setEditingName(f.name);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDel({ id: f.id, name: f.name })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tính năng "{confirmDel?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Tính năng này sẽ bị gỡ khỏi tất cả các gói đang chọn nó. Hành động không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDel) {
                  adminActions.deleteFeatureCatalog(confirmDel.id);
                  toast.success("Đã xóa và đồng bộ");
                  setConfirmDel(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AiModelPanel() {
  const models = useAdminStore((s) => s.aiModels);
  const plans = useAdminStore((s) => s.plans);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string } | null>(null);

  const usage = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of plans) {
      for (const mid of p.allowedModelIds) {
        if (!map.has(mid)) map.set(mid, []);
        map.get(mid)!.push(p.name || "(chưa đặt tên)");
      }
    }
    return map;
  }, [plans]);

  const filtered = models.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  const add = () => {
    const v = name.trim();
    if (!v) return;
    if (models.some((m) => m.name.toLowerCase() === v.toLowerCase()))
      return toast.error("Model đã tồn tại.");
    adminActions.addAiModel(v);
    setName("");
    toast.success("Đã thêm model");
  };

  const saveEdit = (id: string) => {
    const v = editingName.trim();
    if (!v) return toast.error("Tên không được trống.");
    adminActions.updateAiModel(id, v);
    setEditingId(null);
    toast.success("Đã cập nhật, đồng bộ tới các gói liên quan");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Thêm model mới, vd: o1-preview"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          />
          <Button onClick={add}>
            <Plus className="mr-1 h-4 w-4" /> Thêm
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm model..."
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng: <span className="font-semibold text-foreground">{models.length}</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-12 gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
          <div className="col-span-6">Model</div>
          <div className="col-span-4">Đang dùng bởi gói</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Không có model nào phù hợp.
          </div>
        )}
        {filtered.map((m) => {
          const planNames = usage.get(m.id) || [];
          const isEditing = editingId === m.id;
          return (
            <div key={m.id} className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 last:border-b-0">
              <div className="col-span-6">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(m.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <Button size="icon" variant="ghost" onClick={() => saveEdit(m.id)}>
                      <Check className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{m.name}</span>
                  </div>
                )}
              </div>
              <div className="col-span-4 flex flex-wrap gap-1">
                {planNames.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Chưa gói nào dùng</span>
                ) : (
                  planNames.map((n, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{n}</Badge>
                  ))
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-1">
                {!isEditing && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(m.id);
                      setEditingName(m.name);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDel({ id: m.id, name: m.name })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa model "{confirmDel?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Model này sẽ bị gỡ khỏi tất cả các gói đang chọn nó. Hành động không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDel) {
                  adminActions.deleteAiModel(confirmDel.id);
                  toast.success("Đã xóa và đồng bộ");
                  setConfirmDel(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
