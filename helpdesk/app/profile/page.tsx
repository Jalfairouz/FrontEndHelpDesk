"use client";

import { useEffect, useState } from "react";

import { getMe } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { initialsOf } from "@/lib/user-ui";
import { FormError, FormPage } from "@/components/form-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeResponse } from "@/types";

export default function ProfilePage() {
  const { ready } = useRequireRole();

  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    getMe()
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <FormPage title="Profile" description="Your account details.">
      {error || !user ? (
        <FormError message={error || "Profile not found."} />
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initialsOf(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-lg font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <dl className="divide-y rounded-lg border">
            {[
              { label: "First name", value: user.firstName },
              { label: "Last name", value: user.lastName },
              { label: "Email", value: user.email },
              { label: "Role", value: user.role },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </FormPage>
  );
}