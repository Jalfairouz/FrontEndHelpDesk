"use client";

import { useMemo, useSyncExternalStore } from "react";

import { getToken, sessionFromToken, type Session } from "@/lib/auth";

const subscribe = () => () => {};

export function useSession(): Session | null {
  const token = useSyncExternalStore(subscribe, getToken, () => null);

  return useMemo(() => (token ? sessionFromToken(token) : null), [token]);
}