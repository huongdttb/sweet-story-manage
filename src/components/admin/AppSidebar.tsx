import { Link, useRouterState } from "@tanstack/react-router";
import { Coins, FileText, FolderTree, LayoutDashboard, Sparkles, Tag } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const blogItems = [
  { title: "Danh sách bài viết", url: "/admin/blog", icon: FileText },
  { title: "Danh mục", url: "/admin/blog/categories", icon: FolderTree },
];

const landingItems = [
  { title: "Bảng giá", url: "/admin/pricing", icon: Tag },
  { title: "Tính năng & Models", url: "/admin/features", icon: Sparkles },
  { title: "Gói Token AI", url: "/admin/tokens", icon: Coins },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) =>
    url === "/admin/blog" ? pathname === url || pathname.startsWith("/admin/blog/") && !pathname.includes("categories") : pathname === url;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/admin/blog" className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Admin Panel</span>
            <span className="text-xs text-muted-foreground">Quản trị nội dung</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý Blog</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {blogItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Landing Page</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {landingItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
