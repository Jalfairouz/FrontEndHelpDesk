"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession, type Session } from "@/lib/auth";
import type { Role } from "@/lib/routes";


export function useRequireRole(allowed?: readonly Role[]) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const key = allowed?.join(",") ?? "";

  useEffect(() => {
    const current = getSession();

    if (!current) {
      router.replace("/login");
      return;
    }

    if (key && !key.split(",").includes(current.role)) {
      router.replace("/dashboard");
      return;
    }

    setSession(current);
    setReady(true);
  }, [router, key]);

  return { ready, session, role: session?.role ?? null };
}