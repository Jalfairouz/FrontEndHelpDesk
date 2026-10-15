"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { isPublicRoute } from "@/lib/routes";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <SidebarTrigger />
          <NotificationBell />
        </div>

        {children}
      </main>

      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}