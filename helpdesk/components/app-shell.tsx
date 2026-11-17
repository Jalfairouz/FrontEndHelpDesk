"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { NotificationsProvider } from "@/components/notifications-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { isPublicRoute } from "@/lib/routes";

function Breadcrumb({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);
  const isId = (s: string) => /^[0-9a-f-]{8,}$/i.test(s) || /^\d+$/.test(s);

  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
      {parts.map((part, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const label = isId(part) ? "Details" : part.replace(/-/g, " ");
        const last = i === parts.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            {last ? (
              <span className="truncate font-medium capitalize text-foreground">
                {label}
              </span>
            ) : (
              <Link href={href} className="capitalize hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <NotificationsProvider>
      <SidebarProvider>
        <AppSidebar />

        <main className="w-full">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <Breadcrumb pathname={pathname} />

            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
              <UserMenu />
            </div>
          </header>

          {children}
        </main>

        <Toaster position="top-right" richColors />
      </SidebarProvider>
    </NotificationsProvider>
  );
}