"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getSession } from "@/lib/auth";
import type { Role } from "@/lib/routes";
import { useSession } from "@/hooks/use-session";

export function useRequireRole(allowed?: readonly Role[]) {
  const router = useRouter();
  const session = useSession();

  const key = allowed?.join(",") ?? "";

  const ready =
    session !== null && (!key || key.split(",").includes(session.role));

  useEffect(() => {
    const current = getSession();

    if (!current) {
      router.replace("/login");
      return;
    }

    if (key && !key.split(",").includes(current.role)) {
      router.replace("/dashboard");
    }
  }, [router, key]);

  return { ready, session, role: session?.role ?? null };
}