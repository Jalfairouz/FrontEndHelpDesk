"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Ticket,
  User,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { clearToken, getSession } from "@/lib/auth";
import type { Role } from "@/lib/routes";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const MENU: Record<Role, MenuItem[]> = {
  Employee: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Profile", url: "/profile", icon: User },
    { title: "My Tickets", url: "/tickets", icon: Ticket },
    { title: "Create Ticket", url: "/tickets/create", icon: PlusCircle },
  ],
  Admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Manage Users", url: "/admin/users", icon: User },
    { title: "System Tickets", url: "/admin/system-tickets", icon: Ticket },
  ],
  Technician: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Tickets", url: "/tickets", icon: Ticket },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    setRole(getSession()?.role ?? null);
  }, [pathname]);

  const items = role ? MENU[role] : [];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="h-12 text-lg font-bold">
            IT Help Desk
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-5">
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton isActive={pathname === item.url}>
                    <item.icon />
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="space-y-4">
          <SidebarMenuItem className="text-lg font-semibold">
            <SidebarMenuButton
              onClick={() => {
                clearToken();
                router.push("/login");
              }}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}