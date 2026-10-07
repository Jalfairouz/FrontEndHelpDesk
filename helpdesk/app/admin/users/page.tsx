"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

import { getUsers } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserDetails } from "@/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { ready } = useRequireRole(["Admin"]);

  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (!ready || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage users</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/users/create")}
              >
                Create User
              </Button>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="w-full">
              {users.map((user) => (
                <div className="space-y-4 rounded-lg p-2" key={user.id}>
                  <Card className="relative gap-4">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                        </div>

                        <Badge
                          className={
                            user.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>

                      <CardDescription className="text-sm">
                        {user.role}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </CardContent>

                    <CardFooter className="gap-4 p-4">
                      <Button
                        className="flex-5"
                        variant="outline"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        View
                      </Button>

                      <Button
                        className="flex-2"
                        variant="outline"
                        onClick={() =>
                          router.push(`/admin/users/${user.id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}