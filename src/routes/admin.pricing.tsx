import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  adminActions,
  formatCurrency,
  newPlan,
  type PricingPlan,
  useAdminStore,
} from "@/lib/admin-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pricing")({
  component: PricingPage,
});

const cycleLabel: Record<PricingPlan["cycle"], string> = {
  month: "tháng",
  quarter: "quý",
  year: "năm",
};

function PricingPage() {
  const plans = useAdminStore((s) => s.plans).slice().sort((a, b) => a.order - b.order);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PricingPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...plans];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    adminActions.reorderPlans(next.map((p, i) => ({ ...p, order: i + 1 })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Bảng giá</h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình các gói dịch vụ hiển thị trong section Bảng giá trên Landing Page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" /> Xem trước
          </Button>
          <Button onClick={() => setEditing(newPlan())}>
            <Plus className="mr-2 h-4 w-4" /> Thêm gói mới
          </Button>
        </div>
      </div>

      {plans.length >= 6 && (
        <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <Sparkles className="mt-0.5 h-4 w-4 text-amber-600" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            Số lượng gói khuyến nghị là 3–5 để người dùng dễ ra quyết định.
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {plans.map((plan, idx) => (
          <Card key={plan.id} className={`p-5 ${plan.highlighted ? "ring-2 ring-primary" : ""}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => move(idx, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <span className="text-center text-xs text-muted-foreground">#{idx + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === plans.length - 1} onClick={() => move(idx, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{plan.name || <span className="italic text-muted-foreground">Chưa đặt tên</span>}</h3>
                  {plan.highlighted && (
                    <Badge className="gap-1"><Star className="h-3 w-3" /> Nổi bật</Badge>
                  )}
                  {!plan.active && <Badge variant="secondary">Đã tắt</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{plan.description || "Chưa có mô tả"}</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
                  {plan.price !== "Liên hệ" && <span className="text-sm text-muted-foreground">/ {cycleLabel[plan.cycle]}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{plan.features.length} quyền lợi</span>
                  {plan.ctaLabel && <span>CTA: <span className="font-medium text-foreground">{plan.ctaLabel}</span></span>}
                </div>
              </div>

              <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Hiển thị</Label>
                  <Switch
                    checked={plan.active}
                    onCheckedChange={(v) => adminActions.upsertPlan({ ...plan, active: v })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(plan)}>Chỉnh sửa</Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(plan)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <PlanEditorDialog plan={editing} onClose={() => setEditing(null)} existingCount={plans.length} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói "{confirmDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Nếu gói này đang liên kết với subscription thực tế, hệ thống sẽ chỉ ẩn thay vì xóa.
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  adminActions.deletePlan(confirmDelete.id);
                  toast.success("Đã xóa gói");
                  setConfirmDelete(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PreviewDialog open={showPreview} onClose={() => setShowPreview(false)} plans={plans.filter((p) => p.active)} />
    </div>
  );
}

function PlanEditorDialog({
  plan,
  onClose,
  existingCount,
}: {
  plan: PricingPlan | null;
  onClose: () => void;
  existingCount: number;
}) {
  const [draft, setDraft] = useState<PricingPlan | null>(null);

  // sync when plan changes
  if (plan && (!draft || draft.id !== plan.id)) {
    setDraft({ ...plan });
  }
  if (!plan && draft) {
    setDraft(null);
  }

  if (!draft) return null;

  const update = <K extends keyof PricingPlan>(key: K, value: PricingPlan[K]) =>
    setDraft({ ...draft, [key]: value });

  const save = () => {
    if (!draft.name.trim()) return toast.error("Tên gói không được để trống.");
    if (draft.name.length > 50) return toast.error("Tên gói tối đa 50 ký tự.");
    if (draft.price !== "Liên hệ" && (draft.price === "" || isNaN(Number(draft.price)))) {
      return toast.error("Giá không hợp lệ. Chỉ nhận số hoặc giá trị 'Liên hệ'.");
    }
    if (draft.features.filter((f) => f.text.trim()).length === 0)
      return toast.error("Mỗi gói cần tối thiểu 1 quyền lợi.");
    if (draft.features.some((f) => f.text.length > 200))
      return toast.error("Mỗi quyền lợi tối đa 200 ký tự.");
    if (draft.ctaLabel.trim() && !draft.ctaLink.trim())
      return toast.error("Khi có CTA, link CTA là bắt buộc.");

    const toSave = {
      ...draft,
      features: draft.features.filter((f) => f.text.trim()),
      order: draft.order === 999 ? existingCount + 1 : draft.order,
    };
    adminActions.upsertPlan(toSave);
    toast.success("Đã lưu gói");
    onClose();
  };

  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan?.name ? `Chỉnh sửa: ${plan.name}` : "Thêm gói mới"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Tên gói *</Label>
              <Input value={draft.name} onChange={(e) => update("name", e.target.value)} maxLength={50} placeholder="VD: Professional" className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">{draft.name.length}/50 ký tự</p>
            </div>
            <div>
              <Label>Giá *</Label>
              <Input
                value={draft.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder='Số hoặc "Liên hệ"'
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Đơn vị tiền tệ</Label>
              <Select value={draft.currency} onValueChange={(v) => update("currency", v as "VND" | "USD")}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chu kỳ thanh toán</Label>
              <Select value={draft.cycle} onValueChange={(v) => update("cycle", v as PricingPlan["cycle"])}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="quarter">Quý</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Mô tả ngắn</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="Mô tả ngắn gọn dành cho ai..."
              className="mt-1.5"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Quyền lợi *</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => update("features", [...draft.features, { id: Math.random().toString(36).slice(2), text: "", included: true }])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm dòng
              </Button>
            </div>
            <div className="space-y-2">
              {draft.features.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update("features", draft.features.map((x) => x.id === f.id ? { ...x, included: !x.included } : x))}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${f.included ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {f.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </button>
                  <Input
                    value={f.text}
                    onChange={(e) => update("features", draft.features.map((x) => x.id === f.id ? { ...x, text: e.target.value } : x))}
                    placeholder={`Quyền lợi #${i + 1}`}
                    maxLength={200}
                  />
                  <Button size="icon" variant="ghost" onClick={() => update("features", draft.features.filter((x) => x.id !== f.id))}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nhãn CTA</Label>
              <Input value={draft.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="VD: Bắt đầu ngay" className="mt-1.5" />
            </div>
            <div>
              <Label>Link CTA</Label>
              <Input value={draft.ctaLink} onChange={(e) => update("ctaLink", e.target.value)} placeholder="/signup" className="mt-1.5" />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={draft.highlighted} onCheckedChange={(v) => update("highlighted", v)} />
              <div>
                <div className="text-sm font-medium">Đánh dấu nổi bật</div>
                <div className="text-xs text-muted-foreground">Gói sẽ hiển thị nổi bật trên landing page</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={draft.active} onCheckedChange={(v) => update("active", v)} />
              <div>
                <div className="text-sm font-medium">Bật gói</div>
                <div className="text-xs text-muted-foreground">Tắt để ẩn khỏi landing page</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={save}>Lưu gói</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDialog({ open, onClose, plans }: { open: boolean; onClose: () => void; plans: PricingPlan[] }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Xem trước Bảng giá</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-muted/40 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-xl border bg-background p-6 ${p.highlighted ? "border-primary shadow-lg ring-2 ring-primary" : ""}`}
              >
                {p.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Phổ biến nhất</Badge>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{formatCurrency(p.price, p.currency)}</span>
                  {p.price !== "Liên hệ" && <span className="text-sm text-muted-foreground">/ {cycleLabel[p.cycle]}</span>}
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-2">
                      {f.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground line-through"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                {p.ctaLabel && (
                  <Button className="mt-6 w-full" variant={p.highlighted ? "default" : "outline"}>
                    {p.ctaLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
