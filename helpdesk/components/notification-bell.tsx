"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/components/notifications-provider";
import { useSession } from "@/hooks/use-session";
import { formatDateShort } from "@/lib/ticket-ui";
import { cn } from "@/lib/utils";

const BELL_ITEMS = 6;

export function NotificationBell() {
  const router = useRouter();
  const session = useSession();
  const { items, unreadCount, connected, markRead, markAllRead } =
    useNotifications();

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <span
          className={cn(
            "absolute bottom-1 right-1 h-2 w-2 rounded-full ring-2 ring-background",
            connected ? "bg-chart-2" : "bg-muted-foreground/50"
          )}
          title={connected ? "Live" : "Reconnecting..."}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium">Notifications</span>

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          items.slice(0, BELL_ITEMS).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex cursor-pointer items-start gap-3 py-2.5"
              onClick={() => {
                markRead(n.id);
                router.push(`/tickets/${n.ticketId}`);
              }}
            >
              <span className="mt-1.5 flex h-2 w-2 shrink-0">
                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", !n.isRead && "font-medium")}>
                  {n.title}
                </p>
                <p
                  dir="auto"
                  className="line-clamp-2 text-xs text-muted-foreground"
                >
                  {n.message}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                  {formatDateShort(n.createdAt)}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer justify-center text-sm"
          onClick={() => router.push("/notifications")}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}