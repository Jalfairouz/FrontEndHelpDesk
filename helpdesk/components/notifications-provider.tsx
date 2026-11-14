"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  HttpTransportType,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { toast } from "sonner";

import { useSession } from "@/hooks/use-session";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import { getSession, getToken } from "@/lib/auth";
import type { NotificationItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const PAGE_SIZE = 20;

interface NotificationsContextValue {
  items: NotificationItem[];
  unreadCount: number;
  connected: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const enabled = useSession() !== null;

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        getNotifications({ take: PAGE_SIZE }),
        getUnreadCount(),
      ]);

      setItems(list);
      setUnreadCount(count);
      setHasMore(list.length === PAGE_SIZE);
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notifications`, {
        accessTokenFactory: () => getToken() ?? "",
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Critical)
      .build();

    connection.on("ReceiveNotification", (n: NotificationItem) => {
      setItems((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
      setUnreadCount((c) => c + 1);

      toast(n.title, {
        description: n.message,
        action: {
          label: "View",
          onClick: () => router.push(`/tickets/${n.ticketId}`),
        },
      });
    });

    connection.onreconnecting(() => setConnected(false));

    connection.onreconnected(() => {
      setConnected(true);
      refresh();
    });

    connection.onclose(() => {
      setConnected(false);
      if (!disposed && !getSession()) router.replace("/login");
    });

    async function start() {
      while (!disposed) {
        try {
          await connection.start();

          if (!disposed) {
            setConnected(true);
            refresh();
          }
          return;
        } catch {
          if (disposed) return;
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }
const timer = setTimeout(() => {
      refresh();
      start();
    }, 0);

    return () => {
      disposed = true;
      clearTimeout(timer);
      connection.stop();
    };
  }, [enabled, refresh, router]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const next = await getNotifications({ take: PAGE_SIZE, skip: items.length });

      setItems((prev) => {
        const known = new Set(prev.map((n) => n.id));
        return [...prev, ...next.filter((n) => !known.has(n.id))];
      });
      setHasMore(next.length === PAGE_SIZE);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [items.length, loadingMore, hasMore]);

  const markRead = useCallback(
    async (id: string) => {
      const target = items.find((n) => n.id === id);
      if (!target || target.isRead) return;

      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await markNotificationRead(id);
      } catch {
        refresh();
      }
    },
    [items, refresh]
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  return (
    <NotificationsContext.Provider
      value={{
        items,
        unreadCount,
        connected,
        hasMore,
        loadingMore,
        loadMore,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationsProvider");
  }

  return context;
}