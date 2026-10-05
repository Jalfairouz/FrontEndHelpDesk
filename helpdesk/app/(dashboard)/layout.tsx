import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full ">
        <div className="flex h-14 items-center border-b px-4 pg-4">
          <SidebarTrigger />
        </div>

        {children}
      </main>
    </SidebarProvider>
  );
}
