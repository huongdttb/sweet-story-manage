import { useSyncExternalStore } from "react";

export type PostStatus = "draft" | "published" | "scheduled" | "hidden";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  author: string;
  cover: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface PricingFeature {
  id: string;
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string; // number string or "Liên hệ"
  currency: "VND" | "USD";
  cycle: "month" | "quarter" | "year";
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaLink: string;
  highlighted: boolean;
  active: boolean;
  order: number;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultCategories: BlogCategory[] = [
  { id: "cat-news", name: "Tin tức", isDefault: true },
  { id: "cat-guide", name: "Hướng dẫn" },
  { id: "cat-recruit", name: "Kiến thức tuyển dụng" },
  { id: "cat-marketing", name: "Marketing" },
];

const defaultPosts: BlogPost[] = [
  {
    id: uid(),
    title: "5 xu hướng tuyển dụng nổi bật năm 2026",
    slug: "xu-huong-tuyen-dung-2026",
    categoryId: "cat-recruit",
    author: "Nguyễn An",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400",
    excerpt: "Khám phá các xu hướng định hình thị trường nhân sự năm 2026.",
    content: "<p>Nội dung chi tiết về xu hướng tuyển dụng...</p>",
    status: "published",
    views: 1240,
    createdAt: "2026-04-12T08:30:00Z",
    updatedAt: "2026-05-02T10:15:00Z",
    publishedAt: "2026-04-15T09:00:00Z",
  },
  {
    id: uid(),
    title: "Hướng dẫn viết JD thu hút ứng viên chất lượng",
    slug: "huong-dan-viet-jd",
    categoryId: "cat-guide",
    author: "Trần Bình",
    cover: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400",
    excerpt: "Cách xây dựng JD hấp dẫn, đúng trọng tâm.",
    content: "<p>Một JD tốt cần...</p>",
    status: "draft",
    views: 0,
    createdAt: "2026-05-08T14:22:00Z",
    updatedAt: "2026-05-10T11:05:00Z",
    publishedAt: null,
  },
  {
    id: uid(),
    title: "Chiến dịch Employer Branding cho startup",
    slug: "employer-branding-startup",
    categoryId: "cat-marketing",
    author: "Lê Châu",
    cover: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400",
    excerpt: "Xây dựng thương hiệu nhà tuyển dụng mạnh mẽ.",
    content: "<p>Employer branding là...</p>",
    status: "scheduled",
    views: 0,
    createdAt: "2026-05-01T07:00:00Z",
    updatedAt: "2026-05-11T16:40:00Z",
    publishedAt: "2026-05-20T08:00:00Z",
  },
  {
    id: uid(),
    title: "Báo cáo thị trường nhân sự Q1/2026",
    slug: "bao-cao-q1-2026",
    categoryId: "cat-news",
    author: "Nguyễn An",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
    excerpt: "Tổng hợp số liệu thị trường nhân sự quý 1.",
    content: "<p>Báo cáo cho thấy...</p>",
    status: "hidden",
    views: 532,
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-04-01T12:00:00Z",
    publishedAt: "2026-03-25T09:00:00Z",
  },
];

const defaultPlans: PricingPlan[] = [
  {
    id: uid(),
    name: "Starter",
    price: "0",
    currency: "VND",
    cycle: "month",
    description: "Dành cho cá nhân và đội nhóm mới bắt đầu.",
    features: [
      { id: uid(), text: "Đăng tối đa 3 tin tuyển dụng", included: true },
      { id: uid(), text: "Quản lý 50 ứng viên", included: true },
      { id: uid(), text: "Hỗ trợ qua email", included: true },
    ],
    ctaLabel: "Bắt đầu miễn phí",
    ctaLink: "/signup",
    highlighted: false,
    active: true,
    order: 1,
  },
  {
    id: uid(),
    name: "Professional",
    price: "1990000",
    currency: "VND",
    cycle: "month",
    description: "Lựa chọn phổ biến nhất cho doanh nghiệp đang phát triển.",
    features: [
      { id: uid(), text: "Đăng không giới hạn tin tuyển dụng", included: true },
      { id: uid(), text: "Quản lý 1.000 ứng viên", included: true },
      { id: uid(), text: "Tích hợp ATS & CRM", included: true },
      { id: uid(), text: "Hỗ trợ ưu tiên 24/7", included: true },
    ],
    ctaLabel: "Dùng thử 14 ngày",
    ctaLink: "/signup?plan=pro",
    highlighted: true,
    active: true,
    order: 2,
  },
  {
    id: uid(),
    name: "Enterprise",
    price: "Liên hệ",
    currency: "VND",
    cycle: "year",
    description: "Giải pháp riêng cho tập đoàn quy mô lớn.",
    features: [
      { id: uid(), text: "Tùy biến quy trình theo yêu cầu", included: true },
      { id: uid(), text: "SLA & bảo mật cấp doanh nghiệp", included: true },
      { id: uid(), text: "Customer Success Manager riêng", included: true },
    ],
    ctaLabel: "Liên hệ tư vấn",
    ctaLink: "/contact",
    highlighted: false,
    active: true,
    order: 3,
  },
];

interface State {
  posts: BlogPost[];
  categories: BlogCategory[];
  plans: PricingPlan[];
}

let state: State = {
  posts: defaultPosts,
  categories: defaultCategories,
  plans: defaultPlans,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useAdminStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export const adminActions = {
  // posts
  createPost(input: Partial<BlogPost>): BlogPost {
    const now = new Date().toISOString();
    const post: BlogPost = {
      id: uid(),
      title: input.title || "Bài viết chưa có tiêu đề",
      slug: input.slug || uid(),
      categoryId: input.categoryId || state.categories[0]?.id || "",
      author: input.author || "Admin",
      cover: input.cover || "",
      excerpt: input.excerpt || "",
      content: input.content || "",
      status: input.status || "draft",
      views: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: input.status === "published" ? now : null,
    };
    state = { ...state, posts: [post, ...state.posts] };
    emit();
    return post;
  },
  updatePost(id: string, patch: Partial<BlogPost>) {
    state = {
      ...state,
      posts: state.posts.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch, updatedAt: new Date().toISOString() };
        if (patch.status === "published" && !p.publishedAt) {
          next.publishedAt = new Date().toISOString();
        }
        return next;
      }),
    };
    emit();
  },
  deletePost(id: string) {
    state = { ...state, posts: state.posts.filter((p) => p.id !== id) };
    emit();
  },
  // categories
  addCategory(name: string) {
    state = {
      ...state,
      categories: [...state.categories, { id: uid(), name }],
    };
    emit();
  },
  updateCategory(id: string, name: string) {
    state = {
      ...state,
      categories: state.categories.map((c) => (c.id === id ? { ...c, name } : c)),
    };
    emit();
  },
  deleteCategory(id: string) {
    state = { ...state, categories: state.categories.filter((c) => c.id !== id) };
    emit();
  },
  // plans
  upsertPlan(plan: PricingPlan) {
    const exists = state.plans.some((p) => p.id === plan.id);
    state = {
      ...state,
      plans: exists
        ? state.plans.map((p) => (p.id === plan.id ? plan : p))
        : [...state.plans, plan],
    };
    emit();
  },
  deletePlan(id: string) {
    state = { ...state, plans: state.plans.filter((p) => p.id !== id) };
    emit();
  },
  reorderPlans(plans: PricingPlan[]) {
    state = { ...state, plans };
    emit();
  },
};

export const newPlan = (): PricingPlan => ({
  id: uid(),
  name: "",
  price: "0",
  currency: "VND",
  cycle: "month",
  description: "",
  features: [{ id: uid(), text: "", included: true }],
  ctaLabel: "",
  ctaLink: "",
  highlighted: false,
  active: true,
  order: 999,
});

export const newFeatureId = uid;

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatCurrency(price: string, currency: "VND" | "USD"): string {
  if (price === "Liên hệ" || isNaN(Number(price))) return price;
  const n = Number(price);
  if (currency === "VND") return n.toLocaleString("vi-VN") + "₫";
  return "$" + n.toLocaleString("en-US");
}

export const statusLabel: Record<PostStatus, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  scheduled: "Đã lên lịch",
  hidden: "Đã ẩn",
};
