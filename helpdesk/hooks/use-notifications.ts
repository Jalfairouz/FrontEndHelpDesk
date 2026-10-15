"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HttpTransportType,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import { getSession, getToken } from "@/lib/auth";
import type { NotificationItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const PAGE_SIZE = 30;

export function useNotifications(onIncoming?: (n: NotificationItem) => void) {
  const router = useRouter();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);


  const onIncomingRef = useRef(onIncoming);
  useEffect(() => {
    onIncomingRef.current = onIncoming;
  });

  const refresh = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        getNotifications(PAGE_SIZE),
        getUnreadCount(),
      ]);
      setItems(list);
      setUnreadCount(count);
    } catch {

      }
  }, []);

  useEffect(() => {
    let disposed = false;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notifications`, {
        accessTokenFactory: () => getToken() ?? "",
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("ReceiveNotification", (n: NotificationItem) => {
      setItems((prev) =>
        prev.some((x) => x.id === n.id) ? prev : [n, ...prev].slice(0, PAGE_SIZE)
      );
      setUnreadCount((c) => c + 1);
      onIncomingRef.current?.(n);
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
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    refresh();
    start();

    return () => {
      disposed = true;
      connection.stop();
    };
  }, [refresh, router]);

  const markRead = useCallback(
    async (id: string) => {
      const target = items.find((n) => n.id === id);
      if (!target || target.isRead) return;

      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
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

  return { items, unreadCount, connected, markRead, markAllRead };
}