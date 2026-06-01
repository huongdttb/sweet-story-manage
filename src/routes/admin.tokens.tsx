import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Coins,
  Eye,
  Gift,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Zap,
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
  formatTokens,
  newTokenPackage,
  type TokenPackage,
  useAdminStore,
} from "@/lib/admin-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tokens")({
  component: TokensPage,
});

const badgeLabel: Record<TokenPackage["badge"], string> = {
  "": "Không có",
  popular: "Phổ biến",
  best_value: "Tiết kiệm nhất",
  new: "Mới",
};

const badgeStyle: Record<Exclude<TokenPackage["badge"], "">, string> = {
  popular: "bg-primary text-primary-foreground",
  best_value: "bg-emerald-600 text-white",
  new: "bg-amber-500 text-white",
};

function pricePerToken(pkg: TokenPackage): string {
  const price = Number(pkg.price);
  const total = pkg.tokens + pkg.bonusTokens;
  if (!price || !total) return "—";
  const per = price / total;
  if (pkg.currency === "VND") return per.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + "₫/token";
  return "$" + per.toFixed(5) + "/token";
}

function TokensPage() {
  const items = useAdminStore((s) => s.tokenPackages).slice().sort((a, b) => a.order - b.order);
  const [editing, setEditing] = useState<TokenPackage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TokenPackage | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    adminActions.reorderTokenPackages(next.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const totalActive = items.filter((i) => i.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Coins className="h-6 w-6 text-amber-500" /> Gói Token AI mở rộng
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các gói bán thêm token cho người dùng có nhu cầu sử dụng AI nhiều hơn hạn mức gói chính.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" /> Xem trước
          </Button>
          <Button onClick={() => setEditing(newTokenPackage())}>
            <Plus className="mr-2 h-4 w-4" /> Thêm gói token
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Tổng số gói</div>
          <div className="mt-1 text-2xl font-bold">{items.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Đang hiển thị</div>
          <div className="mt-1 text-2xl font-bold">{totalActive}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Gói nổi bật</div>
          <div className="mt-1 text-2xl font-bold">{items.filter((i) => i.highlighted).length}</div>
        </Card>
      </div>

      {items.length >= 6 && (
        <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <Sparkles className="mt-0.5 h-4 w-4 text-amber-600" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            Khuyến nghị 3–5 gói token để khách hàng dễ ra quyết định.
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {items.map((pkg, idx) => (
          <Card key={pkg.id} className={`p-5 ${pkg.highlighted ? "ring-2 ring-primary" : ""}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => move(idx, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <span className="text-center text-xs text-muted-foreground">#{idx + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === items.length - 1} onClick={() => move(idx, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {pkg.name || <span className="italic text-muted-foreground">Chưa đặt tên</span>}
                  </h3>
                  {pkg.badge && (
                    <Badge className={badgeStyle[pkg.badge]}>{badgeLabel[pkg.badge]}</Badge>
                  )}
                  {pkg.highlighted && <Badge variant="outline" className="gap-1"><Star className="h-3 w-3" /> Nổi bật</Badge>}
                  {!pkg.active && <Badge variant="secondary">Đã tắt</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description || "Chưa có mô tả"}</p>

                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatCurrency(pkg.price, pkg.currency)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold">{formatTokens(pkg.tokens)}</span>
                    <span className="text-muted-foreground">token</span>
                    {pkg.bonusTokens > 0 && (
                      <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Gift className="h-3 w-3" /> +{formatTokens(pkg.bonusTokens)} bonus
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>≈ {pricePerToken(pkg)}</span>
                  <span>Hạn sử dụng: {pkg.validityDays === 0 ? "Không giới hạn" : `${pkg.validityDays} ngày`}</span>
                  {pkg.ctaLabel && <span>CTA: <span className="font-medium text-foreground">{pkg.ctaLabel}</span></span>}
                </div>
              </div>

              <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Hiển thị</Label>
                  <Switch
                    checked={pkg.active}
                    onCheckedChange={(v) => adminActions.upsertTokenPackage({ ...pkg, active: v })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(pkg)}>Chỉnh sửa</Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(pkg)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {items.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <Coins className="h-10 w-10 text-muted-foreground" />
            <div>
              <div className="font-medium">Chưa có gói token nào</div>
              <div className="text-sm text-muted-foreground">Tạo gói đầu tiên để bắt đầu bán thêm token AI.</div>
            </div>
            <Button onClick={() => setEditing(newTokenPackage())}>
              <Plus className="mr-2 h-4 w-4" /> Thêm gói token
            </Button>
          </Card>
        )}
      </div>

      <TokenEditorDialog pkg={editing} onClose={() => setEditing(null)} existingCount={items.length} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói "{confirmDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Nếu gói này đã được người dùng mua, lịch sử giao dịch vẫn được giữ lại. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  adminActions.deleteTokenPackage(confirmDelete.id);
                  toast.success("Đã xóa gói token");
                  setConfirmDelete(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PreviewDialog open={showPreview} onClose={() => setShowPreview(false)} items={items.filter((i) => i.active)} />
    </div>
  );
}

function TokenEditorDialog({
  pkg,
  onClose,
  existingCount,
}: {
  pkg: TokenPackage | null;
  onClose: () => void;
  existingCount: number;
}) {
  const [draft, setDraft] = useState<TokenPackage | null>(null);

  if (pkg && (!draft || draft.id !== pkg.id)) setDraft({ ...pkg });
  if (!pkg && draft) setDraft(null);
  if (!draft) return null;

  const update = <K extends keyof TokenPackage>(key: K, value: TokenPackage[K]) =>
    setDraft({ ...draft, [key]: value });

  const save = () => {
    if (!draft.name.trim()) return toast.error("Tên gói không được để trống.");
    if (draft.name.length > 50) return toast.error("Tên gói tối đa 50 ký tự.");
    if (!draft.tokens || draft.tokens <= 0) return toast.error("Số token phải lớn hơn 0.");
    if (draft.bonusTokens < 0) return toast.error("Token bonus không được âm.");
    if (draft.price === "" || isNaN(Number(draft.price)) || Number(draft.price) < 0) {
      return toast.error("Giá không hợp lệ.");
    }
    if (draft.validityDays < 0) return toast.error("Hạn sử dụng không hợp lệ.");
    if (draft.ctaLabel.trim() && !draft.ctaLink.trim()) return toast.error("Khi có CTA, link CTA là bắt buộc.");

    adminActions.upsertTokenPackage({
      ...draft,
      order: draft.order === 999 ? existingCount + 1 : draft.order,
    });
    toast.success("Đã lưu gói token");
    onClose();
  };

  const per = pricePerToken(draft);

  return (
    <Dialog open={!!pkg} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg?.name ? `Chỉnh sửa: ${pkg.name}` : "Thêm gói token mới"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Tên gói *</Label>
              <Input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={50}
                placeholder="VD: Token Plus"
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">{draft.name.length}/50 ký tự</p>
            </div>
            <div>
              <Label>Nhãn hiển thị</Label>
              <Select value={draft.badge || "none"} onValueChange={(v) => update("badge", (v === "none" ? "" : v) as TokenPackage["badge"])}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="best_value">Tiết kiệm nhất</SelectItem>
                  <SelectItem value="new">Mới</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Số token *</Label>
              <Input
                type="number"
                min={0}
                value={draft.tokens}
                onChange={(e) => update("tokens", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Token bonus (tặng thêm)</Label>
              <Input
                type="number"
                min={0}
                value={draft.bonusTokens}
                onChange={(e) => update("bonusTokens", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Giá *</Label>
              <Input
                value={draft.price}
                onChange={(e) => update("price", e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="Chỉ nhập số"
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
              <Label>Hạn sử dụng (ngày)</Label>
              <Input
                type="number"
                min={0}
                value={draft.validityDays}
                onChange={(e) => update("validityDays", Number(e.target.value))}
                className="mt-1.5"
                placeholder="0 = không hết hạn"
              />
              <p className="mt-1 text-xs text-muted-foreground">Nhập 0 nếu token không bao giờ hết hạn.</p>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Đơn giá ước tính</div>
              <div className="mt-1 text-lg font-semibold">{per}</div>
              <div className="text-xs text-muted-foreground">
                Tổng nhận: {formatTokens(draft.tokens + draft.bonusTokens)} token
              </div>
            </div>
          </div>

          <div>
            <Label>Mô tả ngắn</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="VD: Tiết kiệm 10%, tặng thêm 50K token"
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nhãn CTA</Label>
              <Input
                value={draft.ctaLabel}
                onChange={(e) => update("ctaLabel", e.target.value)}
                placeholder="VD: Mua ngay"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Link CTA</Label>
              <Input
                value={draft.ctaLink}
                onChange={(e) => update("ctaLink", e.target.value)}
                placeholder="/checkout?token=..."
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={draft.highlighted} onCheckedChange={(v) => update("highlighted", v)} />
              <div>
                <div className="text-sm font-medium">Đánh dấu nổi bật</div>
                <div className="text-xs text-muted-foreground">Gói sẽ được làm nổi bật trên landing page</div>
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

function PreviewDialog({ open, onClose, items }: { open: boolean; onClose: () => void; items: TokenPackage[] }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Xem trước gói token AI</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-muted/40 p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Mua thêm Token AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mở rộng hạn mức AI cho tài khoản của bạn — chỉ trả phí theo nhu cầu sử dụng.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-xl border bg-background p-5 ${p.highlighted ? "border-primary shadow-lg ring-2 ring-primary" : ""}`}
              >
                {p.badge && (
                  <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${badgeStyle[p.badge]}`}>
                    {badgeLabel[p.badge]}
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-semibold">{p.name}</h3>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{formatTokens(p.tokens)}</span>
                    <span className="text-sm text-muted-foreground">token</span>
                  </div>
                  {p.bonusTokens > 0 && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Gift className="h-3 w-3" /> +{formatTokens(p.bonusTokens)} bonus
                    </div>
                  )}
                </div>
                <div className="mt-4 border-t pt-4">
                  <div className="text-2xl font-bold">{formatCurrency(p.price, p.currency)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">≈ {pricePerToken(p)}</div>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  Hạn dùng: {p.validityDays === 0 ? "Vĩnh viễn" : `${p.validityDays} ngày`}
                </div>
                {p.ctaLabel && (
                  <Button className="mt-4 w-full" variant={p.highlighted ? "default" : "outline"}>
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
