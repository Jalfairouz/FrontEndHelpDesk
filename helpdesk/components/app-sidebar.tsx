"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Headset,
  LayoutDashboard,
  LogOut,
  Plus,
  ScrollText,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/hooks/use-session";
import { clearToken } from "@/lib/auth";
import type { Role } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: Record<Role, NavGroup[]> = {
  Employee: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "My tickets", url: "/tickets", icon: Ticket },
        { title: "Notifications", url: "/notifications", icon: Bell },
      ],
    },
  ],
  Technician: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Assigned tickets", url: "/tickets", icon: Ticket },
        { title: "Notifications", url: "/notifications", icon: Bell },
      ],
    },
  ],
  Admin: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "System tickets", url: "/admin/system-tickets", icon: Ticket },
        { title: "Notifications", url: "/notifications", icon: Bell },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "Users", url: "/admin/users", icon: Users },
        { title: "API logs", url: "/admin/logs", icon: ScrollText },
      ],
    },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  const role = session?.role ?? null;
  const groups = role ? NAV[role] : [];

  // The active item is the one with the longest matching url.
  const activeUrl = groups
    .flatMap((g) => g.items)
    .filter(
      (item) => pathname === item.url || pathname.startsWith(item.url + "/")
    )
    .sort((a, b) => b.url.length - a.url.length)[0]?.url;

  const email = session?.email ?? "";
  const initials = (email || "U").slice(0, 2).toUpperCase();
  const canCreate = role === "Employee" || role === "Admin";

  return (
    <Sidebar>
      <SidebarHeader className="gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Headset className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-medium">Help Desk</p>
            <p className="text-xs text-sidebar-foreground/60">IT support</p>
          </div>
        </div>

        {canCreate && (
          <Link
            href="/tickets/create"
            className="flex h-9 items-center justify-center gap-2 rounded-md bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New ticket
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const active = item.url === activeUrl;

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={active}
                        render={<Link href={item.url} />}
                        className={cn(
                          "h-9 px-3 font-normal",
                          active &&
                            "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2 rounded-md bg-sidebar-accent/60 p-2">
          <Link
            href="/profile"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-primary text-xs text-sidebar-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm">{email || "Account"}</p>
              <p className="text-xs text-sidebar-foreground/60">{role}</p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={() => {
              clearToken();
              router.push("/login");
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}