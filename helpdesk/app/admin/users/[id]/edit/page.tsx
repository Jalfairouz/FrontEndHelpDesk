"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  changeUserRole,
  changeUserStatus,
  getUserById,
  updateUser,
} from "@/lib/api";
import { useRequireRole } from "@/hooks/use-require-role";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserDetails } from "@/types";

export default function UpdateUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { ready } = useRequireRole(["Admin"]);

  const [original, setOriginal] = useState<UserDetails | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function loadUser() {
      try {
        const data = await getUserById(userId);
        if (cancelled) return;

        setOriginal(data);
        setEmail(data.email);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setRole(data.role);
        setIsActive(data.isActive);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!original) return;

    setError("");
    setSaving(true);

    try {
      await updateUser(userId, { email, firstName, lastName });

      if (role !== original.role) {
        await changeUserRole(userId, { role });
      }

      if (isActive !== original.isActive) {
        await changeUserStatus(userId, { isActive });
      }

      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!original) {
    return <div className="p-6 text-red-500">{error || "User not found"}</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit User Information</CardTitle>
            <CardDescription>Update profile, role and status</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Mohammed"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Fahad"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                {original.role === "Admin" && (
                  <option value="Admin">Admin</option>
                )}
                <option value="Technician">Technician</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <select
                id="isActive"
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Button className="w-full" type="submit" disabled={saving}>
          {saving ? "Updating..." : "Update"}
        </Button>

        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
}