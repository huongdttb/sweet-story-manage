import { createFileRoute, Link } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/PostEditor";
import { useAdminStore } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export const Route = createFileRoute("/admin/blog/$postId")({
  component: EditPostPage,
});

function EditPostPage() {
  const { postId } = Route.useParams();
  const post = useAdminStore((s) => s.posts.find((p) => p.id === postId));

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Bài viết không còn tồn tại</h2>
        <p className="mt-1 text-sm text-muted-foreground">Có thể bài viết đã bị xóa bởi người khác.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return <PostEditor post={post} />;
}
