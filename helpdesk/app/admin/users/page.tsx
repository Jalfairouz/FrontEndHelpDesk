"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { getUsers } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { initialsOf } from "@/lib/user-ui";
import { FilterTabs } from "@/components/filter-tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UserDetails } from "@/types";

type RoleFilter = "" | "Admin" | "Technician" | "Employee";

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "Admin", label: "Admins" },
  { value: "Technician", label: "Technicians" },
  { value: "Employee", label: "Employees" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { ready } = useRequireRole(["Admin"]);

  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [role, setRole] = useState<RoleFilter>("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      if (role && user.role !== role) return false;
      if (!q) return true;

      return (
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      );
    });
  }, [users, role, query]);

  if (!ready || loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {visible.length} of {users.length} user{users.length === 1 ? "" : "s"}
          </p>
        </div>

        <Link href="/admin/users/create" className={buttonVariants()}>
          <Plus className="h-4 w-4" />
          New user
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <FilterTabs label="Role" value={role} onChange={setRole} tabs={ROLE_TABS} />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed py-14 text-center text-sm text-muted-foreground">
          No users match your search.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card text-card-foreground">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="pl-4">User</TableHead>
                <TableHead className="hidden w-36 sm:table-cell">Role</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-24 pr-4" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {visible.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">
                          {initialsOf(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-sm sm:table-cell">
                    {user.role}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          user.isActive ? "bg-chart-2" : "bg-muted-foreground/60"
                        )}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>

                  <TableCell className="pr-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}