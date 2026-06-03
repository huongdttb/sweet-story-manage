import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  HardDrive,
  Layers,
  Plus,
  Settings2,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  formatQuota,
  formatTokens,
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
            Cấu hình hạn mức, tính năng AI và quyền lợi cho từng gói dịch vụ.
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
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex flex-row gap-1 lg:flex-col">
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => move(idx, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <span className="hidden text-center text-xs text-muted-foreground lg:block">#{idx + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === plans.length - 1} onClick={() => move(idx, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{plan.name || <span className="italic text-muted-foreground">Chưa đặt tên</span>}</h3>
                  {plan.highlighted && (
                    <Badge className="gap-1"><Star className="h-3 w-3" /> Nổi bật</Badge>
                  )}
                  {!plan.active && <Badge variant="secondary">Đã tắt</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{plan.description || "Chưa có mô tả"}</p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
                  {plan.price !== "Liên hệ" && <span className="text-sm text-muted-foreground">/ {cycleLabel[plan.cycle]}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3 lg:grid-cols-6">
                  <QuotaPill icon={<Zap className="h-3.5 w-3.5" />} label="Token AI" value={formatTokens(plan.tokenQuota) + (plan.tokenQuota === 0 ? "" : "")} unlimited={plan.tokenQuota === 0} />
                  <QuotaPill icon={<Users className="h-3.5 w-3.5" />} label="Người dùng" value={formatQuota(plan.userQuota)} unlimited={plan.userQuota === 0} />
                  <QuotaPill icon={<Copy className="h-3.5 w-3.5" />} label="CV lưu trữ" value={formatQuota(plan.cvStorageQuota)} unlimited={plan.cvStorageQuota === 0} />
                  <QuotaPill icon={<HardDrive className="h-3.5 w-3.5" />} label="Dung lượng" value={plan.storageGB === 0 ? "∞" : `${plan.storageGB} GB`} unlimited={plan.storageGB === 0} />
                  <QuotaPill icon={<Layers className="h-3.5 w-3.5" />} label="Workspaces" value={formatQuota(plan.workspaceLimit)} unlimited={plan.workspaceLimit === 0} />
                  <QuotaPill icon={<Cpu className="h-3.5 w-3.5" />} label="Models AI" value={String(plan.allowedModelIds.length)} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                  <span>{plan.features.length + plan.catalogFeatureIds.length} tính năng</span>
                  {plan.ctaLabel && <span>CTA: <span className="font-medium text-foreground">{plan.ctaLabel}</span></span>}
                </div>
              </div>

              <div className="flex flex-row items-center gap-2 lg:flex-col lg:items-end">
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

function QuotaPill({
  icon,
  label,
  value,
  unlimited,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unlimited?: boolean;
}) {
  return (
    <div className="rounded-md border bg-muted/30 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-sm font-semibold ${unlimited ? "text-primary" : ""}`}>{value}</div>
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
  const aiModels = useAdminStore((s) => s.aiModels);
  const featureCatalog = useAdminStore((s) => s.featureCatalog);
  const allPlans = useAdminStore((s) => s.plans);
  const [draft, setDraft] = useState<PricingPlan | null>(null);
  // catalog add/delete đã chuyển sang trang /admin/features

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

  const toggleModel = (id: string) => {
    update(
      "allowedModelIds",
      draft.allowedModelIds.includes(id)
        ? draft.allowedModelIds.filter((m) => m !== id)
        : [...draft.allowedModelIds, id],
    );
  };
  const toggleCatalog = (id: string) => {
    update(
      "catalogFeatureIds",
      draft.catalogFeatureIds.includes(id)
        ? draft.catalogFeatureIds.filter((m) => m !== id)
        : [...draft.catalogFeatureIds, id],
    );
  };

  const inheritFrom = (planId: string) => {
    const src = allPlans.find((p) => p.id === planId);
    if (!src || src.id === draft.id) return;
    setDraft({
      ...draft,
      inheritFromPlanId: planId,
      catalogFeatureIds: Array.from(new Set([...draft.catalogFeatureIds, ...src.catalogFeatureIds])),
      allowedModelIds: Array.from(new Set([...draft.allowedModelIds, ...src.allowedModelIds])),
      tokenQuota: Math.max(draft.tokenQuota, src.tokenQuota),
      userQuota: Math.max(draft.userQuota, src.userQuota),
      cvStorageQuota: Math.max(draft.cvStorageQuota, src.cvStorageQuota),
      storageGB: Math.max(draft.storageGB, src.storageGB),
      workspaceLimit: Math.max(draft.workspaceLimit, src.workspaceLimit),
    });
    toast.success(`Đã kế thừa quyền lợi từ gói "${src.name}"`);
  };

  const save = () => {
    if (!draft.name.trim()) return toast.error("Tên gói không được để trống.");
    if (draft.name.length > 50) return toast.error("Tên gói tối đa 50 ký tự.");
    if (draft.price !== "Liên hệ" && (draft.price === "" || isNaN(Number(draft.price)))) {
      return toast.error("Giá không hợp lệ. Chỉ nhận số hoặc giá trị 'Liên hệ'.");
    }
    const totalFeatures = draft.features.filter((f) => f.text.trim()).length + draft.catalogFeatureIds.length;
    if (totalFeatures === 0)
      return toast.error("Mỗi gói cần tối thiểu 1 quyền lợi (từ danh sách hoặc nhập thêm).");
    if (draft.features.some((f) => f.text.length > 200))
      return toast.error("Mỗi quyền lợi tối đa 200 ký tự.");
    if (draft.ctaLabel.trim() && !draft.ctaLink.trim())
      return toast.error("Khi có CTA, link CTA là bắt buộc.");
    for (const k of ["tokenQuota", "userQuota", "cvStorageQuota", "storageGB", "workspaceLimit"] as const) {
      if (draft[k] < 0 || !Number.isFinite(draft[k]))
        return toast.error("Các trường hạn mức phải là số ≥ 0 (0 = không giới hạn).");
    }

    const toSave = {
      ...draft,
      features: draft.features.filter((f) => f.text.trim()),
      order: draft.order === 999 ? existingCount + 1 : draft.order,
    };
    adminActions.upsertPlan(toSave);
    toast.success("Đã lưu gói");
    onClose();
  };


  const otherPlans = allPlans.filter((p) => p.id !== draft.id);


  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan?.name ? `Chỉnh sửa: ${plan.name}` : "Thêm gói mới"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* THÔNG TIN CHUNG */}
          <Section title="Thông tin chung">
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
          </Section>

          {/* KẾ THỪA */}
          {otherPlans.length > 0 && (
            <Section title="Kế thừa từ gói khác" desc="Sao chép hạn mức, models AI và tính năng từ gói có sẵn (chỉ thêm, không ghi đè).">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={draft.inheritFromPlanId || ""}
                  onValueChange={inheritFrom}
                >
                  <SelectTrigger className="sm:max-w-xs">
                    <SelectValue placeholder="Chọn gói nguồn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherPlans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name || "(chưa đặt tên)"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {draft.inheritFromPlanId && (
                  <Button variant="ghost" size="sm" onClick={() => update("inheritFromPlanId", undefined)}>
                    Bỏ liên kết
                  </Button>
                )}
              </div>
            </Section>
          )}

          {/* HẠN MỨC */}
          <Section title="Hạn mức sử dụng" desc="Nhập 0 nếu muốn 'Không giới hạn'.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField icon={<Zap className="h-3.5 w-3.5" />} label="Token AI / chu kỳ" value={draft.tokenQuota} onChange={(v) => update("tokenQuota", v)} />
              <NumberField icon={<Users className="h-3.5 w-3.5" />} label="Số người dùng" value={draft.userQuota} onChange={(v) => update("userQuota", v)} />
              <NumberField icon={<Copy className="h-3.5 w-3.5" />} label="Số CV lưu trữ" value={draft.cvStorageQuota} onChange={(v) => update("cvStorageQuota", v)} />
              <NumberField icon={<HardDrive className="h-3.5 w-3.5" />} label="Dung lượng (GB)" value={draft.storageGB} onChange={(v) => update("storageGB", v)} />
              <NumberField icon={<Layers className="h-3.5 w-3.5" />} label="Số Workspaces" value={draft.workspaceLimit} onChange={(v) => update("workspaceLimit", v)} />
            </div>
          </Section>

          {/* MODELS */}
          <Section
            title="Models AI được sử dụng"
            desc="Tick chọn các model gói này được phép gọi. Danh sách dùng chung được quản lý ở trang riêng."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/features">
                  <Settings2 className="mr-1 h-3.5 w-3.5" /> Quản lý models
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            }
          >
            {aiModels.length === 0 ? (
              <EmptyCatalog label="Chưa có model nào. Thêm tại trang Quản lý tính năng & models." />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {aiModels.map((m) => {
                  const checked = draft.allowedModelIds.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleModel(m.id)} />
                      <span>{m.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Đã chọn: <span className="font-semibold text-foreground">{draft.allowedModelIds.length}</span> / {aiModels.length}</span>
              {aiModels.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="hover:text-foreground underline-offset-2 hover:underline"
                    onClick={() => update("allowedModelIds", aiModels.map((m) => m.id))}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    className="hover:text-foreground underline-offset-2 hover:underline"
                    onClick={() => update("allowedModelIds", [])}
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* TÍNH NĂNG TỪ CATALOG */}
          <Section
            title="Tính năng có sẵn"
            desc="Tick chọn các tính năng gói này được sử dụng. Danh sách dùng chung được quản lý ở trang riêng."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/features">
                  <Settings2 className="mr-1 h-3.5 w-3.5" /> Quản lý tính năng
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            }
          >
            {featureCatalog.length === 0 ? (
              <EmptyCatalog label="Chưa có tính năng nào. Thêm tại trang Quản lý tính năng & models." />
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {featureCatalog.map((f) => {
                  const checked = draft.catalogFeatureIds.includes(f.id);
                  return (
                    <label
                      key={f.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleCatalog(f.id)} />
                      <span>{f.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Đã chọn: <span className="font-semibold text-foreground">{draft.catalogFeatureIds.length}</span> / {featureCatalog.length}</span>
              {featureCatalog.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="hover:text-foreground underline-offset-2 hover:underline"
                    onClick={() => update("catalogFeatureIds", featureCatalog.map((f) => f.id))}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    className="hover:text-foreground underline-offset-2 hover:underline"
                    onClick={() => update("catalogFeatureIds", [])}
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* KEY FEATURES RIÊNG */}
          <Section title="Key features riêng cho gói" desc="Quyền lợi tùy chỉnh chỉ áp dụng cho gói này (tối đa 200 ký tự/dòng).">
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => update("features", [...draft.features, { id: Math.random().toString(36).slice(2), text: "", included: true }])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm dòng
              </Button>
            </div>
          </Section>

          {/* CTA & TRẠNG THÁI */}
          <Section title="CTA & trạng thái">
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
            <div className="mt-3 flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
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
          </Section>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background pt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={save}>Lưu gói</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold">{title}</h4>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Separator className="mb-3" />
      {children}
    </div>
  );
}

function NumberField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5 text-xs">
        {icon}
        {label}
      </Label>
      <Input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1.5"
      />
      {value === 0 && <p className="mt-1 text-xs text-primary">Không giới hạn</p>}
    </div>
  );
}

function PreviewDialog({ open, onClose, plans }: { open: boolean; onClose: () => void; plans: PricingPlan[] }) {
  const aiModels = useAdminStore((s) => s.aiModels);
  const featureCatalog = useAdminStore((s) => s.featureCatalog);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem trước Bảng giá</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-muted/40 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => {
              const catalogFeatures = p.catalogFeatureIds
                .map((id) => featureCatalog.find((f) => f.id === id)?.name)
                .filter(Boolean) as string[];
              const modelNames = p.allowedModelIds
                .map((id) => aiModels.find((m) => m.id === id)?.name)
                .filter(Boolean) as string[];

              return (
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

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <PreviewQuota label="Token AI" value={p.tokenQuota === 0 ? "Không giới hạn" : formatTokens(p.tokenQuota)} />
                    <PreviewQuota label="Người dùng" value={formatQuota(p.userQuota)} />
                    <PreviewQuota label="CV lưu trữ" value={formatQuota(p.cvStorageQuota)} />
                    <PreviewQuota label="Dung lượng" value={p.storageGB === 0 ? "Không giới hạn" : `${p.storageGB} GB`} />
                    <PreviewQuota label="Workspaces" value={formatQuota(p.workspaceLimit)} />
                    <PreviewQuota label="Models AI" value={`${modelNames.length} models`} />
                  </div>

                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    {catalogFeatures.map((name, i) => (
                      <li key={`c-${i}`} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{name}</span>
                      </li>
                    ))}
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

                  {modelNames.length > 0 && (
                    <div className="mt-4 rounded-md bg-muted/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Models AI</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {modelNames.map((n) => (
                          <Badge key={n} variant="secondary" className="text-[10px]">{n}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.ctaLabel && (
                    <Button className="mt-6 w-full" variant={p.highlighted ? "default" : "outline"}>
                      {p.ctaLabel}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewQuota({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
