"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { deleteUser, getUserById } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { initialsOf } from "@/lib/user-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { UserDetails } from "@/types";

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { ready } = useRequireRole(["Admin"]);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    getUserById(userId)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  const handleDelete = async () => {
    setError("");
    setLoading(true);

    try {
      await deleteUser(userId);
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
      setLoading(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error || "User not found."}
        </div>
      </div>
    );
  }

  const rows = [
    { label: "Email", value: user.email },
    { label: "First name", value: user.firstName },
    { label: "Last name", value: user.lastName },
    { label: "Role", value: user.role },
    {
      label: "Status",
      value: (
        <span className="inline-flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              user.isActive ? "bg-chart-2" : "bg-muted-foreground/60"
            )}
          />
          {user.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-4 md:p-8">
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initialsOf(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-medium tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <dl className="divide-y rounded-lg border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. {user.firstName} {user.lastName} will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}