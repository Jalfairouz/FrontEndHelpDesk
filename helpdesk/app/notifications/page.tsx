"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import { useNotifications } from "@/components/notifications-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRequireRole } from "@/hooks/use-require-role";
import { formatDate } from "@/lib/ticket-ui";

export default function NotificationsPage() {
  const router = useRouter();
  const { ready } = useRequireRole();

  const {
    items,
    unreadCount,
    hasMore,
    loadingMore,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  const [onlyUnread, setOnlyUnread] = useState(false);

  const visible = useMemo(
    () => (onlyUnread ? items.filter((n) => !n.isRead) : items),
    [items, onlyUnread]
  );

  if (!ready) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-2 text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>

        <Button variant="outline" disabled={unreadCount === 0} onClick={markAllRead}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={onlyUnread ? "outline" : "default"}
          onClick={() => setOnlyUnread(false)}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={onlyUnread ? "default" : "outline"}
          onClick={() => setOnlyUnread(true)}
        >
          Unread
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Inbox
          </CardTitle>
          <CardDescription>Newest first</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {visible.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {onlyUnread ? "No unread notifications." : "No notifications yet."}
            </div>
          ) : (
            visible.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markRead(n.id);
                  router.push(`/tickets/${n.ticketId}`);
                }}
                className={`w-full rounded-lg border p-4 text-left transition hover:bg-muted/50 ${
                  n.isRead ? "" : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={n.isRead ? "font-medium" : "font-semibold"}>
                    {n.title}
                  </span>

                  {!n.isRead && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      New
                    </Badge>
                  )}
                </div>

                <p dir="auto" className="mt-1 text-sm text-muted-foreground">
                  {n.message}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(n.createdAt)}
                </p>
              </button>
            ))
          )}

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              disabled={loadingMore}
              onClick={loadMore}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}