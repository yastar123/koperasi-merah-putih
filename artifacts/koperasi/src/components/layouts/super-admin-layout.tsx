import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger
} from "@/components/ui/sidebar";
import { LayoutDashboard, Building2, Users, FileBarChart, LogOut, Globe } from "lucide-react";

const NAV_ITEMS = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/koperasi", label: "Data Koperasi", icon: Building2 },
  { href: "/super-admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/super-admin/laporan", label: "Laporan Nasional", icon: FileBarChart },
];

const PAGE_TITLES: Record<string, string> = {
  "/super-admin/dashboard": "Dashboard Nasional",
  "/super-admin/koperasi": "Data Koperasi",
  "/super-admin/pengguna": "Manajemen Pengguna",
  "/super-admin/laporan": "Laporan Nasional",
};

function TodayBadge() {
  const now = new Date();
  const day = now.toLocaleDateString("id-ID", { weekday: "short" });
  const date = now.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg select-none">
      <span className="font-medium text-foreground/70">{day},</span>
      <span>{date}</span>
    </div>
  );
}

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const [location] = useLocation();

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    path === "/super-admin/dashboard" ? location === path : location.startsWith(path)
  )?.[1] ?? "Super Admin";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="inset">
          <SidebarHeader className="border-b px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs shadow-sm ring-1 ring-primary/20">
                MP
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-bold text-sm">Merah Putih</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  <Globe className="h-2.5 w-2.5" />
                  Dinas Koperasi
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
                Menu Utama
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = href === "/super-admin/dashboard" ? location === href : location.startsWith(href);
                    return (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={href}>
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-3">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 transition-colors group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 ring-1 ring-primary/15">
                {user?.nama?.slice(0, 2).toUpperCase() || "SA"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate">{user?.nama}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Super Admin</span>
              </div>
              <SidebarMenuButton
                size="sm"
                onClick={() => logout()}
                className="w-auto shrink-0 hover:text-destructive hover:bg-destructive/10 transition-colors"
                tooltip="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-md px-4 sticky top-0 z-20 shadow-[0_1px_0_0_hsl(var(--border))]">
            <SidebarTrigger className="shrink-0" />
            <div className="h-4 w-px bg-border/70 shrink-0" />
            <h1 className="text-sm font-semibold truncate flex-1">{pageTitle}</h1>
            <TodayBadge />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 page-animate">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
