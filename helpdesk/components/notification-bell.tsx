"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { useRequireRole } from "@/hooks/use-require-role";
import { formatDate } from "@/lib/ticket-ui";
import type { NotificationItem } from "@/types";

export function NotificationBell() {
  const { ready } = useRequireRole();


  if (!ready) return null;

  return <NotificationBellInner />;
}

function NotificationBellInner() {
  const router = useRouter();

  const { items, unreadCount, connected, markRead, markAllRead } =
    useNotifications((n: NotificationItem) => {
      toast(n.title, {
        description: n.message,
        action: {
          label: "View",
          onClick: () => router.push(`/tickets/${n.ticketId}`),
        },
      });
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}


        <span
          className={`absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full ${
            connected ? "bg-green-500" : "bg-gray-400"
          }`}
          title={connected ? "Live" : "Reconnecting..."}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">Notifications</span>

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex cursor-pointer flex-col items-start gap-1 py-2"
              onClick={() => {
                markRead(n.id);
                router.push(`/tickets/${n.ticketId}`);
              }}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className={`text-sm ${n.isRead ? "" : "font-semibold"}`}>
                  {n.title}
                </span>

                {!n.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                )}
              </div>

              <span className="text-xs text-muted-foreground">{n.message}</span>
              <span className="text-[11px] text-muted-foreground">
                {formatDate(n.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}