import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, CheckCircle, Activity, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/pengawas/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pengawas/laporan", label: "Laporan Keuangan", icon: FileText },
  { href: "/pengawas/audit", label: "Audit & Kesehatan", icon: CheckCircle },
  { href: "/pengawas/aktivitas", label: "Log Aktivitas", icon: Activity },
];

const PAGE_TITLES: Record<string, string> = {
  "/pengawas/dashboard": "Overview Koperasi",
  "/pengawas/laporan": "Laporan Keuangan",
  "/pengawas/audit": "Audit & Kesehatan",
  "/pengawas/aktivitas": "Log Aktivitas",
};

export function PengawasLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const [location] = useLocation();

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    location.startsWith(path)
  )?.[1] ?? "Pengawas Koperasi";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset">
          <SidebarHeader className="border-b px-4 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-sm">
                MP
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm text-foreground">Merah Putih</div>
                <div className="text-xs text-muted-foreground">Pengawas</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={href === "/pengawas/dashboard" ? location === href : location.startsWith(href)}
                      >
                        <Link href={href}>
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-3">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                {user?.nama?.slice(0, 2).toUpperCase() || "PW"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">{user?.nama}</span>
                <span className="text-xs text-muted-foreground">Pengawas</span>
              </div>
              <SidebarMenuButton size="sm" onClick={() => logout()} className="w-auto shrink-0 hover:text-destructive" tooltip="Keluar">
                <LogOut className="h-4 w-4" />
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 sticky top-0 z-10">
            <SidebarTrigger className="shrink-0" />
            <div className="h-4 w-px bg-border shrink-0" />
            <h1 className="text-sm font-semibold truncate">{pageTitle}</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 page-animate">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
