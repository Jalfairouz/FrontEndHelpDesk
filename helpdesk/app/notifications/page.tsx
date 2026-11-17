"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BellOff, CheckCheck } from "lucide-react";

import { useNotifications } from "@/components/notifications-provider";
import { FilterTabs } from "@/components/filter-tabs";
import { Button } from "@/components/ui/button";
import { useRequireRole } from "@/hooks/use-require-role";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

function dayKey(value: string): string {
  const d = new Date(value);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(value: string): string {
  const d = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(value) === dayKey(today.toISOString())) return "Today";
  if (dayKey(value) === dayKey(yesterday.toISOString())) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeOf(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

  const [filter, setFilter] = useState<Filter>("all");

  const groups = useMemo(() => {
    const source = filter === "unread" ? items.filter((n) => !n.isRead) : items;
    const result: { key: string; label: string; items: typeof items }[] = [];

    for (const n of source) {
      const key = dayKey(n.createdAt);
      const last = result[result.length - 1];

      if (last && last.key === key) {
        last.items.push(n);
      } else {
        result.push({ key, label: dayLabel(n.createdAt), items: [n] });
      }
    }

    return result;
  }, [items, filter]);

  if (!ready) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} unread`
            : "You're all caught up."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <FilterTabs
          label="Filter"
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "all", label: "All" },
            {
              value: "unread",
              label: unreadCount > 0 ? `Unread (${unreadCount})` : "Unread",
            },
          ]}
        />

        <Button
          variant="outline"
          size="sm"
          disabled={unreadCount === 0}
          onClick={markAllRead}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
          <BellOff className="h-6 w-6" />
          {filter === "unread"
            ? "No unread notifications."
            : "Nothing here yet. Updates on your tickets will show up here."}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key} className="space-y-1">
              <h2 className="px-3 text-sm text-muted-foreground">
                {group.label}
              </h2>

              <ul className="divide-y rounded-lg border">
                {group.items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        markRead(n.id);
                        router.push(`/tickets/${n.ticketId}`);
                      }}
                      className={cn(
                        "grid w-full grid-cols-[1rem_minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      <span className="flex h-5 items-center">
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm",
                            !n.isRead && "font-medium"
                          )}
                        >
                          {n.title}
                        </p>
                        <p
                          dir="auto"
                          className="mt-0.5 text-sm text-muted-foreground"
                        >
                          {n.message}
                        </p>
                      </div>

                      <span className="pt-0.5 text-xs text-muted-foreground tabular-nums">
                        {timeOf(n.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

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
        </div>
      )}
    </div>
  );
}