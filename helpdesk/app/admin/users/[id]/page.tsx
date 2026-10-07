"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "lucide-react";

import { deleteUser, getUserById } from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  const fields = [
    { id: "email", label: "Email", value: user.email },
    { id: "firstName", label: "First Name", value: user.firstName },
    { id: "lastName", label: "Last Name", value: user.lastName },
    { id: "role", label: "Role", value: user.role },
    { id: "status", label: "Status", value: user.isActive ? "Active" : "Inactive" },
  ];

  return (
    <div className="container mx-auto max-w-3xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Profile</CardTitle>
          <CardDescription>View user profile</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            {fields.map((field) => (
              <div className="space-y-2" key={field.id}>
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input id={field.id} value={field.value} disabled />
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <Button
            className="flex-1"
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Back
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}