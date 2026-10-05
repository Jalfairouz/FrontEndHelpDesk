"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getUserById, deleteUser } from "@/lib/api";
import { getToken, getRole, decodeToken } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserDetails } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [deleteOpen, setDeleteOpen] = useState(false);
 
  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const decoded = decodeToken(token);

      if (!decoded) {
        router.replace("/login");
        return;
      }

      if (getRole(decoded) !== "Admin") {
        router.replace("/dashboard");
        return;
      }

      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load user"
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router, userId]);
  const handleDelete = async () => {
    setError("");
    setLoading(true);   
    try {
      await deleteUser(userId);
      router.push("/admin/users");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user"
      );
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        User not found
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <User className="h-5 w-5 text-muted-foreground" />

          <CardTitle>Profile</CardTitle>

          <CardDescription>
            View user profile
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name
              </Label>

              <Input
                id="firstName"
                value={user.firstName}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name
              </Label>

              <Input
                id="lastName"
                value={user.lastName}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role
              </Label>

              <Input
                id="role"
                value={user.role}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status
              </Label>

              <Input
                id="status"
                value={user.isActive ? "Active" : "Inactive"}
                disabled
              />
            </div>

          </div>
        </CardContent>
        <CardFooter>
            <Button
                className="flex-3"
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

                <AlertDialog open={deleteOpen}>
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
                    <AlertDialogCancel
                        onClick={() => setDeleteOpen(false)}
                    >
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => {
                            handleDelete();
                            setDeleteOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>


              </CardFooter>

      </Card>
    </div>
  );
}
