import { Badge } from "@/components/ui/badge";
import { type PostStatus, statusLabel } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

const styles: Record<PostStatus, string> = {
  draft: "bg-muted text-muted-foreground hover:bg-muted",
  published: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  scheduled: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  hidden: "bg-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", styles[status])}>
      {statusLabel[status]}
    </Badge>
  );
}
