import { useSyncExternalStore } from "react";

export type PostStatus = "draft" | "published" | "scheduled" | "hidden";

export type ImageAlign = "left" | "center" | "right" | "full";

export type ContentBlock =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "quote"; text: string; cite?: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "image"; src: string; caption: string; alt: string; align: ImageAlign }
  | { id: string; type: "gallery"; images: { src: string; caption: string }[] }
  | { id: string; type: "divider" };

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  author: string;
  cover: string;
  excerpt: string;
  blocks: ContentBlock[];
  status: PostStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export const newBlock = (type: ContentBlock["type"]): ContentBlock => {
  const id = Math.random().toString(36).slice(2, 10);
  switch (type) {
    case "paragraph": return { id, type, text: "" };
    case "heading": return { id, type, level: 2, text: "" };
    case "quote": return { id, type, text: "", cite: "" };
    case "list": return { id, type, ordered: false, items: [""] };
    case "image": return { id, type, src: "", caption: "", alt: "", align: "center" };
    case "gallery": return { id, type, images: [] };
    case "divider": return { id, type };
  }
};

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

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number; // base token amount
  bonusTokens: number; // extra bonus tokens
  price: string; // numeric string
  currency: "VND" | "USD";
  pricePerToken?: string; // derived/display only
  badge: "" | "popular" | "best_value" | "new";
  description: string;
  validityDays: number; // 0 = không hết hạn
  ctaLabel: string;
  ctaLink: string;
  highlighted: boolean;
  active: boolean;
  order: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string; // number string or "Liên hệ"
  currency: "VND" | "USD";
  cycle: "month" | "quarter" | "year";
  description: string;
  features: PricingFeature[]; // custom key-features riêng cho gói
  catalogFeatureIds: string[]; // tick chọn từ danh sách tính năng dùng chung
  // Hạn mức sử dụng
  tokenQuota: number; // số token AI được dùng
  userQuota: number; // số người dùng
  cvStorageQuota: number; // số CV lưu trữ
  storageGB: number; // dung lượng lưu trữ (GB)
  workspaceLimit: number; // số workspaces
  allowedModelIds: string[]; // model AI được dùng
  inheritFromPlanId?: string; // gói được kế thừa quyền lợi
  ctaLabel: string;
  ctaLink: string;
  highlighted: boolean;
  active: boolean;
  order: number;
}

export interface AiModel {
  id: string;
  name: string;
}

export interface FeatureCatalogItem {
  id: string;
  name: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultCategories: BlogCategory[] = [
  { id: "cat-news", name: "Tin tức", isDefault: true },
  { id: "cat-guide", name: "Hướng dẫn" },
  { id: "cat-recruit", name: "Kiến thức tuyển dụng" },
  { id: "cat-marketing", name: "Marketing" },
];

const sampleBlocks = (intro: string, img: string): ContentBlock[] => [
  { id: uid(), type: "paragraph", text: intro },
  { id: uid(), type: "heading", level: 2, text: "Bối cảnh thị trường" },
  { id: uid(), type: "paragraph", text: "Thị trường nhân sự năm 2026 chứng kiến nhiều biến động lớn, đòi hỏi các doanh nghiệp phải linh hoạt thay đổi chiến lược." },
  { id: uid(), type: "image", src: img, caption: "Ảnh minh họa: workspace hiện đại", alt: "workspace", align: "center" },
  { id: uid(), type: "paragraph", text: "Sau đây là những điểm chính cần lưu ý cho mọi nhà quản trị nhân sự." },
  { id: uid(), type: "list", ordered: true, items: ["Tự động hóa quy trình tuyển dụng", "Trải nghiệm ứng viên cá nhân hóa", "Tăng cường employer branding"] },
  { id: uid(), type: "quote", text: "Doanh nghiệp thắng cuộc đua nhân tài là doanh nghiệp đầu tư sớm vào dữ liệu và trải nghiệm.", cite: "Báo cáo HR Trends 2026" },
];

const defaultPosts: BlogPost[] = [
  {
    id: uid(),
    title: "5 xu hướng tuyển dụng nổi bật năm 2026",
    slug: "xu-huong-tuyen-dung-2026",
    categoryId: "cat-recruit",
    author: "Nguyễn An",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
    excerpt: "Khám phá các xu hướng định hình thị trường nhân sự năm 2026.",
    blocks: sampleBlocks(
      "Năm 2026 mở ra nhiều cơ hội và thách thức mới cho ngành nhân sự.",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
    ),
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
    cover: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    excerpt: "Cách xây dựng JD hấp dẫn, đúng trọng tâm.",
    blocks: [{ id: uid(), type: "paragraph", text: "Một JD tốt cần rõ ràng, đúng trọng tâm và truyền cảm hứng cho ứng viên." }],
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
    cover: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800",
    excerpt: "Xây dựng thương hiệu nhà tuyển dụng mạnh mẽ.",
    blocks: [{ id: uid(), type: "paragraph", text: "Employer branding là chìa khóa thu hút nhân tài top đầu trong dài hạn." }],
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
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    excerpt: "Tổng hợp số liệu thị trường nhân sự quý 1.",
    blocks: [{ id: uid(), type: "paragraph", text: "Báo cáo cho thấy nhu cầu nhân sự tăng trưởng ở các ngành công nghệ và tài chính." }],
    status: "hidden",
    views: 532,
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-04-01T12:00:00Z",
    publishedAt: "2026-03-25T09:00:00Z",
  },
];

const defaultAiModels: AiModel[] = [
  { id: "gpt-4o-mini", name: "GPT-4o mini" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B" },
];

const defaultFeatureCatalog: FeatureCatalogItem[] = [
  { id: "feat-ats", name: "Tích hợp ATS & CRM" },
  { id: "feat-api", name: "Truy cập API mở rộng" },
  { id: "feat-sso", name: "Đăng nhập SSO" },
  { id: "feat-2fa", name: "Bảo mật 2FA bắt buộc" },
  { id: "feat-export", name: "Xuất dữ liệu (CSV/Excel)" },
  { id: "feat-report", name: "Báo cáo & phân tích nâng cao" },
  { id: "feat-ai-jd", name: "Tạo JD bằng AI" },
  { id: "feat-ai-screen", name: "Sàng lọc CV bằng AI" },
  { id: "feat-email", name: "Email automation" },
  { id: "feat-csm", name: "Customer Success Manager riêng" },
  { id: "feat-sla", name: "Cam kết SLA 99.9%" },
  { id: "feat-priority", name: "Hỗ trợ ưu tiên 24/7" },
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
    ],
    catalogFeatureIds: ["feat-export"],
    tokenQuota: 100_000,
    userQuota: 3,
    cvStorageQuota: 50,
    storageGB: 1,
    workspaceLimit: 1,
    allowedModelIds: ["gpt-4o-mini", "gemini-2.0-flash"],
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
      { id: uid(), text: "Quản lý 1.000 ứng viên", included: true },
    ],
    catalogFeatureIds: ["feat-ats", "feat-export", "feat-report", "feat-ai-jd", "feat-ai-screen", "feat-priority"],
    tokenQuota: 1_000_000,
    userQuota: 15,
    cvStorageQuota: 1000,
    storageGB: 20,
    workspaceLimit: 3,
    allowedModelIds: ["gpt-4o-mini", "gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro", "gemini-2.0-flash"],
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
    ],
    catalogFeatureIds: ["feat-ats", "feat-api", "feat-sso", "feat-2fa", "feat-export", "feat-report", "feat-ai-jd", "feat-ai-screen", "feat-email", "feat-csm", "feat-sla", "feat-priority"],
    tokenQuota: 10_000_000,
    userQuota: 0, // 0 = không giới hạn
    cvStorageQuota: 0,
    storageGB: 500,
    workspaceLimit: 0,
    allowedModelIds: defaultAiModels.map((m) => m.id),
    ctaLabel: "Liên hệ tư vấn",
    ctaLink: "/contact",
    highlighted: false,
    active: true,
    order: 3,
  },
];

const defaultTokenPackages: TokenPackage[] = [
  {
    id: uid(),
    name: "Token Starter",
    tokens: 100_000,
    bonusTokens: 0,
    price: "99000",
    currency: "VND",
    badge: "",
    description: "Phù hợp dùng thử các tính năng AI cơ bản.",
    validityDays: 90,
    ctaLabel: "Mua ngay",
    ctaLink: "/checkout?token=starter",
    highlighted: false,
    active: true,
    order: 1,
  },
  {
    id: uid(),
    name: "Token Plus",
    tokens: 500_000,
    bonusTokens: 50_000,
    price: "449000",
    currency: "VND",
    badge: "popular",
    description: "Tiết kiệm 10%, tặng thêm 50K token.",
    validityDays: 180,
    ctaLabel: "Mua ngay",
    ctaLink: "/checkout?token=plus",
    highlighted: true,
    active: true,
    order: 2,
  },
  {
    id: uid(),
    name: "Token Pro",
    tokens: 1_500_000,
    bonusTokens: 300_000,
    price: "1290000",
    currency: "VND",
    badge: "best_value",
    description: "Giá tốt nhất cho đội nhóm dùng AI thường xuyên.",
    validityDays: 365,
    ctaLabel: "Mua ngay",
    ctaLink: "/checkout?token=pro",
    highlighted: false,
    active: true,
    order: 3,
  },
  {
    id: uid(),
    name: "Token Enterprise",
    tokens: 5_000_000,
    bonusTokens: 1_500_000,
    price: "3990000",
    currency: "VND",
    badge: "new",
    description: "Gói lớn cho doanh nghiệp, kèm hỗ trợ ưu tiên.",
    validityDays: 0,
    ctaLabel: "Liên hệ tư vấn",
    ctaLink: "/contact",
    highlighted: false,
    active: true,
    order: 4,
  },
];

interface State {
  posts: BlogPost[];
  categories: BlogCategory[];
  plans: PricingPlan[];
  tokenPackages: TokenPackage[];
}

let state: State = {
  posts: defaultPosts,
  categories: defaultCategories,
  plans: defaultPlans,
  tokenPackages: defaultTokenPackages,
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
      blocks: input.blocks || [{ id: uid(), type: "paragraph", text: "" }],
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
  // token packages
  upsertTokenPackage(pkg: TokenPackage) {
    const exists = state.tokenPackages.some((p) => p.id === pkg.id);
    state = {
      ...state,
      tokenPackages: exists
        ? state.tokenPackages.map((p) => (p.id === pkg.id ? pkg : p))
        : [...state.tokenPackages, pkg],
    };
    emit();
  },
  deleteTokenPackage(id: string) {
    state = { ...state, tokenPackages: state.tokenPackages.filter((p) => p.id !== id) };
    emit();
  },
  reorderTokenPackages(tokenPackages: TokenPackage[]) {
    state = { ...state, tokenPackages };
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

export const newTokenPackage = (): TokenPackage => ({
  id: uid(),
  name: "",
  tokens: 100000,
  bonusTokens: 0,
  price: "0",
  currency: "VND",
  badge: "",
  description: "",
  validityDays: 90,
  ctaLabel: "Mua ngay",
  ctaLink: "",
  highlighted: false,
  active: true,
  order: 999,
});

export const newFeatureId = uid;

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  // Use UTC to keep SSR and client output identical (avoids hydration mismatch).
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(-2)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
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
